'use client';

import {
  Suspense,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import {
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  MailCheck,
} from 'lucide-react';

import { authAPI } from '@/lib/api';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get('token');

  const verificationStarted = useRef(false);

  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (verificationStarted.current) {
      return;
    }

    verificationStarted.current = true;

    if (!token || typeof token !== 'string') {
      setStatus('error');
      setMessage(
        'This verification link is missing a valid token.'
      );
      return;
    }

    let cancelled = false;

    const verify = async () => {
      try {
        setStatus('loading');

        const result = await authAPI.verifyEmail(token);

        if (cancelled) {
          return;
        }

        if (result?.success) {
          setStatus('success');

          setMessage(
            result.message ||
              'Your email has been verified successfully.'
          );

          /*
           * Remove token from browser URL after successful
           * verification.
           *
           * The token is NOT stored anywhere.
           */
          window.history.replaceState(
            {},
            '',
            '/verify-email'
          );

          return;
        }

        setStatus('error');

        setMessage(
          result?.error ||
            'This verification link is invalid or has expired.'
        );
      } catch (error) {
        console.error(
          'Email verification frontend error:',
          error
        );

        if (!cancelled) {
          setStatus('error');
          setMessage(
            'Could not verify your email right now. Please try again.'
          );
        }
      }
    };

    verify();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080b14] p-10 font-[Inter,Arial,Helvetica,sans-serif] max-[768px]:min-h-[100dvh] max-[768px]:p-5 max-[480px]:items-start max-[480px]:p-3 max-[480px]:pt-[18px]">

      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-[image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] bg-[length:45px_45px] opacity-[0.035]" />

      <div className="pointer-events-none absolute -top-[260px] -left-[200px] h-[450px] w-[450px] rounded-full bg-[rgba(99,102,241,0.18)] blur-[120px]" />

      <div className="pointer-events-none absolute -right-[250px] -bottom-[280px] h-[450px] w-[450px] rounded-full bg-[rgba(124,58,237,0.18)] blur-[120px]" />

      {/* Card */}
      <div className="relative z-[2] w-full max-w-[460px] rounded-[26px] border border-white/[0.08] bg-[rgba(13,17,29,0.94)] p-[46px] text-center shadow-[0_35px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl max-[480px]:rounded-[18px] max-[480px]:p-8">

        {/* Brand */}
        <div className="mx-auto mb-6 flex h-11 w-11 items-center justify-center rounded-[13px] bg-[linear-gradient(135deg,#667eea,#764ba2)] shadow-[0_10px_30px_rgba(102,126,234,.25)]">
          <Sparkles size={24} />
        </div>

        {/* Loading */}
        {status === 'loading' && (
          <>
            <div className="mx-auto mb-6 flex h-[74px] w-[74px] items-center justify-center rounded-full bg-[rgba(129,140,248,0.08)]">
              <div className="h-[42px] w-[42px] animate-spin rounded-full border-4 border-white/[0.12] border-t-[#818cf8]" />
            </div>

            <h1 className="mb-3 text-[24px] font-[750] tracking-[-0.5px] text-[#f5f7fb]">
              Verifying your email...
            </h1>

            <p className="mx-auto max-w-[340px] text-[12px] leading-[1.7] text-[#818ca0]">
              Please wait while we securely confirm your
              verification link.
            </p>
          </>
        )}

        {/* Success */}
        {status === 'success' && (
          <>
            <div className="mx-auto mb-6 flex h-[74px] w-[74px] items-center justify-center rounded-full border border-[rgba(110,231,183,0.14)] bg-[rgba(110,231,183,0.08)]">
              <CheckCircle2
                size={38}
                className="text-[#6ee7b7]"
                strokeWidth={1.8}
              />
            </div>

            <h1 className="mb-3 text-[24px] font-[750] tracking-[-0.5px] text-[#f5f7fb]">
              Email verified
            </h1>

            <p className="mx-auto mb-7 max-w-[340px] text-[12px] leading-[1.7] text-[#818ca0]">
              {message}
              {' '}
              You can now sign in to your account.
            </p>

            <button
              type="button"
              onClick={() => router.replace('/login')}
              className="flex h-[49px] w-full items-center justify-center gap-2 rounded-[10px] border-0 bg-[linear-gradient(135deg,#667eea,#764ba2)] text-[12px] font-[750] text-white shadow-[0_10px_30px_rgba(102,126,234,0.2)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_15px_35px_rgba(102,126,234,0.3)]"
            >
              Continue to Login
              <ArrowRight size={16} />
            </button>
          </>
        )}

        {/* Error */}
        {status === 'error' && (
          <>
            <div className="mx-auto mb-6 flex h-[74px] w-[74px] items-center justify-center rounded-full border border-[rgba(248,113,113,0.14)] bg-[rgba(248,113,113,0.08)]">
              <XCircle
                size={38}
                className="text-[#fca5a5]"
                strokeWidth={1.8}
              />
            </div>

            <h1 className="mb-3 text-[24px] font-[750] tracking-[-0.5px] text-[#f5f7fb]">
              Verification failed
            </h1>

            <p className="mx-auto mb-6 max-w-[340px] text-[12px] leading-[1.7] text-[#818ca0]">
              {message}
            </p>

            <div className="mb-5 rounded-[10px] border border-[rgba(129,140,248,0.12)] bg-[rgba(129,140,248,0.045)] p-3 text-left">
              <div className="flex gap-2">
                <MailCheck
                  size={16}
                  className="mt-[1px] flex-shrink-0 text-[#8b95f9]"
                />

                <p className="m-0 text-[10px] leading-[1.6] text-[#69758a]">
                  If the link has expired, go back to login and
                  request a new verification email.
                </p>
              </div>
            </div>

            <Link
              href="/login"
              className="flex h-[49px] w-full items-center justify-center gap-2 rounded-[10px] bg-[linear-gradient(135deg,#667eea,#764ba2)] text-[12px] font-[750] text-white no-underline shadow-[0_10px_30px_rgba(102,126,234,0.2)] transition-all duration-200 hover:-translate-y-px"
            >
              Back to Login
            </Link>
          </>
        )}

      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#080b14]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/[0.12] border-t-[#818cf8]" />
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}