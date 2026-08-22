'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  LogIn,
  Building2,
  CalendarCheck,
  Users,
  DollarSign,
  Activity,
  BarChart3,
  Circle,
  Infinity as InfinityIcon,
} from 'lucide-react';
import { storage } from '@/lib/storage';
import { getRoleRedirectPath } from '@/lib/roleRedirect';

const features = [
  {
    icon: Building2,
    title: 'Venue & table management',
    text: 'Add restaurants, lounges, and cafes. Define tables, capacity, and availability windows.',
  },
  {
    icon: CalendarCheck,
    title: 'Smart reservations',
    text: 'Guests pick a date, time, and party size. Your staff confirms with one click.',
  },
  {
    icon: Users,
    title: 'Customer profiles',
    text: 'Track regulars, preferences, spending, and booking history automatically.',
  },
  {
    icon: DollarSign,
    title: 'Flexible plans',
    text: 'Start with the free plan. Scale to unlimited venues as your business grows.',
  },
  {
    icon: Activity,
    title: 'Real-time status',
    text: 'Check-ins, no-shows, and completions update your board instantly.',
  },
  {
    icon: BarChart3,
    title: 'Reports & analytics',
    text: 'Understand occupancy, revenue, and guest trends with clear reports.',
  },
];

const steps = [
  { number: '01', title: 'Create your account', text: 'Register your restaurant or venue in under a minute.' },
  { number: '02', title: 'Set up your venues', text: 'Add your venues, tables, and opening hours.' },
  { number: '03', title: 'Accept bookings', text: 'Share your booking link and start filling tables.' },
];

