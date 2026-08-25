'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2, User, Mail, Phone, Lock, Eye, EyeOff,
  ArrowRight, ArrowLeft, MapPin, Globe, Check, Sparkles,
} from 'lucide-react';
import { authAPI } from '@/lib/api';
import { storage } from '@/lib/storage';
import PaymentStep from './PaymentStep';

const STEP_LABELS = ['Account', 'Business', 'Outlet', 'Plan', 'Payment'];

const VENUE_TYPES = [
  { value: 'restaurant', label: 'Independent Restaurant' },
  { value: 'bar_lounge', label: 'Bar / Lounge' },
  { value: 'cafe', label: 'Café' },
  { value: 'beach_club', label: 'Beach Club' },
  { value: 'other', label: 'Other hospitality concept' },
];

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'Europe/London',
  'Asia/Tokyo',
  'Asia/Kolkata',
  'Australia/Sydney',
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'AUD'];

const DRAFT_KEY = 'aventaOwnerRegistrationDraft';

const emptyDraft = {
  owner: {
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  },
  business: {
    name: '',
    slug: '',
    businessType: '',
  },
  outlet: {
    name: '',
    venueType: '',
    currency: 'USD',
    timezone: 'UTC',
    contactEmail: '',
    contactPhone: '',
    address: '',
  },
  planId: '',
};

const slugify = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

/* =========================================================
   DARK THEME STYLE TOKENS (matches /login)
========================================================= */

const inputClass =
  "h-[49px] w-full rounded-[10px] border border-[#252d3e] bg-[#0e1320] px-[43px] text-[12px] text-[#edf0f6] outline-none transition-all duration-200 placeholder:text-[#4f596c] focus:border-[#707bea] focus:bg-[#101625] focus:shadow-[0_0_0_3px_rgba(112,123,234,0.09)] disabled:cursor-not-allowed disabled:opacity-[0.55]";

const selectClass =
  "h-[49px] w-full rounded-[10px] border border-[#252d3e] bg-[#0e1320] px-[15px] text-[12px] text-[#edf0f6] outline-none transition-all duration-200 focus:border-[#707bea] focus:bg-[#101625] focus:shadow-[0_0_0_3px_rgba(112,123,234,0.09)]";

const labelClass =
  "block mb-2 text-[11px] font-[650] text-[#c8ced9]";

const iconWrapClass =
  "pointer-events-none absolute top-1/2 left-[14px] -translate-y-1/2 text-[#59657a]";

const hintClass = "mt-[6px] block text-[10px] text-[#69758a]";

const payButtonClass =
  "flex h-[50px] w-full items-center justify-center gap-[9px] rounded-[10px] border-0 bg-[linear-gradient(135deg,#667eea,#764ba2)] text-[12px] font-[750] text-white cursor-pointer shadow-[0_10px_30px_rgba(102,126,234,0.2)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_15px_35px_rgba(102,126,234,0.3)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:shadow-none max-[480px]:h-[49px]";

const secondaryButtonClass =
  "flex h-[50px] items-center gap-2 rounded-[10px] border border-[#252d3e] bg-[#0e1320] px-4 text-[12px] font-[650] text-[#c8ced9] cursor-pointer transition-colors duration-200 hover:border-[#38435a] hover:text-[#edf0f6] disabled:cursor-not-allowed disabled:opacity-65 max-[480px]:h-[49px]";

const PUBLIC_FIELD_BY_PROVIDER = {
  stripe: 'publicKey',
  razorpay: 'keyId',
  paypal: 'clientId',
  paytm: null,
};

/* =========================================================
   FRONTEND VALIDATION HELPERS
========================================================= */

/**
 * Phone validation rules:
 *
 * Without country code:
 *   9876543210       -> valid
 *   987654321        -> invalid
 *   98765432101      -> invalid
 *
 * With country code:
 *   +919876543210    -> valid
 *   +14155552671     -> valid
 *   +441234567890    -> valid
 *
 * International E.164-style:
 *   + followed by 10-15 total digits.
 *
 * Spaces, hyphens and brackets are allowed for user input,
 * but are removed before validation/submission.
 */
const normalizePhone = (value = '') => {
  return value
    .trim()
    .replace(/[\s()-]/g, '');
};

const validatePhoneNumber = (value, fieldName = 'Phone') => {
  const phone = value.trim();

  // Phone is optional in this form.
  if (!phone) {
    return null;
  }

  // Only +, digits, spaces, -, (, ) are accepted.
  if (!/^[+0-9\s()-]+$/.test(phone)) {
    return `${fieldName} can contain only numbers, spaces, hyphens, brackets and an optional + country code.`;
  }

  const normalized = normalizePhone(phone);

  // + country code format.
  if (normalized.startsWith('+')) {
    const digits = normalized.slice(1);

    if (!/^\d+$/.test(digits)) {
      return `${fieldName} contains an invalid country code or phone number.`;
    }

    if (digits.length < 10 || digits.length > 15) {
      return `${fieldName} must contain 10 to 15 digits when using a country code.`;
    }

    return null;
  }

  // No country code:
  // exactly 10 digits.
  if (!/^\d{10}$/.test(normalized)) {
    return `${fieldName} must contain exactly 10 digits if no country code is provided.`;
  }

  return null;
};

const normalizePhoneForSubmit = (value = '') => {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  // Preserve + country code, remove formatting characters.
  if (trimmed.startsWith('+')) {
    return `+${trimmed.slice(1).replace(/\D/g, '')}`;
  }

  return trimmed.replace(/\D/g, '');
};

