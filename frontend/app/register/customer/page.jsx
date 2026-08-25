'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
} from 'lucide-react';

import { authAPI } from '@/lib/api';
import { storage } from '@/lib/storage';

export default function CustomerRegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* ============================================
     REGISTER
  ============================================ */

  const handleRegister = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const result = await authAPI.registerCustomer({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        confirmPassword,
      });

      if (result.success) {
        storage.setToken(result.data.token);
        storage.setUser(result.data.user);

        router.push('/');
      } else {
        setError(
          result.error ||
            'We could not create your account. Please review your details and try again.'
        );
      }
    } catch {
      setError(
        "We couldn't create your account. Please check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080b14] p-10 font-[Inter,Arial,Helvetica,sans-serif] max-[768px]:min-h-[100dvh] max-[768px]:p-5 max-[480px]:items-start max-[480px]:p-3 max-[480px]:pt-[18px] max-[360px]:p-2 max-[360px]:pt-3">

      {/* ============================================
          BACKGROUND
      ============================================ */}

      <div className="pointer-events-none absolute inset-0 bg-[image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] bg-[length:45px_45px] opacity-[0.035]" />

      <div className="pointer-events-none absolute -top-[260px] -left-[200px] h-[450px] w-[450px] rounded-full bg-[rgba(99,102,241,0.18)] blur-[120px]" />

      <div className="pointer-events-none absolute -right-[250px] -bottom-[280px] h-[450px] w-[450px] rounded-full bg-[rgba(124,58,237,0.18)] blur-[120px]" />

      <div className="pointer-events-none absolute top-[35%] left-[45%] h-[250px] w-[250px] rounded-full bg-[rgba(79,70,229,0.06)] blur-[100px]" />

      {/* ============================================
          MAIN CARD
      ============================================ */}

      <div className="relative z-[2] grid min-h-[720px] w-full max-w-[1080px] grid-cols-[1fr_0.9fr] overflow-hidden rounded-[26px] border border-white/[0.08] bg-[rgba(13,17,29,0.94)] shadow-[0_35px_100px_rgba(0,0,0,0.45)] max-[1000px]:max-w-[850px] max-[1000px]:grid-cols-[1fr_1fr] max-[768px]:block max-[768px]:min-h-0 max-[768px]:w-full max-[768px]:max-w-[480px] max-[768px]:rounded-[20px] max-[480px]:rounded-[17px]">

        {/* ==========================================
            LEFT BRAND / INFORMATION PANEL
        ========================================== */}

        <section className="flex flex-col justify-between border-r border-white/[0.07] bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,.13),transparent_40%)] p-[55px] max-[1000px]:p-10 max-[768px]:hidden">

          {/* Brand */}

          <div className="flex items-center gap-[13px]">

            <div className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-[13px] bg-[linear-gradient(135deg,#667eea,#764ba2)] shadow-[0_10px_30px_rgba(102,126,234,.25)]">
              <Sparkles
                size={26}
                aria-hidden="true"
              />
            </div>

            <div className="text-[17px] font-extrabold tracking-[1.6px] text-white">
              CQA
              <span className="text-[#8b95f9]">
                BOOKING
              </span>
            </div>

          </div>

          {/* Content */}

          <div className="max-w-[470px]">

            <div className="mb-[25px] inline-flex items-center gap-2 text-[9px] font-extrabold tracking-[1.3px] text-[#9da8ff]">

              <span className="h-[6px] w-[6px] rounded-full bg-[#6ee7b7] shadow-[0_0_10px_#6ee7b7]" />

              CREATE YOUR ACCOUNT

            </div>

            <h1 className="m-0 text-[clamp(36px,4vw,52px)] font-[750] leading-[1.08] tracking-[-2px] text-[#f7f8fb] max-[1000px]:text-[38px]">

              Your next
              <br />

              booking starts
              <br />

              here.

            </h1>

            <p className="mt-[23px] max-w-[430px] text-[14px] leading-[1.8] text-[#818ca0]">

              Create your CQA Booking account and discover a simpler
              way to find venues, make reservations and manage every
              booking from one place.

            </p>

            {/* Features */}

            <div className="mt-[35px] grid gap-[17px] max-[1000px]:mt-[25px]">

              <Feature
                title="Discover Great Venues"
                text="Explore venues and find the right experience for you."
              />

              <Feature
                title="Fast & Simple Booking"
                text="Reserve your preferred venue in just a few steps."
              />

              <Feature
                title="Manage Everything Easily"
                text="Keep your reservations and account details in one place."
              />

            </div>

          </div>

          {/* Footer */}

          <div className="text-[10px] text-[#525d71]">
            © 2026 CQA Booking Platform
          </div>

        </section>

        {/* ==========================================
            RIGHT REGISTRATION PANEL
        ========================================== */}

        <section className="flex items-center justify-center bg-[rgba(8,11,20,0.58)] p-[50px] max-[1000px]:p-10 max-[768px]:w-full max-[768px]:p-[35px_30px] max-[480px]:p-[28px_20px_25px] max-[360px]:p-[24px_16px]">

          <div className="w-full max-w-[370px] max-[768px]:max-w-none">

            {/* ======================================
                MOBILE BRAND
            ====================================== */}

            <div className="mb-7 hidden items-center justify-center gap-[11px] max-[768px]:flex max-[480px]:mb-6 max-[360px]:mb-5">

              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[11px] bg-[linear-gradient(135deg,#667eea,#764ba2)] shadow-[0_10px_30px_rgba(102,126,234,.25)]">

                <Sparkles
                  size={22}
                  aria-hidden="true"
                />

              </div>

              <div className="text-[15px] font-extrabold tracking-[1.6px] text-white">

                CQA
                <span className="text-[#8b95f9]">
                  BOOKING
                </span>

              </div>

            </div>

            {/* ======================================
                HEADER
            ====================================== */}

            <div className="mb-6">

              <Link
                href="/register"
                className="mb-4 inline-flex items-center gap-[6px] text-[9px] font-[650] text-[#626e83] no-underline transition-colors duration-200 hover:text-[#a5b4fc]"
              >
                <ArrowLeft
                  size={14}
                  aria-hidden="true"
                />

                Back

              </Link>

              <div className="inline-flex items-center gap-[7px] rounded-[6px] border border-[rgba(129,140,248,0.18)] bg-[rgba(129,140,248,0.06)] px-[9px] py-[6px] text-[8px] font-extrabold tracking-[1px] text-[#9da8ff] max-[360px]:text-[7px]">

                <span className="h-[6px] w-[6px] rounded-full bg-[#6ee7b7]" />

                GET STARTED

              </div>

              <h2 className="mt-[16px] mb-2 text-[30px] font-[700] tracking-[-1px] text-[#f5f7fb] max-[480px]:text-[27px] max-[360px]:text-[24px]">

                Create your account

              </h2>

              <p className="m-0 text-[12px] leading-[1.7] text-[#778196] max-[480px]:text-[11px]">

                Join CQA Booking and start managing your reservations.

              </p>

            </div>

            {/* ======================================
                ERROR
            ====================================== */}

            {error && (
              <div className="mb-5 flex gap-[11px] rounded-[10px] border border-[rgba(248,113,113,0.18)] bg-[rgba(239,68,68,0.06)] p-3 text-[#fca5a5]">

                <div className="flex h-[21px] w-[21px] flex-shrink-0 items-center justify-center rounded-full bg-[rgba(239,68,68,0.15)] text-[11px] font-extrabold">

                  !

                </div>

                <div>

                  <strong className="mb-[3px] block text-[11px]">
                    Registration failed
                  </strong>

                  <p className="m-0 text-[10px] leading-[1.5]">
                    {error}
                  </p>

                </div>

              </div>
            )}

            {/* ======================================
                FORM
            ====================================== */}

            <form
              onSubmit={handleRegister}
              className="grid gap-[15px]"
            >

              {/* Full Name */}

              <FormField
                id="fullName"
                label="Full name"
                icon={<User size={18} />}
              >

                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) =>
                    setFullName(e.target.value)
                  }
                  placeholder="Enter your full name"
                  autoComplete="name"
                  disabled={loading}
                  required
                  className={inputClass}
                />

              </FormField>

              {/* Email */}

              <FormField
                id="email"
                label="Email address"
                icon={<Mail size={18} />}
              >

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your email address"
                  autoComplete="email"
                  disabled={loading}
                  required
                  className={inputClass}
                />

              </FormField>

              {/* Phone */}

              <FormField
                id="phone"
                label="Phone number"
                icon={<Phone size={18} />}
              >

                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  placeholder="+1 555 000 0000"
                  autoComplete="tel"
                  disabled={loading}
                  className={inputClass}
                />

              </FormField>

              {/* Password */}

              <div>

                <label
                  htmlFor="password"
                  className="mb-2 block text-[11px] font-[650] text-[#c8ced9]"
                >
                  Password
                </label>

                <div className="relative">

                  <Lock
                    size={18}
                    className="pointer-events-none absolute top-1/2 left-[14px] -translate-y-1/2 text-[#59657a]"
                  />

                  <input
                    id="password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Create a secure password"
                    autoComplete="new-password"
                    disabled={loading}
                    required
                    className="h-[49px] w-full rounded-[10px] border border-[#252d3e] bg-[#0e1320] px-[43px] pr-[45px] text-[12px] text-[#edf0f6] outline-none transition-all duration-200 placeholder:text-[#4f596c] focus:border-[#707bea] focus:bg-[#101625] focus:shadow-[0_0_0_3px_rgba(112,123,234,0.09)] disabled:cursor-not-allowed disabled:opacity-[0.55]"
                  />

                  <button
                    type="button"
                    className="absolute top-1/2 right-3 flex h-[30px] w-[30px] -translate-y-1/2 items-center justify-center rounded-[6px] border-0 bg-transparent text-[#68748a] cursor-pointer transition-colors duration-200 hover:bg-[rgba(129,140,248,0.07)] hover:text-[#a5b4fc] disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() =>
                      setShowPassword(
                        (prev) => !prev
                      )
                    }
                    disabled={loading}
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >

                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}

                  </button>

                </div>

                <div className="mt-[6px] flex items-center gap-[6px] text-[9px] text-[#59657a]">

                  <Lock size={11} />

                  Use at least 8 characters.

                </div>

              </div>

              {/* Confirm Password */}

              <div>

                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-[11px] font-[650] text-[#c8ced9]"
                >
                  Confirm password
                </label>

                <div className="relative">

                  <Lock
                    size={18}
                    className="pointer-events-none absolute top-1/2 left-[14px] -translate-y-1/2 text-[#59657a]"
                  />

                  <input
                    id="confirmPassword"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    disabled={loading}
                    required
                    className={`h-[49px] w-full rounded-[10px] border bg-[#0e1320] px-[43px] text-[12px] text-[#edf0f6] outline-none transition-all duration-200 placeholder:text-[#4f596c] disabled:cursor-not-allowed disabled:opacity-[0.55] ${
                      confirmPassword &&
                      password !== confirmPassword
                        ? 'border-[rgba(248,113,113,0.5)] focus:border-[#f87171] focus:shadow-[0_0_0_3px_rgba(248,113,113,0.08)]'
                        : 'border-[#252d3e] focus:border-[#707bea] focus:bg-[#101625] focus:shadow-[0_0_0_3px_rgba(112,123,234,0.09)]'
                    }`}
                  />

                </div>

                {confirmPassword &&
                  password === confirmPassword && (
                    <div className="mt-[6px] flex items-center gap-[6px] text-[9px] text-[#6ee7b7]">

                      <Check size={11} />

                      Passwords match

                    </div>
                  )}

              </div>

              {/* Submit */}

              <button
                type="submit"
                className="mt-[4px] flex h-[50px] w-full items-center justify-center gap-[9px] rounded-[10px] border-0 bg-[linear-gradient(135deg,#667eea,#764ba2)] text-[12px] font-[750] text-white cursor-pointer shadow-[0_10px_30px_rgba(102,126,234,0.2)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_15px_35px_rgba(102,126,234,0.3)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0 max-[480px]:h-[49px]"
                disabled={
                  loading ||
                  !fullName.trim() ||
                  !email.trim() ||
                  !password ||
                  !confirmPassword ||
                  password !== confirmPassword
                }
              >

                {loading ? (
                  <>
                    <span className="h-[15px] w-[15px] animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    Creating account...

                  </>
                ) : (
                  <>
                    Create account

                    <ArrowRight size={18} />

                  </>
                )}

              </button>

            </form>

            {/* ======================================
                LOGIN
            ====================================== */}

            <div className="mt-[21px] flex justify-center gap-[5px] text-[11px] text-[#69758a]">

              <span>
                Already have an account?
              </span>

              <Link
                href="/login"
                className="font-[650] text-[#8b95f9] no-underline hover:underline"
              >
                Sign in
              </Link>

            </div>

            {/* ======================================
                HOME
            ====================================== */}

            <Link
              href="/"
              className="mt-[18px] flex items-center justify-center gap-[6px] text-[10px] text-[#626e83] no-underline transition-colors duration-200 hover:text-[#a5b4fc]"
            >

              <ArrowLeft
                size={15}
                aria-hidden="true"
              />

              Back to CQA Booking

            </Link>

          </div>

        </section>

      </div>

    </main>
  );
}


/* ============================================
   FORM FIELD COMPONENT
============================================ */

function FormField({
  id,
  label,
  icon,
  children,
}) {
  return (
    <div>

      <label
        htmlFor={id}
        className="mb-2 block text-[11px] font-[650] text-[#c8ced9]"
      >
        {label}
      </label>

      <div className="relative">

        <span className="pointer-events-none absolute top-1/2 left-[14px] z-[1] flex -translate-y-1/2 items-center text-[#59657a]">
          {icon}
        </span>

        {children}

      </div>

    </div>
  );
}


/* ============================================
   FEATURE COMPONENT
============================================ */

function Feature({ title, text }) {
  return (
    <div className="flex gap-3">

      <div className="flex h-[25px] w-[25px] flex-shrink-0 items-center justify-center rounded-[7px] bg-[rgba(129,140,248,0.1)] text-[#9da8ff]">

        <Check size={13} />

      </div>

      <div>

        <strong className="mb-[3px] block text-[12px] text-[#dce1ea]">
          {title}
        </strong>

        <p className="m-0 text-[11px] leading-[1.5] text-[#69758a]">
          {text}
        </p>

      </div>

    </div>
  );
}


/* ============================================
   COMMON INPUT CLASS
============================================ */

const inputClass =
  'h-[49px] w-full rounded-[10px] border border-[#252d3e] bg-[#0e1320] px-[43px] text-[12px] text-[#edf0f6] outline-none transition-all duration-200 placeholder:text-[#4f596c] focus:border-[#707bea] focus:bg-[#101625] focus:shadow-[0_0_0_3px_rgba(112,123,234,0.09)] disabled:cursor-not-allowed disabled:opacity-[0.55]';