export default function Home() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = storage.getToken();
    const user = storage.getUser();

    if (token && user) {
      router.replace(getRoleRedirectPath(user.role));
      return;
    }

    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#faf6ef] font-sans text-[13px] text-[#8a6d3b]">
        <div className="flex h-[58px] w-[58px] animate-pulse items-center justify-center rounded-2xl border border-[#eadfc8] bg-[#fff8ed]">
          <Sparkles className="h-[26px] w-[26px] text-[#b45309]" />
        </div>
        <p>Loading CQA Booking...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#faf6ef] font-sans text-[#2b2118]">
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-[#eadfc8] bg-[#faf6ef]/92 backdrop-blur-[10px]">
        <div className="mx-auto flex max-w-[1150px] items-center justify-between gap-5 px-4 py-[13px] sm:px-6 sm:py-4">
          <div className="flex items-center gap-2.5 text-base font-extrabold tracking-[0.5px] text-[#2b2118]">
            <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px] bg-gradient-to-br from-[#d97706] to-[#92400e] shadow-[0_6px_18px_rgba(180,83,9,0.22)]">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span>
              CQA<em className="ml-1 text-[13px] font-bold not-italic tracking-[1.2px] text-[#b45309]">BOOKING</em>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <a href="#features" className="hidden rounded-lg px-3 py-2.5 text-[13px] font-semibold text-[#6b5d4b] transition-all hover:bg-[#f4ecdd] hover:text-[#b45309] sm:inline-block">
              Features
            </a>
            <a href="#how-it-works" className="hidden rounded-lg px-3 py-2.5 text-[13px] font-semibold text-[#6b5d4b] transition-all hover:bg-[#f4ecdd] hover:text-[#b45309] sm:inline-block">
              How it works
            </a>
            <Link href="/login" className="rounded-lg px-3 py-2.5 text-[13px] font-semibold text-[#3f3326] transition-all">
              Sign in
            </Link>
            <Link href="/tenant/register" className="rounded-[9px] bg-[#1f2937] px-[18px] py-2.5 text-[13px] font-semibold text-white transition-all hover:-translate-y-px hover:bg-[#b45309]">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden px-[18px] pt-[60px] pb-[70px] sm:px-6 sm:pt-[90px] sm:pb-[100px]">
        <div className="pointer-events-none absolute top-[-180px] left-[-160px] h-[480px] w-[480px] rounded-full bg-[rgba(217,119,6,0.16)] blur-[110px]" />
        <div className="pointer-events-none absolute right-[-160px] bottom-[-240px] h-[480px] w-[480px] rounded-full bg-[rgba(166,108,42,0.14)] blur-[110px]" />

        <div className="relative z-[2] mx-auto max-w-[1150px] text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e4d5b8] bg-[#fff9ef] px-3.5 py-2 text-[11px] font-bold tracking-[1px] text-[#8a6d3b] uppercase">
            <Circle className="h-[9px] w-[9px] fill-current text-[#16a34a]" aria-hidden="true" />
            Multi-tenant booking platform
          </div>

          <h1 className="mt-7 text-[clamp(40px,6vw,68px)] leading-[1.08] font-extrabold tracking-[-2.5px] text-[#241c14]">
            Book tables, manage venues,
            <br />
            <span className="text-[#b45309]">grow your restaurant.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-[620px] text-base leading-[1.75] text-[#7d6f5c]">
            CQA Booking helps restaurants and venues accept reservations,
            manage tables, track customers, and grow revenue — all from one
            simple dashboard.
          </p>

          <div className="mt-9 flex flex-col items-stretch justify-center gap-3.5 sm:flex-row sm:flex-wrap sm:items-center">
            <Link href="/tenant/register" className="inline-flex items-center justify-center gap-2 rounded-[11px] bg-[#d97706] px-7 py-[15px] text-sm font-bold text-white shadow-[0_10px_30px_rgba(217,119,6,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#b45309] hover:shadow-[0_16px_38px_rgba(180,83,9,0.32)]">
              Start free
              <ArrowRight className="h-[17px] w-[17px]" />
            </Link>

            <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-[11px] border border-[#e4d5b8] bg-white px-7 py-[15px] text-sm font-bold text-[#3f3326] transition-all hover:-translate-y-0.5 hover:border-[#b45309] hover:text-[#b45309]">
              <LogIn className="h-4 w-4" />
              Sign in to dashboard
            </Link>
          </div>

          <div className="mt-14 flex justify-center gap-[42px]">
            <div className="flex flex-col items-center gap-1">
              <strong className="text-[26px] font-extrabold text-[#241c14]">3</strong>
              <span className="text-[11px] tracking-[1px] text-[#8a7b66] uppercase">Plans</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <InfinityIcon className="h-6 w-6 text-[#241c14]" aria-label="Unlimited" />
              <span className="text-[11px] tracking-[1px] text-[#8a7b66] uppercase">Venues</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <strong className="text-[26px] font-extrabold text-[#241c14]">24/7</strong>
              <span className="text-[11px] tracking-[1px] text-[#8a7b66] uppercase">Availability</span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-[18px] py-[60px] sm:px-6 sm:py-[85px]" id="features">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-[50px] text-center">
            <span className="mb-3 inline-block text-[11px] font-extrabold tracking-[2px] text-[#b45309]">FEATURES</span>
            <h2 className="text-[clamp(30px,4vw,42px)] tracking-[-1.5px] text-[#241c14]">Everything you need to run bookings</h2>
            <p className="mt-3.5 text-[15px] text-[#7d6f5c]">
              From first reservation to repeat customer — manage it all.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-[22px] sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-[#eadfc8] bg-[#fffdf8] p-7 transition-all hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(59,42,24,0.08)]"
              >
                <div className="mb-5 flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-[#f7ead6] text-[#b45309]">
                  <f.icon className="h-[22px] w-[22px]" />
                </div>
                <strong className="mb-2.5 block text-base text-[#2b2118]">{f.title}</strong>
                <p className="text-[13px] leading-[1.65] text-[#7d6f5c]">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-[#f1e8d8] px-[18px] py-[60px] sm:px-6 sm:py-[85px]" id="how-it-works">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-[50px] text-center">
            <span className="mb-3 inline-block text-[11px] font-extrabold tracking-[2px] text-[#b45309]">HOW IT WORKS</span>
            <h2 className="text-[clamp(30px,4vw,42px)] tracking-[-1.5px] text-[#241c14]">Live in three simple steps</h2>
          </div>

          <div className="mx-auto grid max-w-[480px] grid-cols-1 gap-[22px] lg:max-w-none lg:grid-cols-3">
            {steps.map((s) => (
              <div key={s.number} className="rounded-2xl border border-[#e4d5b8] bg-[#fffdf8] p-[34px_28px] text-left">
                <div className="mb-4 text-[13px] font-extrabold tracking-[1.5px] text-[#b45309]">{s.number}</div>
                <strong className="mb-2.5 block text-[17px] text-[#2b2118]">{s.title}</strong>
                <p className="text-[13px] leading-[1.65] text-[#7d6f5c]">{s.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-11 flex justify-center">
            <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-[11px] bg-[#d97706] px-7 py-[15px] text-sm font-bold text-white shadow-[0_10px_30px_rgba(217,119,6,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#b45309] hover:shadow-[0_16px_38px_rgba(180,83,9,0.32)]">
              Create a free account
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1f2937] px-[18px] py-20 sm:px-6">
        <div className="mx-auto max-w-[640px] text-center">
          <h2 className="text-[clamp(28px,4vw,40px)] tracking-[-1.2px] text-white">Ready to fill more tables?</h2>
          <p className="mt-4 mb-[30px] text-[15px] leading-[1.7] text-[#aeb8c4]">
            Join restaurants using CQA Booking to simplify reservations
            and grow their business.
          </p>
          <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-[11px] bg-[#d97706] px-7 py-[15px] text-sm font-bold text-white shadow-[0_10px_30px_rgba(217,119,6,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#b45309] hover:shadow-[0_16px_38px_rgba(180,83,9,0.32)]">
            Get started now
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#171e2b] px-[18px] py-[30px] sm:px-6">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-center gap-[18px] text-center sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:text-left">
          <div className="flex items-center gap-2.5 text-sm font-extrabold tracking-[0.5px] text-white">
            <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px] bg-gradient-to-br from-[#d97706] to-[#92400e] shadow-[0_6px_18px_rgba(180,83,9,0.22)]">
              <Sparkles className="h-[18px] w-[18px] text-white" />
            </div>
            <span>
              CQA<em className="ml-1 text-[11px] font-normal not-italic tracking-[1.2px] text-[#d97706]">BOOKING</em>
            </span>
          </div>

          <div className="flex gap-[22px]">
            <Link href="/privacy" className="text-xs text-[#98a2b3] transition-colors hover:text-[#d97706]">Privacy</Link>
            <Link href="/terms" className="text-xs text-[#98a2b3] transition-colors hover:text-[#d97706]">Terms</Link>
            <Link href="/support" className="text-xs text-[#98a2b3] transition-colors hover:text-[#d97706]">Support</Link>
          </div>

          <div className="text-[11px] text-[#6b7686]">
            © {new Date().getFullYear()} CQA Booking. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