const validateEmail = (value, fieldName = 'Email') => {
  const email = value.trim();

  if (!email) {
    return `${fieldName} is required.`;
  }

  if (email.length > 254) {
    return `${fieldName} is too long.`;
  }

  const emailRegex =
    /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

  if (!emailRegex.test(email)) {
    return `Please enter a valid ${fieldName.toLowerCase()}.`;
  }

  return null;
};

const validateFullName = (value) => {
  const name = value.trim();

  if (!name) {
    return 'Full name is required.';
  }

  if (name.length < 2) {
    return 'Full name must be at least 2 characters.';
  }

  if (name.length > 100) {
    return 'Full name must not exceed 100 characters.';
  }

  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' .-]+$/.test(name)) {
    return 'Full name contains invalid characters.';
  }

  return null;
};

const validateBusinessName = (value) => {
  const name = value.trim();

  if (!name) {
    return 'Business name is required.';
  }

  if (name.length < 2) {
    return 'Business name must be at least 2 characters.';
  }

  if (name.length > 150) {
    return 'Business name must not exceed 150 characters.';
  }

  return null;
};

const validateSlug = (value) => {
  const slug = value.trim();

  if (!slug) {
    return 'Business slug is required.';
  }

  if (slug.length < 2) {
    return 'Business slug must be at least 2 characters.';
  }

  if (slug.length > 100) {
    return 'Business slug must not exceed 100 characters.';
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return 'Business slug can contain only lowercase letters, numbers and single hyphens.';
  }

  return null;
};

const validateOutletName = (value) => {
  const name = value.trim();

  if (!name) {
    return 'Outlet name is required.';
  }

  if (name.length < 2) {
    return 'Outlet name must be at least 2 characters.';
  }

  if (name.length > 150) {
    return 'Outlet name must not exceed 150 characters.';
  }

  return null;
};

const validateAddress = (value) => {
  const address = value.trim();

  if (!address) {
    return null;
  }

  if (address.length > 500) {
    return 'Address must not exceed 500 characters.';
  }

  return null;
};

/* =========================================================
   STEP INDICATOR
========================================================= */

