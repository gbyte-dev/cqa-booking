import Link from 'next/link';
import {
  ArrowRight,
  LogIn,
  Circle,
  Rocket,
  Layers,
  ShieldCheck,
  TrendingUp,
  Users,
  CalendarCheck,
} from 'lucide-react';

const bullets = [
  {
    icon: Rocket,
    text: 'Weeks to Launch',
  },
  {
    icon: Layers,
    text: 'SaaS Multi-Tenant Platform',
  },
  {
    icon: ShieldCheck,
    text: 'Secure. Scalable. Built for Hospitality.',
  },
];

const reservations = [
  {
    name: 'A. Whitfield',
    time: '7:30 PM',
    guests: 4,
    status: 'Confirmed',
  },
  {
    name: 'M. Okafor',
    time: '8:00 PM',
    guests: 2,
    status: 'Seated',
  },
  {
    name: 'R. Delgado',
    time: '8:15 PM',
    guests: 6,
    status: 'Confirmed',
  },
];

const stats = [
  {
    label: "Today's Bookings",
    value: '128',
  },
  {
    label: 'Covers Booked',
    value: '412',
  },
  {
    label: 'No-Show Rate',
    value: '3.2%',
  },
  {
    label: 'Revenue',
    value: '$18.4k',
  },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#080b14] px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24 lg:pb-32 lg:pt-28">
      <div className="pointer-events-none absolute left-[-180px] top-[-220px] h-[560px] w-[560px] rounded-full bg-[#667eea]/[0.14] blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-260px] right-[-180px] h-[560px] w-[560px] rounded-full bg-[#764ba2]/[0.14] blur-[120px]" />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      <div className="relative z-10 mx-auto grid max-w-[1240px] items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#818cf8]/20 bg-[#818cf8]/[0.07] px-3.5 py-2 text-[9px] font-extrabold uppercase tracking-[1.15px] text-[#9da8ff]">
            <Circle
              className="h-[7px] w-[7px] fill-[#6ee7b7] text-[#6ee7b7]"
              aria-hidden="true"
            />
            Powered by CQA — Concept Quality Assurance
          </div>

          <h1 className="mt-6 max-w-[680px] text-[clamp(38px,5.5vw,64px)] font-extrabold leading-[1.04] tracking-[-2.8px] text-[#f5f7fb]">
            Fill more tables.
            <br />
            Know your guests.
            <br />
            <span className="bg-gradient-to-r from-[#8b95f9] to-[#a78bfa] bg-clip-text text-transparent">
              Bring them back.
            </span>
          </h1>

          <p className="mt-7 max-w-[560px] text-[14px] leading-[1.8] text-[#818ca0] sm:text-[15px]">
            CQA Booking is the multi-tenant reservations and guest management
            platform built for independent restaurants, bars, cafés, and
            beach clubs — fill tables, understand your guests, and turn
            first-timers into regulars.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/tenant/register"
              className="group inline-flex items-center justify-center gap-2 rounded-[11px] bg-gradient-to-r from-[#667eea] to-[#764ba2] px-7 py-3.5 text-[13px] font-bold text-white shadow-[0_12px_30px_rgba(102,126,234,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(102,126,234,0.38)]"
            >
              Start Free Trial
              <ArrowRight className="h-[17px] w-[17px] transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/tenant/register"
              className="inline-flex items-center justify-center gap-2 rounded-[11px] border border-white/[0.14] bg-white/[0.015] px-7 py-3.5 text-[13px] font-bold text-white transition-all hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.04]"
            >
              <LogIn className="h-4 w-4" />
              Book a Demo
            </Link>
          </div>

          <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3.5">
            {bullets.map((bullet) => (
              <div
                key={bullet.text}
                className="flex items-center gap-2 text-[10.5px] font-semibold text-[#8f99ac] sm:text-[11px]"
              >
                <bullet.icon className="h-[14px] w-[14px] text-[#8b95f9]" />
                {bullet.text}
              </div>
            ))}
          </div>
        </div>

        <div className="relative lg:pl-3">
          <div className="absolute -inset-6 rounded-[40px] bg-[#667eea]/[0.06] blur-3xl" />

          <div className="relative overflow-hidden rounded-[18px] border border-white/[0.09] bg-[#0e1320] shadow-[0_35px_90px_rgba(0,0,0,0.48)]">
            <div className="flex h-11 items-center gap-1.5 border-b border-white/[0.06] bg-[#0b0f1a] px-4">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f87171]/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#6ee7b7]/70" />

              <span className="ml-3 truncate text-[9px] text-[#525d71]">
                app.cqabooking.com/overview
              </span>

              <span className="ml-auto rounded-md bg-white/[0.04] px-2 py-1 text-[8px] text-[#626d80]">
                LIVE
              </span>
            </div>

            <div className="p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-[14px] font-bold text-white">
                    Overview
                  </div>
                  <div className="mt-0.5 text-[9px] text-[#596477]">
                    Tuesday, 25 August
                  </div>
                </div>

                <span className="rounded-full border border-[#6ee7b7]/10 bg-[#6ee7b7]/[0.08] px-2.5 py-1 text-[8px] font-bold text-[#6ee7b7]">
                  Live
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3.5 transition-colors hover:bg-white/[0.04]"
                  >
                    <div className="text-[18px] font-extrabold tracking-[-0.4px] text-white">
                      {stat.value}
                    </div>

                    <div className="mt-1 text-[9px] font-medium text-[#7a8399]">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3.5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#c8ced9]">
                    Bookings Trend
                  </span>

                  <TrendingUp className="h-3.5 w-3.5 text-[#8b95f9]" />
                </div>

                <div className="flex h-[68px] items-end gap-1.5">
                  {[40, 65, 50, 80, 60, 90, 72].map((height, index) => (
                    <div
                      key={index}
                      className="flex-1 rounded-t-[3px] bg-gradient-to-t from-[#667eea] to-[#818cf8]"
                      style={{
                        height: `${height}%`,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#c8ced9]">
                    Upcoming Reservations
                  </span>

                  <span className="text-[8px] text-[#687286]">
                    View all
                  </span>
                </div>

                <div className="space-y-2">
                  {reservations.map((reservation) => (
                    <div
                      key={reservation.name}
                      className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.018] px-3 py-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#667eea]/10 text-[#8b95f9]">
                          <Users className="h-3.5 w-3.5" />
                        </div>

                        <div className="min-w-0">
                          <div className="truncate text-[10.5px] font-semibold text-white">
                            {reservation.name}
                          </div>

                          <div className="text-[8.5px] text-[#7a8399]">
                            {reservation.time} · {reservation.guests} guests
                          </div>
                        </div>
                      </div>

                      <span className="shrink-0 rounded-full bg-[#818cf8]/[0.1] px-2 py-1 text-[8px] font-bold text-[#9da8ff]">
                        {reservation.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="flex items-center gap-2 rounded-lg border border-white/[0.05] bg-white/[0.018] p-2.5">
                  <CalendarCheck className="h-3.5 w-3.5 text-[#8b95f9]" />
                  <span className="text-[8px] text-[#7a8399]">
                    Reservations
                  </span>
                </div>

                <div className="hidden items-center gap-2 rounded-lg border border-white/[0.05] bg-white/[0.018] p-2.5 sm:flex">
                  <Users className="h-3.5 w-3.5 text-[#8b95f9]" />
                  <span className="text-[8px] text-[#7a8399]">
                    Guest CRM
                  </span>
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-white/[0.05] bg-white/[0.018] p-2.5">
                  <TrendingUp className="h-3.5 w-3.5 text-[#8b95f9]" />
                  <span className="text-[8px] text-[#7a8399]">
                    Analytics
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}