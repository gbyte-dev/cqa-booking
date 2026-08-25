'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { storage } from '@/lib/storage';
import { getRoleRedirectPath } from '@/lib/roleRedirect';
import { resolvePostLoginPath } from '@/lib/redirect';
import { Mail, Lock, Eye, EyeOff, Check, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import VerifyEmailScreen from '@/components/VerifyEmailScreen';

// useSearchParams() (used below to read ?redirect=) requires a Suspense
// boundary during static prerendering, otherwise `next build` fails on this page.
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#080b14] font-[Inter,Arial,sans-serif] text-[#98a2b3]">
          <div className="h-[38px] w-[38px] animate-spin rounded-full border-[3px] border-white/[0.12] border-t-[#818cf8]" />
        </div>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Only ever a same-origin internal path — validated by resolvePostLoginPath
  // via isSafeRedirectPath before it is ever navigated to.
  const redirectParam = searchParams.get('redirect');

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  /* ============================================
     CHECK EXISTING AUTH
  ============================================ */

  useEffect(() => {
    const token = storage.getToken();
    const user = storage.getUser();

    if (token && user) {
      router.replace(resolvePostLoginPath(redirectParam, getRoleRedirectPath(user.role)));
      return;
    }

    setCheckingAuth(false);
  }, [router, redirectParam]);

  /* ============================================
     LOGIN
  ============================================ */

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError('');

    try {
      const result = await authAPI.login(email.trim(), password);

      if (!result?.success) {
        if (result?.error === 'EMAIL_NOT_VERIFIED' || result?.code === 'EMAIL_NOT_VERIFIED' ) {
          const verificationEmail =
            result?.data?.email ||
            result?.email ||
            email.trim().toLowerCase();

          setUnverifiedEmail(
            verificationEmail.trim().toLowerCase()
          );

          setLoading(false);
          return;
        }

        setError(
          result?.error || result?.message || 'Login failed. Please check your credentials.'
        );

        setLoading(false);
        return;
      }

      const user = result?.data?.user;
      const token = result?.data?.token;
      const organization = result?.data?.organization;

      if (!user || !token) {
        setError('Invalid server response. Token or user information is missing.');

        setLoading(false);
        return;
      }

      storage.setToken(token);
      storage.setUser(user);
      if (organization) storage.setOrganization(organization);

      router.replace(resolvePostLoginPath(redirectParam, getRoleRedirectPath(user.role)));
    } catch (err) {
      setError('Unable to connect to the server. Please try again.');

      setLoading(false);
    }
  };

  /* ============================================
     AUTH CHECK
  ============================================ */

  if (unverifiedEmail) {
    return <VerifyEmailScreen email={unverifiedEmail} />;
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#080b14] font-[Inter,Arial,sans-serif] text-[#98a2b3]">
        <div className="h-[38px] w-[38px] animate-spin rounded-full border-[3px] border-white/[0.12] border-t-[#818cf8]" />
        <p className="mt-[15px] text-[13px]">Checking your session...</p>
      </div>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080b14] p-10 font-[Inter,Arial,Helvetica,sans-serif] max-[768px]:min-h-[100dvh] max-[768px]:p-5 max-[480px]:items-start max-[480px]:p-3 max-[480px]:pt-[18px] max-[360px]:p-2 max-[360px]:pt-3">

      {/* Background */}

      <div className="pointer-events-none absolute inset-0 bg-[image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] bg-[length:45px_45px] opacity-[0.035]" />

      <div className="pointer-events-none absolute -top-[260px] -left-[200px] h-[450px] w-[450px] rounded-full bg-[rgba(99,102,241,0.18)] blur-[120px]" />
      <div className="pointer-events-none absolute -right-[250px] -bottom-[280px] h-[450px] w-[450px] rounded-full bg-[rgba(124,58,237,0.18)] blur-[120px]" />

      {/* Main Card */}

      <div className="relative z-[2] grid min-h-[650px] w-full max-w-[1080px] grid-cols-[1fr_0.9fr] overflow-hidden rounded-[26px] border border-white/[0.08] bg-[rgba(13,17,29,0.94)] shadow-[0_35px_100px_rgba(0,0,0,0.45)] max-[1000px]:max-w-[850px] max-[1000px]:grid-cols-[1fr_1fr] max-[768px]:block max-[768px]:min-h-0 max-[768px]:w-full max-[768px]:max-w-[480px] max-[768px]:rounded-[20px] max-[480px]:rounded-[17px]">

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

            <h1 className="m-0 text-[clamp(36px,4vw,52px)] leading-[1.08] font-[750] tracking-[-2px] text-[#f7f8fb] max-[1000px]:text-[38px]">
              Complete control.
              <br />
              One powerful dashboard.
            </h1>

            <p className="mt-[23px] max-w-[430px] text-[14px] leading-[1.8] text-[#818ca0]">
              Sign in once and get taken straight to the dashboard
              built for your role — venues, bookings, staff, or
              platform administration.
            </p>

            <div className="mt-[35px] grid gap-[17px] max-[1000px]:mt-[25px]">

              <Feature
                title="Venue & Booking Management"
                text="Manage venues, tables and reservations in real time."
              />

              <Feature
                title="Real-time Analytics"
                text="Track bookings, revenue and customer trends."
              />

              <Feature
                title="Secure, Role-based Access"
                text="Every account is routed to exactly what it's allowed to see."
              />

            </div>

          </div>

          <div className="text-[10px] text-[#525d71]">
            © 2026 CQA Booking Platform
          </div>

        </section>

        {/* ======================================
            RIGHT LOGIN PANEL
        ====================================== */}

        <section className="flex items-center justify-center bg-[rgba(8,11,20,0.58)] p-[50px] max-[1000px]:p-10 max-[768px]:w-full max-[768px]:p-[35px_30px] max-[480px]:p-[28px_20px_25px] max-[360px]:p-[24px_16px]">

          <div className="w-full max-w-[370px] max-[768px]:max-w-none">

            {/* Mobile Brand */}

            <div className="mb-8 hidden items-center justify-center gap-[11px] max-[768px]:flex max-[480px]:mb-7 max-[360px]:mb-6">

              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[11px] bg-[linear-gradient(135deg,#667eea,#764ba2)] shadow-[0_10px_30px_rgba(102,126,234,.25)]">
                <Sparkles size={22} aria-hidden="true" />
              </div>

              <div className="text-[15px] font-extrabold tracking-[1.6px] text-white">
                CQA<span className="text-[#8b95f9]">BOOKING</span>
              </div>

            </div>

            {/* Header */}

            <div className="mb-7">

              <div className="inline-flex items-center gap-[7px] rounded-[6px] border border-[rgba(129,140,248,0.18)] bg-[rgba(129,140,248,0.06)] px-[9px] py-[6px] text-[8px] font-extrabold tracking-[1px] text-[#9da8ff] max-[360px]:text-[7px]">
                <span className="h-[6px] w-[6px] rounded-full bg-[#6ee7b7]" />
                SECURE SIGN IN
              </div>

              <h2 className="mt-[17px] mb-2 text-[32px] tracking-[-1px] text-[#f5f7fb] max-[480px]:mt-[14px] max-[480px]:text-[28px] max-[360px]:text-[25px]">
                Welcome back
              </h2>

              <p className="m-0 text-[12px] leading-[1.7] text-[#778196] max-[480px]:text-[11px]">
                Sign in to access your dashboard.
              </p>

            </div>

            {/* Error */}

            {error && (
              <div className="mb-5 flex gap-[11px] rounded-[10px] border border-[rgba(248,113,113,0.18)] bg-[rgba(239,68,68,0.06)] p-3 text-[#fca5a5]">

                <div className="flex h-[21px] w-[21px] flex-shrink-0 items-center justify-center rounded-full bg-[rgba(239,68,68,0.15)] text-[11px] font-extrabold">
                  !
                </div>

                <div>
                  <strong className="block mb-[3px] text-[11px]">
                    Sign in failed
                  </strong>

                  <p className="m-0 text-[10px] leading-[1.5]">{error}</p>
                </div>

              </div>
            )}

            {/* Form */}

            <form
              onSubmit={handleLogin}
              className="grid gap-5"
            >

              {/* Email */}

              <div>

                <label htmlFor="email" className="block mb-2 text-[11px] font-[650] text-[#c8ced9]">
                  Email address
                </label>

                <div className="relative">

                  <Mail
                    size={18}
                    className="pointer-events-none absolute top-1/2 left-[14px] -translate-y-1/2 text-[#59657a]"
                  />

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
                    className="h-[49px] w-full rounded-[10px] border border-[#252d3e] bg-[#0e1320] px-[43px] text-[12px] text-[#edf0f6] outline-none transition-all duration-200 placeholder:text-[#4f596c] focus:border-[#707bea] focus:bg-[#101625] focus:shadow-[0_0_0_3px_rgba(112,123,234,0.09)] disabled:cursor-not-allowed disabled:opacity-[0.55]"
                  />

                </div>

              </div>

              {/* Password */}

              <div>

                <div className="flex items-center justify-between">

                  <label htmlFor="password" className="block mb-2 text-[11px] font-[650] text-[#c8ced9]">
                    Password
                  </label>

                  <Link
                    href="/tenant/forgot-password"
                    className="text-[9px] font-[650] text-[#8b95f9] no-underline hover:underline"
                  >
                    Forgot password?
                  </Link>

                </div>

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
                      setPassword(
                        e.target.value
                      )
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={loading}
                    required
                    className="h-[49px] w-full rounded-[10px] border border-[#252d3e] bg-[#0e1320] px-[43px] text-[12px] text-[#edf0f6] outline-none transition-all duration-200 placeholder:text-[#4f596c] focus:border-[#707bea] focus:bg-[#101625] focus:shadow-[0_0_0_3px_rgba(112,123,234,0.09)] disabled:cursor-not-allowed disabled:opacity-[0.55]"
                  />

                  {/* EYE BUTTON */}

                  <button
                    type="button"
                    className="absolute top-1/2 right-3 flex h-[30px] w-[30px] -translate-y-1/2 items-center justify-center rounded-[6px] border-0 bg-transparent text-[#68748a] cursor-pointer transition-colors duration-200 hover:bg-[rgba(129,140,248,0.07)] hover:text-[#a5b4fc] disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
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

              </div>

              {/* Submit */}

              <button
                type="submit"
                className="mt-[3px] flex h-[50px] w-full items-center justify-center gap-[9px] rounded-[10px] border-0 bg-[linear-gradient(135deg,#667eea,#764ba2)] text-[12px] font-[750] text-white cursor-pointer shadow-[0_10px_30px_rgba(102,126,234,0.2)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_15px_35px_rgba(102,126,234,0.3)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:shadow-none max-[480px]:h-[49px]"
                disabled={
                  loading ||
                  !email ||
                  !password
                }
              >

                {loading ? (
                  <>
                    <span className="h-[15px] w-[15px] animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={18} />
                  </>
                )}

              </button>

            </form>

            {/* Register */}

            <div className="mt-[23px] flex justify-center gap-[5px] text-[11px] text-[#69758a]">
              <span>Don&apos;t have an account?</span>
              <Link
                href="/register"
                className="font-[650] text-[#8b95f9] no-underline hover:underline"
              >
                Create an account
              </Link>
            </div>

            {/* Home */}

            <a
              href="/"
              className="mt-[21px] flex items-center justify-center gap-[6px] text-[10px] text-[#626e83] no-underline transition-colors duration-200 hover:text-[#a5b4fc]"
            >
              <ArrowLeft size={15} aria-hidden="true" />

              Back to CQA Booking
            </a>

          </div>
        </section>

      </div>
    </main>
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
        <strong className="block mb-[3px] text-[12px] text-[#dce1ea]">{title}</strong>
        <p className="m-0 text-[11px] leading-[1.5] text-[#69758a]">{text}</p>
      </div>

    </div>
  );
}
