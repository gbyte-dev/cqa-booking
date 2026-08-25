'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { notifyError, notifyWarning } from '@/lib/alerts';

const cardElementStyle = {
  style: {
    base: {
      fontSize: '13px',
      color: '#202a33',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      '::placeholder': { color: '#a1a8af' }
    },
    invalid: { color: '#a33b3b' }
  }
};

const payButtonClass =
  'flex h-[46px] w-full items-center justify-center gap-2 rounded-[7px] border-0 bg-[#1d2731] text-[13px] font-semibold text-white cursor-pointer transition-[background-color,transform] duration-150 ease hover:bg-[#2b3945] disabled:cursor-not-allowed disabled:opacity-65';

// ===== STRIPE =====
const stripePromiseCache = {};
function getStripePromise(publicKey) {
  if (!publicKey) return null;
  if (!stripePromiseCache[publicKey]) {
    stripePromiseCache[publicKey] = loadStripe(publicKey);
  }
  return stripePromiseCache[publicKey];
}

function StripeInnerForm({ clientSecret, billingName, billingEmail, onPaid, submitting, setSubmitting, setError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardComplete, setCardComplete] = useState(false);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || submitting) return;

    setSubmitting(true);
    setError('');

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: { name: billingName, email: billingEmail }
      }
    });

    if (result.error) {
      const message = result.error.message || 'Your card was declined. Please try again.';
      setError(message);
      notifyError(message, 'Payment failed');
      setSubmitting(false);
      return;
    }

    if (result.paymentIntent?.status === 'succeeded') {
      await onPaid({ paymentIntentId: result.paymentIntent.id });
    } else {
      const message = 'Payment could not be completed. Please try again.';
      setError(message);
      notifyError(message, 'Payment failed');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handlePay}>
      <div className="mb-5">
        <label className="mb-[7px] block text-xs font-semibold text-[#39444e]">Card details</label>
        <div className="rounded-[7px] border border-[#d9dde1] bg-white px-3 py-3 focus-within:border-[#65717c] focus-within:shadow-[0_0_0_3px_rgba(29,39,49,0.06)]">
          <CardElement options={cardElementStyle} onChange={(e) => setCardComplete(e.complete)} />
        </div>
      </div>

      <button type="submit" className={payButtonClass} disabled={!stripe || !cardComplete || submitting}>
        {submitting ? (
          <>
            <span className="h-[15px] w-[15px] animate-[spin_0.7s_linear_infinite] rounded-full border-2 border-white/30 border-t-white"></span>
            Processing payment...
          </>
        ) : (
          'Pay and complete registration'
        )}
      </button>
    </form>
  );
}

function StripeCheckout({ session, publicKey, billingName, billingEmail, onPaid, submitting, setSubmitting, setError }) {
  const stripePromise = getStripePromise(publicKey);

  if (!stripePromise) {
    return <div className="text-xs text-[#a33b3b]">Stripe is not configured correctly.</div>;
  }

  return (
    <Elements stripe={stripePromise}>
      <StripeInnerForm
        clientSecret={session.clientSecret}
        billingName={billingName}
        billingEmail={billingEmail}
        onPaid={onPaid}
        submitting={submitting}
        setSubmitting={setSubmitting}
        setError={setError}
      />
    </Elements>
  );
}

// ===== RAZORPAY =====
function RazorpayCheckout({ session, billingName, billingEmail, onPaid, submitting, setSubmitting, setError }) {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const openCheckout = () => {
    if (typeof window === 'undefined' || !window.Razorpay) {
      setError('Razorpay checkout could not be loaded. Please try again.');
      return;
    }

    setError('');
    const rzp = new window.Razorpay({
      key: session.keyId,
      amount: session.amount,
      currency: session.currency,
      order_id: session.orderId,
      name: 'Aventa Core',
      description: 'Subscription payment',
      prefill: { name: billingName, email: billingEmail },
      handler: (response) => {
        setSubmitting(true);
        onPaid({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        });
      },
      modal: {
        ondismiss: () => {
          setSubmitting(false);
          notifyWarning('Payment was cancelled before it could be completed.', 'Payment cancelled');
        }
      }
    });

    rzp.on('payment.failed', (resp) => {
      const message = resp.error?.description || 'Payment failed. Please try again.';
      setError(message);
      notifyError(message, 'Payment failed');
      setSubmitting(false);
    });

    rzp.open();
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" onLoad={() => setScriptLoaded(true)} />
      <button type="button" onClick={openCheckout} disabled={!scriptLoaded || submitting} className={payButtonClass}>
        {submitting ? 'Processing payment...' : 'Pay with Razorpay'}
      </button>
    </>
  );
}

