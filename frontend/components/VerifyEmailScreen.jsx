'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MailCheck,
  RefreshCw,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

import { authAPI } from '@/lib/api';
import {
  notifySuccess,
  notifyError
} from '@/lib/alerts';

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyEmailScreen({
  email,
  warning
}) {
  const router = useRouter();

  const [resending, setResending] =
    useState(false);

  const [cooldown, setCooldown] =
    useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((current) =>
        Math.max(0, current - 1)
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (
      resending ||
      cooldown > 0 ||
      !email
    ) {
      return;
    }

    setResending(true);

    try {
      const result =
        await authAPI.resendVerification(
          email
        );

      if (result.success) {
        notifySuccess(
          result.message ||
            'Verification email sent. Please check your inbox.'
        );

        setCooldown(
          RESEND_COOLDOWN_SECONDS
        );
      } else {
        notifyError(
          result.error ||
            'Could not resend verification email.'
        );

        if (
          result.cooldown
        ) {
          setCooldown(
            Number(result.cooldown)
          );
        }
      }
    } catch (error) {
      console.error(
        'Resend verification error:',
        error
      );

      notifyError(
        'Could not resend verification email. Please try again.'
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080b14] p-10 font-[Inter,Arial,Helvetica,sans-serif] max-[768px]:min-h-[100dvh] max-[768px]:p-5 max-[480px]:items-start max-[480px]:p-3 max-[480px]:pt-[18px]">

      <div className="pointer-events-none absolute inset-0 bg-[image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] bg-[length:45px_45px] opacity-[0.035]" />

      <div className="pointer-events-none absolute -top-[260px] -left-[200px] h-[450px] w-[450px] rounded-full bg-[rgba(99,102,241,0.18)] blur-[120px]" />

      <div className="pointer-events-none absolute -right-[250px] -bottom-[280px] h-[450px] w-[450px] rounded-full bg-[rgba(124,58,237,0.18)] blur-[120px]" />

      <div className="relative z-[2] w-full max-w-[460px] rounded-[26px] border border-white/[0.08] bg-[rgba(13,17,29,0.94)] p-[46px] text-center shadow-[0_35px_100px_rgba(0,0,0,0.45)] max-[480px]:rounded-[18px] max-[480px]:p-8">

        <div className="mx-auto mb-6 flex h-11 w-11 items-center justify-center rounded-[13px] bg-[linear-gradient(135deg,#667eea,#764ba2)] shadow-[0_10px_30px_rgba(102,126,234,.25)]">
          <Sparkles
            size={24}
            aria-hidden="true"
            className="text-white"
          />
        </div>

        <div className="mx-auto mb-6 flex h-[70px] w-[70px] items-center justify-center rounded-full bg-[rgba(129,140,248,0.1)]">
          <MailCheck
            size={34}
            className="text-[#9da8ff]"
          />
        </div>

        <h1 className="mb-3 text-[26px] font-[750] tracking-[-0.5px] text-[#f5f7fb]">
          Verify your email
        </h1>

        <p className="mx-auto mb-1 max-w-[360px] text-[13px] leading-[1.7] text-[#818ca0]">
          We&apos;ve sent a verification link to
        </p>

        <p className="mb-6 break-all text-[14px] font-[650] text-[#c8ced9]">
          {email}
        </p>

        <p className="mx-auto mb-7 max-w-[360px] text-[12px] leading-[1.7] text-[#69758a]">
          Click the link in the email to
          activate your account. If you
          don&apos;t see it, please check your
          spam or junk folder.
        </p>

        {warning && (
          <div className="mb-6 rounded-[10px] border border-[rgba(251,191,36,0.2)] bg-[rgba(251,191,36,0.06)] p-3 text-left text-[11px] leading-[1.6] text-[#fbbf24]">
            {warning}
          </div>
        )}

        <button
          type="button"
          onClick={handleResend}
          disabled={
            resending ||
            cooldown > 0 ||
            !email
          }
          className="mb-4 flex h-[49px] w-full items-center justify-center gap-2 rounded-[10px] border-0 bg-[linear-gradient(135deg,#667eea,#764ba2)] text-[12px] font-[750] text-white cursor-pointer shadow-[0_10px_30px_rgba(102,126,234,0.2)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_15px_35px_rgba(102,126,234,0.3)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {resending ? (
            <>
              <span className="h-[15px] w-[15px] animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Sending...
            </>
          ) : cooldown > 0 ? (
            `Resend in ${cooldown}s`
          ) : (
            <>
              <RefreshCw size={16} />
              Resend Verification Email
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() =>
            router.push('/login')
          }
          className="flex h-[46px] w-full items-center justify-center gap-2 rounded-[10px] border border-[#252d3e] bg-transparent text-[12px] font-[650] text-[#c8ced9] cursor-pointer transition-colors duration-200 hover:border-[#38435a] hover:text-[#edf0f6]"
        >
          <ArrowLeft size={15} />
          Back to Login
        </button>
      </div>
    </main>
  );
}