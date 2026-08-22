'use client';

import Link from 'next/link';
import {
  ArrowRight,
  MessageSquare,
  Phone,
  Lightbulb,
  Clock,
  Circle,
  Plus,
  MessageCircle,
} from 'lucide-react';

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fc] text-[#172033]">
      {/* =====================================================
          TOP NAV
      ===================================================== */}
      <nav className="relative z-10 h-[76px] max-[640px]:h-[68px] border-b border-[#e8ebf2] bg-white/92 backdrop-blur-[16px]">
        <div className="mx-auto flex h-full w-[min(1120px,calc(100%-40px))] max-[640px]:w-[min(100%-28px,1120px)] items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5 text-[#111827] no-underline">
            <span className="flex h-[34px] w-[34px] max-[640px]:h-[31px] max-[640px]:w-[31px] items-center justify-center rounded-[9px] bg-[#1e3a8a] text-[15px] font-extrabold text-white shadow-[0_5px_15px_rgba(30,58,138,0.22)]">
              C
            </span>
            <span className="text-[15px] max-[640px]:text-[13px] font-extrabold tracking-[0.4px]">
              CQA<span className="text-[#64748b] font-semibold">BOOKING</span>
            </span>
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center gap-[7px] rounded-[9px] border border-[#e2e6ee] bg-white px-[14px] py-[9px] max-[640px]:px-[10px] max-[640px]:py-[8px] text-[12px] max-[640px]:text-[11px] font-semibold text-[#475569] no-underline transition duration-200 hover:border-[#cbd5e1] hover:text-[#1e3a8a] hover:-translate-y-px"
          >
            Back to login
            <ArrowRight className="h-4 w-4 max-[640px]:hidden" strokeWidth={1.8} />
          </Link>
        </div>
      </nav>

      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="relative overflow-hidden border-b border-[#edf0f5] pt-[82px] pb-[88px] max-[640px]:pt-[60px] max-[640px]:pb-[65px] bg-[radial-gradient(circle_at_80%_15%,rgba(59,130,246,0.08),transparent_30%),linear-gradient(180deg,#ffffff_0%,#f7f8fc_100%)]">
        <div className="pointer-events-none absolute rounded-full h-[260px] w-[260px] -right-[100px] -top-[100px] bg-[rgba(37,99,235,0.055)] blur-[5px]" />
        <div className="pointer-events-none absolute rounded-full h-[180px] w-[180px] -left-[70px] -bottom-[90px] bg-[rgba(99,102,241,0.04)] blur-[5px]" />

        <div className="relative z-[2] mx-auto w-[min(1120px,calc(100%-40px))] max-[640px]:w-[min(100%-28px,1120px)] text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#dbe4f0] bg-white px-3 py-[7px] text-[10px] font-extrabold tracking-[1.5px] text-[#475569] shadow-[0_4px_15px_rgba(15,23,42,0.035)]">
            <span className="h-[6px] w-[6px] rounded-full bg-[#2563eb] shadow-[0_0_0_4px_rgba(37,99,235,0.09)]" />
            SUPPORT CENTER
          </div>

          <h1 className="mx-auto mt-[22px] max-w-[720px] text-[clamp(40px,6vw,62px)] max-[640px]:text-[42px] max-[400px]:text-[36px] font-extrabold leading-[1.04] tracking-[-2.8px] max-[640px]:tracking-[-2px] text-[#111827]">
            How can we
            <span className="text-[#2563eb]"> help you?</span>
          </h1>

          <p className="mx-auto mt-5 max-w-[590px] text-[15px] max-[640px]:text-[13px] leading-[1.75] max-[640px]:leading-[1.7] text-[#64748b]">
            Find answers, explore helpful resources, or connect with our
            support team whenever you need assistance.
          </p>
        </div>
      </section>

      {/* =====================================================
          SUPPORT OPTIONS
      ===================================================== */}
      <section className="py-[60px] pb-[70px] max-[640px]:py-10 max-[640px]:pb-[50px]">
        <div className="mx-auto w-[min(1120px,calc(100%-40px))] max-[640px]:w-[min(100%-28px,1120px)]">

          <div className="grid grid-cols-3 max-[900px]:grid-cols-1 gap-[18px] max-[640px]:gap-[13px]">

            {/* Contact Support */}
            <div className="group relative min-h-[275px] max-[900px]:min-h-0 overflow-hidden rounded-2xl border border-[#e5e9f0] bg-white p-[25px] max-[640px]:p-[22px] shadow-[0_8px_30px_rgba(15,23,42,0.035)] transition duration-200 hover:-translate-y-[5px] hover:border-[#d6deeb] hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] after:pointer-events-none after:absolute after:-right-[65px] after:-bottom-[65px] after:h-[130px] after:w-[130px] after:rounded-full after:bg-[rgba(37,99,235,0.035)] after:content-['']">
              <div className="mb-[22px] flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-[13px] bg-[#eff6ff] text-[#2563eb]">
                  <MessageSquare className="h-[23px] w-[23px]" strokeWidth={1.8} />
                </div>

                <span className="flex h-[31px] w-[31px] items-center justify-center rounded-full bg-[#f8fafc] text-[#94a3b8] transition duration-200 group-hover:translate-x-0.5 group-hover:bg-[#eff6ff] group-hover:text-[#2563eb]">
                  <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
                </span>
              </div>

              <h3 className="mb-[9px] text-[17px] font-bold tracking-[-0.2px] text-[#172033]">Contact support</h3>

              <p className="min-h-[62px] max-[900px]:min-h-0 mb-[15px] text-[12.5px] leading-[1.7] text-[#718096]">
                Have a question or facing an issue? Our support team is ready
                to help.
              </p>

              <a
                href="mailto:support@cqabooking.com"
                className="inline-flex items-center text-[13px] font-bold text-[#2563eb] no-underline hover:underline"
              >
                support@cqabooking.com
              </a>

              <div className="mt-[19px] flex items-center gap-[7px] border-t border-[#edf0f4] pt-[15px] text-[10.5px] text-[#94a3b8]">
                <span className="h-[6px] w-[6px] shrink-0 rounded-full bg-[#22c55e] shadow-[0_0_0_3px_rgba(34,197,94,0.09)]" />
                Usually responds within 24 hours
              </div>
            </div>

            {/* Phone Support */}
            <div className="group relative min-h-[275px] max-[900px]:min-h-0 overflow-hidden rounded-2xl border border-[#e5e9f0] bg-white p-[25px] max-[640px]:p-[22px] shadow-[0_8px_30px_rgba(15,23,42,0.035)] transition duration-200 hover:-translate-y-[5px] hover:border-[#d6deeb] hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] after:pointer-events-none after:absolute after:-right-[65px] after:-bottom-[65px] after:h-[130px] after:w-[130px] after:rounded-full after:bg-[rgba(37,99,235,0.035)] after:content-['']">
              <div className="mb-[22px] flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-[13px] bg-[#eff6ff] text-[#2563eb]">
                  <Phone className="h-[23px] w-[23px]" strokeWidth={1.8} />
                </div>

                <span className="flex h-[31px] w-[31px] items-center justify-center rounded-full bg-[#f8fafc] text-[#94a3b8] transition duration-200 group-hover:translate-x-0.5 group-hover:bg-[#eff6ff] group-hover:text-[#2563eb]">
                  <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
                </span>
              </div>

              <h3 className="mb-[9px] text-[17px] font-bold tracking-[-0.2px] text-[#172033]">Phone support</h3>

              <p className="min-h-[62px] max-[900px]:min-h-0 mb-[15px] text-[12.5px] leading-[1.7] text-[#718096]">
                Speak directly with our team during regular business hours.
              </p>

              <a href="tel:+919999999999" className="inline-flex items-center text-[13px] font-bold text-[#2563eb] no-underline hover:underline">
                +91 99999 99999
              </a>

              <div className="mt-[19px] flex items-center gap-[7px] border-t border-[#edf0f4] pt-[15px] text-[10.5px] text-[#94a3b8]">
                <span className="flex items-center text-[#94a3b8]">
                  <Clock className="h-[13px] w-[13px]" strokeWidth={1.8} />
                </span>
                Monâ€“Fri Â· 9:00 AMâ€“6:00 PM IST
              </div>
            </div>

            {/* Guides */}
            <div className="group relative min-h-[275px] max-[900px]:min-h-0 overflow-hidden rounded-2xl border border-[#e5e9f0] bg-white p-[25px] max-[640px]:p-[22px] shadow-[0_8px_30px_rgba(15,23,42,0.035)] transition duration-200 hover:-translate-y-[5px] hover:border-[#d6deeb] hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] after:pointer-events-none after:absolute after:-right-[65px] after:-bottom-[65px] after:h-[130px] after:w-[130px] after:rounded-full after:bg-[rgba(37,99,235,0.035)] after:content-['']">
              <div className="mb-[22px] flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-[13px] bg-[#eff6ff] text-[#2563eb]">
                  <Lightbulb className="h-[23px] w-[23px]" strokeWidth={1.8} />
                </div>

                <span className="flex h-[31px] w-[31px] items-center justify-center rounded-full bg-[#f8fafc] text-[#94a3b8] transition duration-200 group-hover:translate-x-0.5 group-hover:bg-[#eff6ff] group-hover:text-[#2563eb]">
                  <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
                </span>
              </div>

              <h3 className="mb-[9px] text-[17px] font-bold tracking-[-0.2px] text-[#172033]">Self-help guides</h3>

              <p className="min-h-[62px] max-[900px]:min-h-0 mb-[15px] text-[12.5px] leading-[1.7] text-[#718096]">
                Explore helpful guides and learn how to get the most out of
                CQA Booking.
              </p>

              <a
                href="mailto:support@cqabooking.com?subject=Documentation%20request"
                className="inline-flex items-center text-[13px] font-bold text-[#2563eb] no-underline hover:underline"
              >
                Request guides
              </a>

              <div className="mt-[19px] flex items-center gap-[7px] border-t border-[#edf0f4] pt-[15px] text-[10.5px] text-[#94a3b8]">
                <span className="flex items-center text-[#94a3b8]">
                  <Circle className="h-2 w-2 fill-current" strokeWidth={0} />
                </span>
                Helpful resources available
              </div>
            </div>
          </div>

          {/* =====================================================
              FAQ
          ===================================================== */}
          <section className="mt-[78px] max-[640px]:mt-[55px]">
            <div className="mb-7 flex items-end justify-between gap-10 max-[900px]:flex-col max-[900px]:items-start max-[900px]:gap-2.5">
              <div>
                <span className="mb-2 block text-[10px] font-extrabold tracking-[1.5px] text-[#2563eb]">HELP CENTER</span>
                <h2 className="m-0 text-[27px] max-[640px]:text-[23px] tracking-[-0.8px] text-[#172033]">Frequently asked questions</h2>
              </div>

              <p className="m-0 max-w-[350px] max-[900px]:max-w-[550px] text-right max-[900px]:text-left text-[12px] leading-[1.7] text-[#7b8799]">
                Quick answers to some of the most common questions about
                CQA Booking.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#e5e9f0] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.025)]">

              <div className="group grid grid-cols-[45px_1fr_32px] max-[640px]:grid-cols-[32px_1fr_29px] max-[400px]:grid-cols-[1fr_27px] items-start gap-[15px] max-[640px]:gap-2 border-b border-[#edf0f4] px-[27px] max-[640px]:px-[17px] py-[25px] max-[640px]:py-[21px] transition duration-200 hover:bg-[#fafcff]">
                <div className="max-[400px]:hidden pt-0.5 text-[11px] max-[640px]:text-[10px] font-extrabold text-[#2563eb]">01</div>

                <div>
                  <h3 className="mb-2 text-[14px] max-[640px]:text-[13px] font-bold text-[#202a3a]">How do I create an organization account?</h3>

                  <p className="m-0 max-w-[760px] text-[12px] max-[640px]:text-[11.5px] leading-[1.75] text-[#718096]">
                    Visit the{' '}
                    <Link href="/tenant/register" className="font-semibold text-[#2563eb]">
                      registration page
                    </Link>{' '}
                    and enter your organization details. Once registration is
                    completed, you can access your organization dashboard.
                  </p>
                </div>

                <div className="flex h-[29px] w-[29px] items-center justify-center rounded-lg border border-[#e4e8ef] text-[#94a3b8] transition duration-200 group-hover:border-[#bfdbfe] group-hover:bg-[#eff6ff] group-hover:text-[#2563eb]">
                  <Plus className="h-4 w-4" strokeWidth={1.8} />
                </div>
              </div>

              <div className="group grid grid-cols-[45px_1fr_32px] max-[640px]:grid-cols-[32px_1fr_29px] max-[400px]:grid-cols-[1fr_27px] items-start gap-[15px] max-[640px]:gap-2 border-b border-[#edf0f4] px-[27px] max-[640px]:px-[17px] py-[25px] max-[640px]:py-[21px] transition duration-200 hover:bg-[#fafcff]">
                <div className="max-[400px]:hidden pt-0.5 text-[11px] max-[640px]:text-[10px] font-extrabold text-[#2563eb]">02</div>

                <div>
                  <h3 className="mb-2 text-[14px] max-[640px]:text-[13px] font-bold text-[#202a3a]">How do I add a venue and tables?</h3>

                  <p className="m-0 max-w-[760px] text-[12px] max-[640px]:text-[11.5px] leading-[1.75] text-[#718096]">
                    After signing in, open <strong>Venues</strong> from your
                    sidebar to create a venue. You can then manage your tables
                    from the <strong>Tables</strong> section.
                  </p>
                </div>

                <div className="flex h-[29px] w-[29px] items-center justify-center rounded-lg border border-[#e4e8ef] text-[#94a3b8] transition duration-200 group-hover:border-[#bfdbfe] group-hover:bg-[#eff6ff] group-hover:text-[#2563eb]">
                  <Plus className="h-4 w-4" strokeWidth={1.8} />
                </div>
              </div>

              <div className="group grid grid-cols-[45px_1fr_32px] max-[640px]:grid-cols-[32px_1fr_29px] max-[400px]:grid-cols-[1fr_27px] items-start gap-[15px] max-[640px]:gap-2 border-b border-[#edf0f4] px-[27px] max-[640px]:px-[17px] py-[25px] max-[640px]:py-[21px] transition duration-200 hover:bg-[#fafcff]">
                <div className="max-[400px]:hidden pt-0.5 text-[11px] max-[640px]:text-[10px] font-extrabold text-[#2563eb]">03</div>

                <div>
                  <h3 className="mb-2 text-[14px] max-[640px]:text-[13px] font-bold text-[#202a3a]">How do guests make bookings?</h3>

                  <p className="m-0 max-w-[760px] text-[12px] max-[640px]:text-[11.5px] leading-[1.75] text-[#718096]">
                    Each venue can have a public booking page such as{' '}
                    <code className="rounded-[5px] border border-[#e4eaf2] bg-[#f8fafc] px-[7px] py-[3px] font-mono text-[10.5px] text-[#475569]">/book/your-venue-slug</code>. Share this link with
                    your guests so they can view availability and make
                    reservations.
                  </p>
                </div>

                <div className="flex h-[29px] w-[29px] items-center justify-center rounded-lg border border-[#e4e8ef] text-[#94a3b8] transition duration-200 group-hover:border-[#bfdbfe] group-hover:bg-[#eff6ff] group-hover:text-[#2563eb]">
                  <Plus className="h-4 w-4" strokeWidth={1.8} />
                </div>
              </div>

              <div className="group grid grid-cols-[45px_1fr_32px] max-[640px]:grid-cols-[32px_1fr_29px] max-[400px]:grid-cols-[1fr_27px] items-start gap-[15px] max-[640px]:gap-2 px-[27px] max-[640px]:px-[17px] py-[25px] max-[640px]:py-[21px] transition duration-200 hover:bg-[#fafcff]">
                <div className="max-[400px]:hidden pt-0.5 text-[11px] max-[640px]:text-[10px] font-extrabold text-[#2563eb]">04</div>

                <div>
                  <h3 className="mb-2 text-[14px] max-[640px]:text-[13px] font-bold text-[#202a3a]">How do I upgrade my plan?</h3>

                  <p className="m-0 max-w-[760px] text-[12px] max-[640px]:text-[11.5px] leading-[1.75] text-[#718096]">
                    Contact your platform administrator to change your
                    subscription plan, or reach out to our support team for
                    assistance with your account.
                  </p>
                </div>

                <div className="flex h-[29px] w-[29px] items-center justify-center rounded-lg border border-[#e4e8ef] text-[#94a3b8] transition duration-200 group-hover:border-[#bfdbfe] group-hover:bg-[#eff6ff] group-hover:text-[#2563eb]">
                  <Plus className="h-4 w-4" strokeWidth={1.8} />
                </div>
              </div>

            </div>
          </section>

          {/* =====================================================
              BOTTOM CTA
          ===================================================== */}
          <section className="relative mt-[55px] flex items-center gap-5 max-[640px]:flex-wrap max-[640px]:items-start overflow-hidden rounded-[17px] border border-[#dce5f5] px-[30px] max-[640px]:px-[22px] py-7 max-[640px]:py-[22px] bg-[linear-gradient(110deg,#f8fbff_0%,#eef5ff_100%)]">
            <div className="pointer-events-none absolute h-[180px] w-[180px] -right-[50px] -top-[90px] rounded-full bg-[rgba(37,99,235,0.08)]" />

            <div className="relative z-[1] flex h-12 w-12 shrink-0 items-center justify-center rounded-[13px] bg-[#2563eb] text-white shadow-[0_8px_20px_rgba(37,99,235,0.2)]">
              <MessageCircle className="h-6 w-6" strokeWidth={1.8} />
            </div>

            <div className="relative z-[1] flex-1 max-[640px]:min-w-[calc(100%-70px)]">
              <h2 className="mb-[5px] text-[16px] text-[#172033]">Still need help?</h2>
              <p className="m-0 text-[11.5px] leading-[1.6] text-[#6b7890]">
                Our support team is happy to help you with your account,
                bookings, venues, or any other questions.
              </p>
            </div>

            <a
              href="mailto:support@cqabooking.com"
              className="relative z-[1] inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[9px] bg-[#1e3a8a] px-[17px] py-[11px] text-[11.5px] font-bold text-white no-underline shadow-[0_6px_18px_rgba(30,58,138,0.16)] transition duration-200 hover:bg-[#1d4ed8] hover:-translate-y-px max-[640px]:mt-[5px] max-[640px]:w-full"
            >
              Contact support
              <ArrowRight className="h-[17px] w-[17px]" strokeWidth={1.8} />
            </a>
          </section>

        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="border-t border-[#e5e9f0] bg-white">
        <div className="mx-auto w-[min(1120px,calc(100%-40px))] max-[640px]:w-[min(100%-28px,1120px)] flex min-h-[70px] max-[640px]:min-h-[90px] items-center max-[640px]:items-start justify-between max-[640px]:justify-center gap-5 max-[640px]:flex-col max-[640px]:py-5 text-[11px] text-[#94a3b8]">
          <span>
            Â© {new Date().getFullYear()} CQA Booking
          </span>

          <div className="flex gap-[22px] max-[640px]:gap-[15px]">
            <Link href="/" className="text-[#64748b] no-underline transition duration-200 hover:text-[#2563eb]">Home</Link>
            <Link href="/login" className="text-[#64748b] no-underline transition duration-200 hover:text-[#2563eb]">Login</Link>
            <Link href="/tenant/register" className="text-[#64748b] no-underline transition duration-200 hover:text-[#2563eb]">Register</Link>
          </div>
        </div>
      </footer>

    </main>
  );
}
