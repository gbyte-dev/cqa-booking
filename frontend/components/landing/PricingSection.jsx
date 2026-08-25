import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';

const bullets = [
  'Unlimited venues on every plan',
  'No setup fees, cancel any time',
  'Onboarding support included',
];

const planFeatures = [
  'Online reservations',
  'Table management',
  'Guest CRM',
  'Deposits & payments',
  'Smart notifications',
  'Dashboards & reports',
  'Staff dashboard',
  'Promotions & loyalty',
];

export default function PricingSection() {
  return (
    <section
      id="pricing"
      className="bg-[#f8f9fb] px-4 py-16 sm:px-6 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-4 inline-flex items-center rounded-full border border-[#e4e7ec] bg-white px-3.5 py-1.5 text-[9px] font-extrabold uppercase tracking-[1.15px] text-[#667eea]">
          Simple, Transparent Pricing
        </div>

        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <h2 className="max-w-[540px] text-[clamp(28px,3.8vw,40px)] font-extrabold leading-[1.15] tracking-[-1.3px] text-[#101828]">
              Professional tools.
              <br />
              Predictable pricing.
            </h2>

            <p className="mt-5 max-w-[520px] text-[13px] leading-[1.8] text-[#667085]">
              One flat monthly plan covers every core feature — no surprise
              add-ons, no per-booking fees. Scale from a single venue to a
              full multi-location group without changing plans.
            </p>

            <ul className="mt-7 space-y-3">
              {bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex items-center gap-2.5 text-[12.5px] font-medium text-[#344054]"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#16a34a]/10">
                    <Check className="h-3 w-3 text-[#16a34a]" />
                  </span>
                  {bullet}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/tenant/register"
                className="group inline-flex items-center justify-center gap-2 rounded-[11px] bg-gradient-to-r from-[#667eea] to-[#764ba2] px-6 py-3.5 text-[13px] font-bold text-white shadow-[0_10px_26px_rgba(102,126,234,0.25)] transition-all hover:-translate-y-0.5"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                href="/tenant/register"
                className="inline-flex items-center justify-center rounded-[11px] border border-[#d0d5dd] bg-white px-6 py-3.5 text-[13px] font-bold text-[#344054] transition-colors hover:border-[#b8bfcb] hover:bg-[#fcfcfd]"
              >
                Book a Demo
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-5 rounded-[30px] bg-[#667eea]/[0.06] blur-2xl" />

            <div className="relative rounded-[22px] border border-[#e4e7ec] bg-white p-6 shadow-[0_25px_60px_rgba(16,24,40,0.09)] sm:p-8">
              <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.5px] text-[#667eea]">
                CQA Booking Plan
              </div>

              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-[36px] font-extrabold tracking-[-1.4px] text-[#101828] sm:text-[40px]">
                  $199–249
                </span>

                <span className="text-[12px] font-semibold text-[#667085]">
                  /month
                </span>
              </div>

              <div className="grid grid-cols-1 gap-y-2.5 sm:grid-cols-2 sm:gap-x-6">
                {planFeatures.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 text-[11.5px] text-[#344054]"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#16a34a]/10">
                      <Check className="h-3 w-3 text-[#16a34a]" />
                    </span>

                    {feature}
                  </div>
                ))}
              </div>

              <Link
                href="/tenant/register"
                className="mt-7 flex items-center justify-center rounded-[11px] bg-gradient-to-r from-[#667eea] to-[#764ba2] px-6 py-3.5 text-[13px] font-bold text-white shadow-[0_10px_26px_rgba(102,126,234,0.25)] transition-all hover:-translate-y-0.5"
              >
                Get Started
              </Link>

              <p className="mt-3 text-center text-[10px] text-[#98a2b3]">
                14-day free trial · No credit card required
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}