// ===== PAYPAL =====
function PayPalCheckout({ session, onPaid, submitting, setSubmitting, setError }) {
  const [sdkReady, setSdkReady] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!sdkReady || typeof window === 'undefined' || !window.paypal || !containerRef.current) return;

    containerRef.current.innerHTML = '';
    window.paypal
      .Buttons({
        createOrder: () => session.orderId,
        onApprove: (data) => {
          setSubmitting(true);
          setError('');
          return onPaid({ orderId: data.orderID || session.orderId });
        },
        onError: () => {
          setError('PayPal checkout failed. Please try again.');
          notifyError('PayPal checkout failed. Please try again.', 'Payment failed');
          setSubmitting(false);
        },
        onCancel: () => {
          setSubmitting(false);
          notifyWarning('Payment was cancelled before it could be completed.', 'Payment cancelled');
        }
      })
      .render(containerRef.current);
  }, [sdkReady, session.orderId, onPaid, setSubmitting, setError]);

  return (
    <>
      <Script src={`https://www.paypal.com/sdk/js?client-id=${session.clientId}&currency=${session.currency || 'USD'}`} onLoad={() => setSdkReady(true)} />
      <div ref={containerRef} />
      {submitting && <p className="mt-3 text-xs text-[#7b858e]">Finalizing your payment...</p>}
    </>
  );
}

// ===== PAYTM =====
function PaytmCheckout({ session, onPaid, submitting, setSubmitting, setError }) {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!scriptLoaded || typeof window === 'undefined' || !window.Paytm?.CheckoutJS) return;

    window.Paytm.CheckoutJS.init({
      root: '',
      flow: 'DEFAULT',
      data: { orderId: session.orderId, token: session.txnToken, tokenType: 'TXN_TOKEN', amount: session.amount },
      handler: {
        notifyMerchant: (eventName) => {
          // Paytm's primary confirmation path is the server-side callbackUrl (the
          // webhook), which independently verifies and activates the subscription.
          // This client-side hook just triggers our own status check once the
          // widget reports the user finished interacting with it.
          if (eventName === 'APP_CLOSED') {
            setSubmitting(true);
            onPaid({ orderId: session.orderId });
          }
        }
      }
    }).catch(() => {
      setError('Could not initialize Paytm checkout.');
      notifyError('Could not initialize Paytm checkout.', 'Payment failed');
    });
  }, [scriptLoaded, session, onPaid, setSubmitting, setError]);

  const openCheckout = () => {
    if (typeof window === 'undefined' || !window.Paytm?.CheckoutJS) {
      setError('Paytm checkout could not be loaded. Please try again.');
      return;
    }
    setError('');
    window.Paytm.CheckoutJS.invoke();
  };

  return (
    <>
      <Script src={`https://securegw-stage.paytm.in/merchantpgpui/checkoutjs/merchants/${session.mid}.js`} onLoad={() => setScriptLoaded(true)} />
      <button type="button" onClick={openCheckout} disabled={!scriptLoaded || submitting} className={payButtonClass}>
        {submitting ? 'Processing payment...' : 'Pay with Paytm'}
      </button>
    </>
  );
}

// ===== DISPATCHER =====
export default function PaymentStep({ session, publicKey, billingName, billingEmail, onPaid, submitting, setSubmitting, setError }) {
  if (!session) {
    return (
      <div className="flex items-center gap-2 text-xs text-[#7b858e]">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#e5e7eb] border-t-[#667eea]" />
        Preparing secure payment...
      </div>
    );
  }

  const props = { session, publicKey, billingName, billingEmail, onPaid, submitting, setSubmitting, setError };

  switch (session.provider) {
    case 'stripe':
      return <StripeCheckout {...props} />;
    case 'razorpay':
      return <RazorpayCheckout {...props} />;
    case 'paypal':
      return <PayPalCheckout {...props} />;
    case 'paytm':
      return <PaytmCheckout {...props} />;
    default:
      return <div className="text-xs text-[#a33b3b]">Unsupported payment method.</div>;
  }
}