function StepIndicator({ step }) {
  return (
    <div className="mb-7 flex items-center">
      {STEP_LABELS.map((label, i) => {
        const idx = i + 1;
        const completed = idx < step;
        const active = idx === step;

        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            {i > 0 && (
              <div
                className={`h-[2px] flex-1 ${
                  idx <= step ? 'bg-[linear-gradient(135deg,#667eea,#764ba2)]' : 'bg-[#1d2333]'
                }`}
              />
            )}

            <div className="flex w-[62px] max-[600px]:w-[46px] flex-none flex-col items-center gap-[5px]">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-colors duration-200 ${
                  completed
                    ? 'bg-[linear-gradient(135deg,#667eea,#764ba2)] text-white shadow-[0_0_0_3px_rgba(112,123,234,0.15)]'
                    : active
                    ? 'border-2 border-[#707bea] text-[#a5b4fc] shadow-[0_0_0_3px_rgba(112,123,234,0.12)]'
                    : 'border border-[#252d3e] bg-[#0e1320] text-[#4f596c]'
                }`}
              >
                {completed ? <Check size={12} /> : idx}
              </div>

              <span
                className={`text-center text-[9px] max-[600px]:text-[8px] font-semibold uppercase tracking-wide ${
                  active || completed ? 'text-[#c8ced9]' : 'text-[#4f596c]'
                }`}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
   FEATURE ROW (left brand panel)
========================================================= */

function Feature({ title, text }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-[25px] w-[25px] flex-shrink-0 items-center justify-center rounded-[7px] bg-[rgba(129,140,248,0.1)] text-[#9da8ff]">
        <Check size={13} />
      </div>

      <div>
        <strong className="block mb-[3px] text-[12px] text-[#dce1ea]">{title}</strong>
        <p className="m-0 text-[11px] leading-[1.5] text-[#69758a]">{text}</p>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function OwnerRegisterWizard() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState(emptyDraft);
  const [hydrated, setHydrated] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);

  const [gateways, setGateways] = useState([]);
  const [gatewaysLoading, setGatewaysLoading] = useState(false);
  const [gatewaysFetched, setGatewaysFetched] = useState(false);

  const [selectedProvider, setSelectedProvider] = useState('');
  const [checkoutSession, setCheckoutSession] = useState(null);
  const [checkoutStarting, setCheckoutStarting] = useState(false);

  /* =========================================================
     RESTORE DRAFT
  ========================================================= */

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (parsed.draft) {
          setDraft({
            ...emptyDraft,
            ...parsed.draft,
            owner: {
              ...emptyDraft.owner,
              ...(parsed.draft.owner || {}),
            },
            business: {
              ...emptyDraft.business,
              ...(parsed.draft.business || {}),
            },
            outlet: {
              ...emptyDraft.outlet,
              ...(parsed.draft.outlet || {}),
            },
          });
        }

        if (parsed.step) {
          setStep(Math.min(parsed.step, 4));
        }
      }
    } catch {
      // Ignore corrupted draft.
    }

    setHydrated(true);
  }, []);

  /* =========================================================
     SAVE DRAFT
  ========================================================= */

  useEffect(() => {
    if (!hydrated) return;

    sessionStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        step,
        draft,
      })
    );
  }, [step, draft, hydrated]);

  /* =========================================================
     LOAD SUBSCRIPTION PLANS
  ========================================================= */

  useEffect(() => {
    if (step !== 4 || plans.length > 0 || plansLoading) {
      return;
    }

    setPlansLoading(true);

    authAPI
      .getSubscriptionPlans()
      .then((res) => {
        if (res.success) {
          setPlans(res.data || []);
        } else {
          setError(res.error || 'Could not load subscription plans.');
        }
      })
      .catch(() => {
        setError('Could not load subscription plans.');
      })
      .finally(() => {
        setPlansLoading(false);
      });
  }, [step, plans.length, plansLoading]);

  const selectedPlan = plans.find((p) => p.id === draft.planId);

  const isFreePlan = !!selectedPlan && Number(selectedPlan.price) <= 0;

  /* =========================================================
     LOAD PAYMENT GATEWAYS
  ========================================================= */

  useEffect(() => {
    if (
      step !== 5 ||
      isFreePlan ||
      !selectedPlan ||
      gatewaysFetched ||
      gatewaysLoading
    ) {
      return;
    }

    setGatewaysLoading(true);

    authAPI
      .getOwnerPaymentGateways()
      .then((res) => {
        const list = res.success ? res.data || [] : [];

        setGateways(list);

        if (list.length === 1) {
          setSelectedProvider(list[0].provider);
        }

        if (!res.success) {
          setError(res.error || 'Could not load payment methods.');
        }
      })
      .catch(() => {
        setError('Could not load payment methods.');
      })
      .finally(() => {
        setGatewaysLoading(false);
        setGatewaysFetched(true);
      });
  }, [step, isFreePlan, selectedPlan, gatewaysFetched, gatewaysLoading]);

  /* =========================================================
     STATE UPDATE HELPERS
  ========================================================= */

  const updateOwner = (field, value) => {
    setDraft((d) => ({
      ...d,
      owner: {
        ...d.owner,
        [field]: value,
      },
    }));
  };

  const updateBusiness = (field, value) => {
    setDraft((d) => ({
      ...d,
      business: {
        ...d.business,
        [field]: value,
      },
    }));
  };

  const updateOutlet = (field, value) => {
    setDraft((d) => ({
      ...d,
      outlet: {
        ...d.outlet,
        [field]: value,
      },
    }));
  };

  /* =========================================================
     BUSINESS NAME
  ========================================================= */

  const handleBusinessNameChange = (value) => {
    setDraft((d) => ({
      ...d,
      business: {
        ...d.business,
        name: value,
        slug: slugTouched ? d.business.slug : slugify(value),
      },
    }));
  };

  /* =========================================================
     PHONE INPUT HANDLER
  ========================================================= */

  const handlePhoneChange = (field, value) => {
    let cleaned = value.replace(/[^0-9+()\s-]/g, '');

    // + can exist only at the beginning.
    if (cleaned.includes('+')) {
      cleaned =
        cleaned.charAt(0) === '+'
          ? `+${cleaned.slice(1).replace(/\+/g, '')}`
          : cleaned.replace(/\+/g, '');
    }

    // Prevent excessive raw input.
    const digits = cleaned.replace(/\D/g, '');

    if (digits.length > 15) {
      return;
    }

    updateOwner(field, cleaned);
  };

  const handleOutletPhoneChange = (field, value) => {
    let cleaned = value.replace(/[^0-9+()\s-]/g, '');

    if (cleaned.includes('+')) {
      cleaned =
        cleaned.charAt(0) === '+'
          ? `+${cleaned.slice(1).replace(/\+/g, '')}`
          : cleaned.replace(/\+/g, '');
    }

    const digits = cleaned.replace(/\D/g, '');

    if (digits.length > 15) {
      return;
    }

    updateOutlet(field, cleaned);
  };

  /* =========================================================
     STEP 1 VALIDATION
  ========================================================= */

  const validateStep1 = () => {
    const fullNameError = validateFullName(draft.owner.fullName);

    if (fullNameError) {
      return fullNameError;
    }

    const emailError = validateEmail(draft.owner.email, 'Email');

    if (emailError) {
      return emailError;
    }

    const phoneError = validatePhoneNumber(draft.owner.phone, 'Phone number');

    if (phoneError) {
      return phoneError;
    }

    if (!draft.owner.password) {
      return 'Password is required.';
    }

    if (draft.owner.password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }

    if (draft.owner.password.length > 128) {
      return 'Password must not exceed 128 characters.';
    }

    if (!draft.owner.confirmPassword) {
      return 'Please confirm your password.';
    }

    if (draft.owner.password !== draft.owner.confirmPassword) {
      return 'Passwords do not match.';
    }

    return null;
  };

  /* =========================================================
     STEP 2 VALIDATION
  ========================================================= */

  const validateStep2 = () => {
    const businessNameError = validateBusinessName(draft.business.name);

    if (businessNameError) {
      return businessNameError;
    }

    const slugError = validateSlug(draft.business.slug);

    if (slugError) {
      return slugError;
    }

    if (!draft.business.businessType) {
      return 'Please select a business type.';
    }

    const validBusinessType = VENUE_TYPES.some(
      (type) => type.value === draft.business.businessType
    );

    if (!validBusinessType) {
      return 'Please select a valid business type.';
    }

    return null;
  };

  /* =========================================================
     STEP 3 VALIDATION
  ========================================================= */

  const validateStep3 = () => {
    const outletNameError = validateOutletName(draft.outlet.name);

    if (outletNameError) {
      return outletNameError;
    }

    if (!CURRENCIES.includes(draft.outlet.currency)) {
      return 'Please select a valid currency.';
    }

    if (!TIMEZONES.includes(draft.outlet.timezone)) {
      return 'Please select a valid timezone.';
    }

    if (draft.outlet.contactEmail.trim()) {
      const emailError = validateEmail(draft.outlet.contactEmail, 'Contact email');

      if (emailError) {
        return emailError;
      }
    }

    const contactPhoneError = validatePhoneNumber(draft.outlet.contactPhone, 'Contact phone');

    if (contactPhoneError) {
      return contactPhoneError;
    }

    const addressError = validateAddress(draft.outlet.address);

    if (addressError) {
      return addressError;
    }

    return null;
  };

  /* =========================================================
     STEP 4 VALIDATION
  ========================================================= */

  const validateStep4 = () => {
    if (!draft.planId) {
      return 'Please select a subscription plan.';
    }

    if (!selectedPlan) {
      return 'Selected subscription plan is not available.';
    }

    if (Number.isNaN(Number(selectedPlan.price))) {
      return 'Selected subscription plan has an invalid price.';
    }

    return null;
  };

  /* =========================================================
     COMPLETE FORM VALIDATION
  ========================================================= */

  const validateEntireForm = () => {
    const step1Error = validateStep1();

    if (step1Error) {
      return step1Error;
    }

    const step2Error = validateStep2();

    if (step2Error) {
      return step2Error;
    }

    const step3Error = validateStep3();

    if (step3Error) {
      return step3Error;
    }

    const step4Error = validateStep4();

    if (step4Error) {
      return step4Error;
    }

    return null;
  };

  /* =========================================================
     HANDLE CONTINUE
  ========================================================= */

  const handleContinue = async () => {
    setError('');

    if (step === 1) {
      const err = validateStep1();

      if (err) {
        return setError(err);
      }

      return setStep(2);
    }

    if (step === 2) {
      const err = validateStep2();

      if (err) {
        return setError(err);
      }

      setLoading(true);

      try {
        const res = await authAPI.validateOwnerStep({
          email: draft.owner.email.trim().toLowerCase(),
          slug: draft.business.slug.trim(),
        });

        if (res.success && res.data?.valid) {
          setStep(3);
        } else {
          const errors = res.data?.errors || {};

          const messages = [errors.email, errors.slug].filter(Boolean);

          setError(messages.join(' ') || 'Please review your details and try again.');
        }
      } catch {
        setError('Could not validate your details. Please try again.');
      } finally {
        setLoading(false);
      }

      return;
    }

    if (step === 3) {
      const err = validateStep3();

      if (err) {
        return setError(err);
      }

      if (!draft.outlet.venueType) {
        setDraft((d) => ({
          ...d,
          outlet: {
            ...d.outlet,
            venueType: d.business.businessType,
          },
        }));
      }

      return setStep(4);
    }

    if (step === 4) {
      const err = validateStep4();

      if (err) {
        return setError(err);
      }

      return setStep(5);
    }
  };

  /* =========================================================
     BACK
  ========================================================= */

  const handleBack = () => {
    setError('');

    if (step === 5) {
      setCheckoutSession(null);
      setGateways([]);
      setGatewaysFetched(false);
      setSelectedProvider('');
    }

    setStep((s) => Math.max(1, s - 1));
  };

  /* =========================================================
     FINISH REGISTRATION
  ========================================================= */

  const finishRegistration = ({ user, organization, token }) => {
    storage.setToken(token);
    storage.setUser(user);
    storage.setOrganization(organization);

    sessionStorage.removeItem(DRAFT_KEY);

    router.push('/tenant/dashboard');
  };

  /* =========================================================
     START CHECKOUT
  ========================================================= */

  const startCheckout = async () => {
    setError('');

    // Final frontend validation before API call.
    const validationError = validateEntireForm();

    if (validationError) {
      setError(validationError);

      // Move user to the step where error exists.
      if (
        validationError.includes('Full name') ||
        validationError.includes('Email') ||
        validationError.includes('Phone') ||
        validationError.includes('Password') ||
        validationError.includes('password')
      ) {
        setStep(1);
      } else if (
        validationError.includes('Business') ||
        validationError.includes('business') ||
        validationError.includes('slug')
      ) {
        setStep(2);
      } else if (
        validationError.includes('Outlet') ||
        validationError.includes('outlet') ||
        validationError.includes('Contact') ||
        validationError.includes('Address') ||
        validationError.includes('currency') ||
        validationError.includes('timezone')
      ) {
        setStep(3);
      } else if (
        validationError.includes('subscription') ||
        validationError.includes('plan')
      ) {
        setStep(4);
      }

      return;
    }

    setCheckoutStarting(true);

    try {
      const normalizedOwnerPhone = normalizePhoneForSubmit(draft.owner.phone);

      const normalizedContactPhone = normalizePhoneForSubmit(draft.outlet.contactPhone);

      const res = await authAPI.createOwnerPaymentIntent({
        owner: {
          fullName: draft.owner.fullName.trim(),
          email: draft.owner.email.trim().toLowerCase(),
          phone: normalizedOwnerPhone,
          password: draft.owner.password,
        },

        business: {
          name: draft.business.name.trim(),
          slug: draft.business.slug.trim(),
        },

        outlet: {
          ...draft.outlet,
          contactEmail: draft.outlet.contactEmail.trim().toLowerCase(),
          contactPhone: normalizedContactPhone,
          address: draft.outlet.address.trim(),
          venueType: draft.outlet.venueType || draft.business.businessType,
        },

        planId: draft.planId,

        provider: selectedProvider || undefined,
      });

      if (!res.success) {
        setError(res.error || 'Could not start checkout. Please try again.');

        setCheckoutStarting(false);
        return;
      }

      if (!res.data?.requiresPayment) {
        finishRegistration(res.data);
        return;
      }

      setCheckoutSession(res.data);

      setCheckoutStarting(false);
    } catch {
      setError('Could not start checkout. Please try again.');

      setCheckoutStarting(false);
    }
  };

  /* =========================================================
     HANDLE PAID
  ========================================================= */

  const handlePaid = async (fields) => {
    setError('');

    try {
      const res = await authAPI.confirmOwnerPayment({
        reference: checkoutSession.reference,
        provider: checkoutSession.provider,
        ...fields,
      });

      if (res.success) {
        finishRegistration(res.data);
      } else {
        setError(
          res.error || 'Registration could not be completed. Please contact support if you were charged.'
        );

        setSubmitting(false);
      }
    } catch {
      setError('Registration could not be completed. Please contact support if you were charged.');

      setSubmitting(false);
    }
  };

  /* =========================================================
     PAYMENT GATEWAY
  ========================================================= */

  const selectedGateway = gateways.find((g) => g.provider === checkoutSession?.provider);

  const selectedGatewayPublicKey = selectedGateway
    ? selectedGateway[PUBLIC_FIELD_BY_PROVIDER[checkoutSession?.provider]]
    : undefined;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080b14] p-10 font-[Inter,Arial,Helvetica,sans-serif] max-[768px]:min-h-[100dvh] max-[768px]:p-5 max-[480px]:items-start max-[480px]:p-3 max-[480px]:pt-[18px] max-[360px]:p-2 max-[360px]:pt-3">

      {/* Background */}

      <div className="pointer-events-none absolute inset-0 bg-[image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] bg-[length:45px_45px] opacity-[0.035]" />

      <div className="pointer-events-none absolute -top-[260px] -left-[200px] h-[450px] w-[450px] rounded-full bg-[rgba(99,102,241,0.18)] blur-[120px]" />
      <div className="pointer-events-none absolute -right-[250px] -bottom-[280px] h-[450px] w-[450px] rounded-full bg-[rgba(124,58,237,0.18)] blur-[120px]" />

      {/* Main Card */}

      <div className="relative z-[2] grid min-h-[650px] w-full max-w-[1080px] grid-cols-[1fr_0.95fr] overflow-hidden rounded-[26px] border border-white/[0.08] bg-[rgba(13,17,29,0.94)] shadow-[0_35px_100px_rgba(0,0,0,0.45)] max-[1000px]:max-w-[850px] max-[1000px]:grid-cols-[1fr_1fr] max-[768px]:block max-[768px]:min-h-0 max-[768px]:w-full max-[768px]:max-w-[560px] max-[768px]:rounded-[20px] max-[480px]:rounded-[17px]">

        {/* ======================================
            LEFT BRAND PANEL
        ====================================== */}

        <section className="flex flex-col justify-between border-r border-white/[0.07] bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,.13),transparent_40%)] p-[55px] max-[1000px]:p-10 max-[768px]:hidden">

          <div className="flex items-center gap-[13px]">
            <div className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-[13px] bg-[linear-gradient(135deg,#667eea,#764ba2)] shadow-[0_10px_30px_rgba(102,126,234,.25)]">
              <Sparkles size={26} aria-hidden="true" />
            </div>

            <div className="text-[17px] font-extrabold tracking-[1.6px] text-white">
              CQA<span className="text-[#8b95f9]">BOOKING</span>
            </div>
          </div>

          <div className="max-w-[470px]">

            <div className="mb-[25px] inline-flex items-center gap-2 text-[9px] font-extrabold tracking-[1.3px] text-[#9da8ff]">
              <span className="h-[6px] w-[6px] rounded-full bg-[#6ee7b7] shadow-[0_0_10px_#6ee7b7]" />
              ONE ACCOUNT, ALL ACCESS
            </div>

            <h1 className="m-0 text-[clamp(32px,3.6vw,46px)] leading-[1.1] font-[750] tracking-[-1.5px] text-[#f7f8fb] max-[1000px]:text-[34px]">
              Build your
              <br />
              booking business.
            </h1>

            <p className="mt-[23px] max-w-[430px] text-[14px] leading-[1.8] text-[#818ca0]">
              Create your account, configure your organization,
              set up your first outlet, choose your plan and
              start managing bookings from one powerful platform.
            </p>

            <div className="mt-[35px] grid gap-[17px] max-[1000px]:mt-[25px]">
              <Feature
                title="Organization & Outlet Management"
                text="Set up your business, outlets and staff in minutes."
              />

              <Feature
                title="Subscription & Payment Setup"
                text="Pick a plan and connect payments in one flow."
              />

              <Feature
                title="Secure Role-based Platform"
                text="Every account is routed to exactly what it's allowed to see."
              />
            </div>

          </div>

          <div className="text-[10px] text-[#525d71]">
            © 2026 CQA Booking Platform
          </div>

        </section>

        {/* ======================================
            RIGHT REGISTRATION PANEL
        ====================================== */}

        <section className="flex items-center justify-center overflow-y-auto bg-[rgba(8,11,20,0.58)] p-[50px] max-[1000px]:p-10 max-[768px]:w-full max-[768px]:p-[35px_30px] max-[480px]:p-[28px_20px_25px] max-[360px]:p-[24px_16px]">

          <div className="w-full max-w-[440px] max-[768px]:max-w-none">

            {/* Mobile Brand */}

            <div className="mb-8 hidden items-center justify-center gap-[11px] max-[768px]:flex max-[480px]:mb-7 max-[360px]:mb-6">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[11px] bg-[linear-gradient(135deg,#667eea,#764ba2)] shadow-[0_10px_30px_rgba(102,126,234,.25)]">
                <Sparkles size={22} aria-hidden="true" />
              </div>

              <div className="text-[15px] font-extrabold tracking-[1.6px] text-white">
                CQA<span className="text-[#8b95f9]">BOOKING</span>
              </div>
            </div>

            {step === 1 && (
              <Link
                href="/register"
                className="mb-4 inline-flex items-center gap-1 text-[11px] font-semibold text-[#69758a] no-underline hover:text-[#a5b4fc]"
              >
                <ArrowLeft size={13} />
                Back
              </Link>
            )}

            {/* Header */}

            <div className="mb-7">
              <div className="inline-flex items-center gap-[7px] rounded-[6px] border border-[rgba(129,140,248,0.18)] bg-[rgba(129,140,248,0.06)] px-[9px] py-[6px] text-[8px] font-extrabold tracking-[1px] text-[#9da8ff] max-[360px]:text-[7px]">
                <span className="h-[6px] w-[6px] rounded-full bg-[#6ee7b7]" />
                SECURE REGISTRATION
              </div>

              <h2 className="mt-[17px] mb-2 text-[28px] tracking-[-1px] text-[#f5f7fb] max-[480px]:mt-[14px] max-[480px]:text-[25px] max-[360px]:text-[22px]">
                Create your account
              </h2>

              <p className="m-0 text-[12px] leading-[1.7] text-[#778196]">
                Set up your organization, first outlet, subscription and payment.
              </p>
            </div>

            <StepIndicator step={step} />

            {/* Error */}

            {error && (
              <div className="mb-5 flex gap-[11px] rounded-[10px] border border-[rgba(248,113,113,0.18)] bg-[rgba(239,68,68,0.06)] p-3 text-[#fca5a5]">
                <div className="flex h-[21px] w-[21px] flex-shrink-0 items-center justify-center rounded-full bg-[rgba(239,68,68,0.15)] text-[11px] font-extrabold">
                  !
                </div>

                <div>
                  <p className="m-0 text-[11px] leading-[1.5]">{error}</p>
                </div>
              </div>
            )}

            {/* =====================================================
                STEP 1
            ===================================================== */}

            {step === 1 && (
              <div className="grid gap-4">

                <div className="grid grid-cols-2 gap-3 max-[600px]:grid-cols-1 max-[600px]:gap-4">

                  {/* Full Name */}
                  <div>
                    <label className={labelClass}>Full name</label>

                    <div className="relative">
                      <User size={18} className={iconWrapClass} />

                      <input
                        type="text"
                        value={draft.owner.fullName}
                        onChange={(e) => updateOwner('fullName', e.target.value)}
                        placeholder="Jane Doe"
                        autoComplete="name"
                        maxLength={100}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className={labelClass}>Phone</label>

                    <div className="relative">
                      <Phone size={18} className={iconWrapClass} />

                      <input
                        type="tel"
                        value={draft.owner.phone}
                        onChange={(e) => handlePhoneChange('phone', e.target.value)}
                        placeholder="+1 555 000 0000"
                        autoComplete="tel"
                        inputMode="tel"
                        maxLength={20}
                        className={inputClass}
                      />
                    </div>

                    <span className={hintClass}>
                      No code: exactly 10 digits. With code: 10–15 digits.
                    </span>
                  </div>

                </div>

                {/* Email */}
                <div>
                  <label className={labelClass}>Email address</label>

                  <div className="relative">
                    <Mail size={18} className={iconWrapClass} />

                    <input
                      type="email"
                      value={draft.owner.email}
                      onChange={(e) => updateOwner('email', e.target.value)}
                      placeholder="you@company.com"
                      autoComplete="email"
                      maxLength={254}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className={labelClass}>Password</label>

                  <div className="relative">
                    <Lock size={18} className={iconWrapClass} />

                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={draft.owner.password}
                      onChange={(e) => updateOwner('password', e.target.value)}
                      placeholder="Create a secure password"
                      autoComplete="new-password"
                      maxLength={128}
                      className={inputClass}
                    />

                    <button
                      type="button"
                      className="absolute top-1/2 right-3 flex h-[30px] w-[30px] -translate-y-1/2 items-center justify-center rounded-[6px] border-0 bg-transparent text-[#68748a] cursor-pointer transition-colors duration-200 hover:bg-[rgba(129,140,248,0.07)] hover:text-[#a5b4fc]"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </div>

                  <span className={hintClass}>Use at least 8 characters.</span>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className={labelClass}>Confirm password</label>

                  <div className="relative">
                    <Lock size={18} className={iconWrapClass} />

                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={draft.owner.confirmPassword}
                      onChange={(e) => updateOwner('confirmPassword', e.target.value)}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      maxLength={128}
                      className={inputClass}
                    />
                  </div>
                </div>

              </div>
            )}

            {/* =====================================================
                STEP 2
            ===================================================== */}

            {step === 2 && (
              <div className="grid gap-4">

                {/* Business Name */}
                <div>
                  <label className={labelClass}>Business / organization name</label>

                  <div className="relative">
                    <Building2 size={18} className={iconWrapClass} />

                    <input
                      type="text"
                      value={draft.business.name}
                      onChange={(e) => handleBusinessNameChange(e.target.value)}
                      placeholder="e.g. Pizza Palace"
                      autoComplete="organization"
                      maxLength={150}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Slug */}
                <div>
                  <label className={labelClass}>Business slug</label>

                  <div className="relative">
                    <Globe size={18} className={iconWrapClass} />

                    <input
                      type="text"
                      value={draft.business.slug}
                      onChange={(e) => {
                        setSlugTouched(true);
                        updateBusiness('slug', slugify(e.target.value));
                      }}
                      placeholder="pizza-palace"
                      maxLength={100}
                      className={inputClass}
                    />
                  </div>

                  <span className={hintClass}>
                    Used in your booking page URL. Must be unique.
                  </span>
                </div>

                {/* Business Type */}
                <div>
                  <label className={labelClass}>Business type</label>

                  <select
                    value={draft.business.businessType}
                    onChange={(e) => updateBusiness('businessType', e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select a business type</option>

                    {VENUE_TYPES.map((v) => (
                      <option key={v.value} value={v.value}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>

              </div>
            )}

            {/* =====================================================
                STEP 3
            ===================================================== */}

            {step === 3 && (
              <div className="grid gap-4">

                {/* Outlet Name */}
                <div>
                  <label className={labelClass}>Outlet / venue name</label>

                  <div className="relative">
                    <Building2 size={18} className={iconWrapClass} />

                    <input
                      type="text"
                      value={draft.outlet.name}
                      onChange={(e) => updateOutlet('name', e.target.value)}
                      placeholder="e.g. Pizza Palace — Downtown"
                      maxLength={150}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Currency + Timezone */}
                <div className="grid grid-cols-2 gap-3 max-[600px]:grid-cols-1 max-[600px]:gap-4">

                  <div>
                    <label className={labelClass}>Currency</label>

                    <select
                      value={draft.outlet.currency}
                      onChange={(e) => updateOutlet('currency', e.target.value)}
                      className={selectClass}
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Timezone</label>

                    <select
                      value={draft.outlet.timezone}
                      onChange={(e) => updateOutlet('timezone', e.target.value)}
                      className={selectClass}
                    >
                      {TIMEZONES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                </div>

                {/* Contact Email + Phone */}
                <div className="grid grid-cols-2 gap-3 max-[600px]:grid-cols-1 max-[600px]:gap-4">

                  <div>
                    <label className={labelClass}>Contact email</label>

                    <div className="relative">
                      <Mail size={18} className={iconWrapClass} />

                      <input
                        type="email"
                        value={draft.outlet.contactEmail}
                        onChange={(e) => updateOutlet('contactEmail', e.target.value)}
                        placeholder="venue@company.com"
                        autoComplete="email"
                        maxLength={254}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Contact phone</label>

                    <div className="relative">
                      <Phone size={18} className={iconWrapClass} />

                      <input
                        type="tel"
                        value={draft.outlet.contactPhone}
                        onChange={(e) => handleOutletPhoneChange('contactPhone', e.target.value)}
                        placeholder="+1 555 000 0000"
                        autoComplete="tel"
                        inputMode="tel"
                        maxLength={20}
                        className={inputClass}
                      />
                    </div>

                    <span className={hintClass}>
                      No code: exactly 10 digits. With code: 10–15 digits.
                    </span>
                  </div>

                </div>

                {/* Address */}
                <div>
                  <label className={labelClass}>Address</label>

                  <div className="relative">
                    <MapPin size={18} className={iconWrapClass} />

                    <input
                      type="text"
                      value={draft.outlet.address}
                      onChange={(e) => updateOutlet('address', e.target.value)}
                      placeholder="Street, city, country"
                      maxLength={500}
                      className={inputClass}
                    />
                  </div>
                </div>

              </div>
            )}

            {/* =====================================================
                STEP 4
            ===================================================== */}

            {step === 4 && (
              <div>

                {plansLoading && (
                  <div className="flex items-center gap-2 py-4 text-xs text-[#778196]">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#252d3e] border-t-[#818cf8]" />
                    Loading plans...
                  </div>
                )}

                <div className="grid gap-3">
                  {plans.map((plan) => {
                    const active = draft.planId === plan.id;

                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setDraft((d) => ({ ...d, planId: plan.id }))}
                        className={`w-full rounded-[12px] border p-4 text-left transition-all duration-150 ease ${
                          active
                            ? 'border-[#707bea] bg-[rgba(112,123,234,0.08)] shadow-[0_0_0_3px_rgba(112,123,234,0.1)]'
                            : 'border-[#252d3e] bg-[#0e1320] hover:border-[#38435a]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[14px] font-bold text-[#edf0f6]">{plan.name}</span>

                          <span className="text-[14px] font-bold text-[#edf0f6]">
                            {plan.currency} {Number(plan.price).toFixed(0)}
                            <span className="text-[10px] font-medium text-[#69758a]">
                              /{plan.billingCycle}
                            </span>
                          </span>
                        </div>

                        {plan.description && (
                          <p className="mt-1 mb-2 text-[11px] text-[#818ca0]">{plan.description}</p>
                        )}

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-[#69758a]">
                          {plan.maxOutlets != null && <span>Up to {plan.maxOutlets} outlets</span>}
                          {plan.maxUsers != null && <span>Up to {plan.maxUsers} users</span>}
                          {plan.maxReservations != null && (
                            <span>Up to {plan.maxReservations} reservations/mo</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {!plansLoading && plans.length === 0 && (
                  <p className="text-xs text-[#778196]">
                    No subscription plans are currently available.
                  </p>
                )}

              </div>
            )}

            {/* =====================================================
                STEP 5 PAYMENT
            ===================================================== */}

            {step === 5 && (
              <div>

                {selectedPlan && (
                  <div className="mb-5 flex items-center justify-between rounded-[10px] border border-[#252d3e] bg-[#0e1320] px-3 py-[10px] text-xs">
                    <span className="text-[#818ca0]">
                      {isFreePlan ? (
                        <>
                          Activating <strong className="text-[#c8ced9]">{selectedPlan.name}</strong> — no payment required
                        </>
                      ) : (
                        <>
                          Charging today for <strong className="text-[#c8ced9]">{selectedPlan.name}</strong>
                        </>
                      )}
                    </span>

                    <span className="font-bold text-[#edf0f6]">
                      {selectedPlan.currency} {Number(selectedPlan.price).toFixed(2)}
                    </span>
                  </div>
                )}

                {checkoutSession ? (
                  <PaymentStep
                    session={checkoutSession}
                    publicKey={selectedGatewayPublicKey}
                    billingName={draft.owner.fullName}
                    billingEmail={draft.owner.email}
                    onPaid={handlePaid}
                    submitting={submitting}
                    setSubmitting={setSubmitting}
                    setError={setError}
                  />
                ) : isFreePlan ? (
                  <button
                    type="button"
                    onClick={startCheckout}
                    disabled={checkoutStarting}
                    className={payButtonClass}
                  >
                    {checkoutStarting ? (
                      <>
                        <span className="h-[15px] w-[15px] animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Completing registration...
                      </>
                    ) : (
                      'Complete registration'
                    )}
                  </button>
                ) : gatewaysLoading ? (
                  <div className="flex items-center gap-2 py-4 text-xs text-[#778196]">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#252d3e] border-t-[#818cf8]" />
                    Loading payment methods...
                  </div>
                ) : gateways.length === 0 ? (
                  <div className="flex gap-[11px] rounded-[10px] border border-[rgba(248,113,113,0.18)] bg-[rgba(239,68,68,0.06)] p-3 text-[#fca5a5]">
                    <div className="flex h-[21px] w-[21px] flex-shrink-0 items-center justify-center rounded-full bg-[rgba(239,68,68,0.15)] text-[11px] font-extrabold">
                      !
                    </div>

                    <p className="m-0 text-[11px] leading-[1.5]">
                      No payment gateway is currently available for subscription payment. Please contact the administrator.
                    </p>
                  </div>
                ) : (
                  <>
                    {gateways.length > 1 && (
                      <div className="mb-4 grid gap-2">
                        {gateways.map((g) => (
                          <button
                            key={g.provider}
                            type="button"
                            onClick={() => setSelectedProvider(g.provider)}
                            className={`w-full rounded-[10px] border px-4 py-3 text-left text-[13px] font-semibold transition-all duration-150 ease ${
                              selectedProvider === g.provider
                                ? 'border-[#707bea] bg-[rgba(112,123,234,0.08)] text-[#edf0f6]'
                                : 'border-[#252d3e] bg-[#0e1320] text-[#c8ced9] hover:border-[#38435a]'
                            }`}
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={startCheckout}
                      disabled={!selectedProvider || checkoutStarting}
                      className={payButtonClass}
                    >
                      {checkoutStarting ? (
                        <>
                          <span className="h-[15px] w-[15px] animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Starting payment...
                        </>
                      ) : (
                        'Continue to payment'
                      )}
                    </button>
                  </>
                )}

              </div>
            )}

            {/* =====================================================
                NAVIGATION
            ===================================================== */}

            {step < 5 && (
              <div className="mt-6 flex items-center justify-between gap-3">

                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={loading}
                    className={secondaryButtonClass}
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                ) : (
                  <span />
                )}

                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={loading}
                  className={`flex-1 max-w-[220px] ${payButtonClass}`}
                >
                  {loading ? (
                    <>
                      <span className="h-[15px] w-[15px] animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Please wait...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

              </div>
            )}

            {/* Step 5 Back */}
            {step === 5 && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={submitting || checkoutStarting}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#69758a] cursor-pointer bg-transparent border-0 hover:text-[#a5b4fc] disabled:cursor-not-allowed disabled:opacity-65"
                >
                  <ArrowLeft size={13} />
                  Back to plan selection
                </button>
              </div>
            )}

            {/* Login */}
            <div className="mt-[23px] flex justify-center gap-[5px] text-[11px] text-[#69758a]">
              <span>Already have an account?</span>

              <Link href="/login" className="font-[650] text-[#8b95f9] no-underline hover:underline">
                Sign in
              </Link>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}
