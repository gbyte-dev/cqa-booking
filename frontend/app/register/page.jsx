'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CalendarCheck, Building2, ArrowRight } from 'lucide-react';
import { storage } from '@/lib/storage';
import { getRoleRedirectPath } from '@/lib/roleRedirect';

export default function RegisterChooserPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const token = storage.getToken();
    const user = storage.getUser();

    if (token && user) {
      router.replace(getRoleRedirectPath(user.role));
      return;
    }

    setCheckingSession(false);
  }, [router]);

  if (checkingSession) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3.5 bg-[#f5f7fb] font-sans text-[13px] text-[#667085]">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#e5e7eb] border-t-[#667eea]" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-[radial-gradient(circle_at_50%_0%,rgba(31,41,55,0.045),transparent_40%),#f6f7f9] p-[28px_20px] max-[600px]:p-[20px_14px] max-[360px]:p-[15px_10px] font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif] text-[#1f2933]">

      <div className="flex w-full max-w-[720px] flex-col items-center">

        {/* Brand */}
        <div className="mb-6 flex items-center gap-[10px] text-lg font-bold tracking-[-0.3px] text-[#1d2731]">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1d2731] text-lg font-extrabold text-white">C</div>
          <span>CQA Booking</span>
        </div>

        <div className="mb-8 text-center">
          <span className="mb-[9px] inline-block text-[10px] font-bold tracking-[1.4px] text-[#89939c]">
            GET STARTED
          </span>
          <h1 className="m-0 text-[28px] max-[600px]:text-2xl font-bold leading-[1.2] tracking-[-0.7px] text-[#18212a]">
            What do you want to do?
          </h1>
        </div>

        <div className="grid w-full grid-cols-2 max-[600px]:grid-cols-1 gap-5">

          <Link
            href="/register/customer"
            className="group flex flex-col rounded-xl border border-[#e4e7ea] bg-white p-7 no-underline shadow-[0_8px_30px_rgba(16,24,40,0.055)] transition-transform duration-150 ease hover:-translate-y-1"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#f0f2f4] text-[#1d2731]">
              <CalendarCheck size={22} />
            </div>
            <h3 className="m-0 mb-2 text-lg font-bold text-[#18212a]">Book a Venue / Customer Account</h3>
            <p className="m-0 mb-5 text-[13px] leading-relaxed text-[#7b858e]">
              Create a free account to make and manage reservations at any venue on CQA Booking.
            </p>
            <span className="mt-auto flex items-center gap-2 text-[13px] font-semibold text-[#1d2731]">
              Continue <ArrowRight size={16} className="transition-transform duration-150 ease group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            href="/tenant/register"
            className="group flex flex-col rounded-xl border border-[#e4e7ea] bg-white p-7 no-underline shadow-[0_8px_30px_rgba(16,24,40,0.055)] transition-transform duration-150 ease hover:-translate-y-1"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#f0f2f4] text-[#1d2731]">
              <Building2 size={22} />
            </div>
            <h3 className="m-0 mb-2 text-lg font-bold text-[#18212a]">Register My Business</h3>
            <p className="m-0 mb-5 text-[13px] leading-relaxed text-[#7b858e]">
              Set up your organization, first outlet, and subscription to start taking reservations.
            </p>
            <span className="mt-auto flex items-center gap-2 text-[13px] font-semibold text-[#1d2731]">
              Continue <ArrowRight size={16} className="transition-transform duration-150 ease group-hover:translate-x-1" />
            </span>
          </Link>

        </div>

        <div className="mt-6 flex justify-center gap-[5px] text-xs text-[#8a949c]">
          <span>Already have an account?</span>
          <Link href="/login" className="font-semibold text-[#1d2731] no-underline hover:underline">
            Sign in
          </Link>
        </div>

      </div>

    </main>
  );
}
