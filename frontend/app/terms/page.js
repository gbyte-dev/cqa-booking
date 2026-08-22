'use client';

import Link from 'next/link';
import {
  ArrowRight,
  FileText,
  ShieldMinus,
  CircleDollarSign,
  List,
  Check,
  X,
  AlertTriangle,
  MessageCircle,
} from 'lucide-react';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fc] text-[#172033]">

      {/* =====================================================
          NAVIGATION
      ===================================================== */}
      <nav className="relative z-10 h-[76px] max-[640px]:h-[68px] border-b border-[#e8ebf2] bg-white/94 backdrop-blur-[16px]">
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
            href="/support"
            className="inline-flex items-center gap-[7px] rounded-[9px] border border-[#e2e6ee] bg-white px-[14px] py-[9px] max-[640px]:px-[10px] max-[640px]:py-[8px] text-[12px] max-[640px]:text-[10.5px] font-semibold text-[#475569] no-underline transition duration-200 hover:border-[#cbd5e1] hover:text-[#2563eb] hover:-translate-y-px"
          >
            Support Center
            <ArrowRight className="h-4 w-4 max-[640px]:hidden" strokeWidth={1.8} />
          </Link>
        </div>
      </nav>

      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="relative overflow-hidden border-b border-[#edf0f5] pt-[75px] pb-[70px] max-[640px]:pt-[55px] max-[640px]:pb-[55px] bg-[radial-gradient(circle_at_80%_15%,rgba(59,130,246,0.08),transparent_30%),linear-gradient(180deg,#ffffff_0%,#f7f8fc_100%)]">
        <div className="pointer-events-none absolute rounded-full h-[280px] w-[280px] -right-[100px] -top-[120px] bg-[rgba(37,99,235,0.055)] blur-[5px]" />
        <div className="pointer-events-none absolute rounded-full h-[180px] w-[180px] -left-[80px] -bottom-[90px] bg-[rgba(99,102,241,0.04)]" />

        <div className="relative z-[2] mx-auto w-[min(1120px,calc(100%-40px))] max-[640px]:w-[min(100%-28px,1120px)]">

          <div className="inline-flex items-center gap-2 rounded-full border border-[#dbe4f0] bg-white px-3 py-[7px] text-[10px] max-[400px]:text-[9px] font-extrabold tracking-[1.5px] text-[#475569] shadow-[0_4px_15px_rgba(15,23,42,0.035)]">
            <span className="flex items-center justify-center text-[#2563eb]">
              <FileText className="h-[13px] w-[13px]" strokeWidth={1.8} />
            </span>
            TERMS OF SERVICE
          </div>

          <h1 className="mt-[21px] max-w-[800px] text-[clamp(40px,6vw,58px)] max-[640px]:text-[40px] max-[400px]:text-[35px] font-extrabold leading-[1.05] tracking-[-2.6px] max-[640px]:tracking-[-2px] text-[#111827]">
            Terms that keep
            <span className="text-[#2563eb]"> CQA Booking clear.</span>
          </h1>

          <p className="mt-[18px] max-w-[610px] text-[14px] max-[640px]:text-[13px] leading-[1.75] text-[#64748b]">
            Please review these terms carefully before creating an account
            or using the CQA Booking platform.
          </p>

          <div className="mt-[22px] inline-flex items-center gap-2 text-[11px] font-medium text-[#94a3b8]">
            <span className="h-[6px] w-[6px] rounded-full bg-[#22c55e] shadow-[0_0_0_4px_rgba(34,197,94,0.09)]" />
            Last updated: August 2026
          </div>

        </div>
      </section>

      {/* =====================================================
          CONTENT
      ===================================================== */}
      <section className="py-[60px] pb-[70px] max-[640px]:py-[35px] max-[640px]:pb-[50px]">
        <div className="mx-auto w-[min(1120px,calc(100%-40px))] max-[640px]:w-[min(100%-28px,1120px)]">

          <div className="grid grid-cols-[215px_minmax(0,1fr)] max-[900px]:grid-cols-1 gap-[65px] max-[900px]:gap-[25px] items-start">

            {/* =================================================
                SIDEBAR
            ================================================= */}
            <aside className="sticky top-[25px] max-[900px]:static rounded-[14px] border border-[#e5e9f0] bg-white p-[19px] max-[900px]:flex max-[900px]:flex-wrap max-[900px]:items-center max-[900px]:gap-1 max-[900px]:p-3 shadow-[0_8px_30px_rgba(15,23,42,0.025)] max-[640px]:hidden">

              <div className="mb-3 max-[900px]:w-full max-[900px]:mx-[7px] max-[900px]:mt-[3px] max-[900px]:mb-[5px] text-[10px] font-extrabold uppercase tracking-[1px] text-[#172033]">
                On this page
              </div>

              <a href="#acceptance" className="group flex items-center gap-[9px] rounded-[7px] px-[7px] py-[9px] text-[10.5px] leading-[1.4] text-[#718096] no-underline transition duration-200 hover:bg-[#f5f8ff] hover:text-[#2563eb] max-[900px]:flex-1 max-[900px]:min-w-[120px]">
                <span className="text-[9px] font-extrabold text-[#b0bac8] group-hover:text-[#2563eb]">01</span>
                Acceptance of terms
              </a>

              <a href="#accounts" className="group flex items-center gap-[9px] rounded-[7px] px-[7px] py-[9px] text-[10.5px] leading-[1.4] text-[#718096] no-underline transition duration-200 hover:bg-[#f5f8ff] hover:text-[#2563eb] max-[900px]:flex-1 max-[900px]:min-w-[120px]">
                <span className="text-[9px] font-extrabold text-[#b0bac8] group-hover:text-[#2563eb]">02</span>
                Accounts
              </a>

              <a href="#subscriptions" className="group flex items-center gap-[9px] rounded-[7px] px-[7px] py-[9px] text-[10.5px] leading-[1.4] text-[#718096] no-underline transition duration-200 hover:bg-[#f5f8ff] hover:text-[#2563eb] max-[900px]:flex-1 max-[900px]:min-w-[120px]">
                <span className="text-[9px] font-extrabold text-[#b0bac8] group-hover:text-[#2563eb]">03</span>
                Subscriptions &amp; plans
              </a>

              <a href="#acceptable-use" className="group flex items-center gap-[9px] rounded-[7px] px-[7px] py-[9px] text-[10.5px] leading-[1.4] text-[#718096] no-underline transition duration-200 hover:bg-[#f5f8ff] hover:text-[#2563eb] max-[900px]:flex-1 max-[900px]:min-w-[120px]">
                <span className="text-[9px] font-extrabold text-[#b0bac8] group-hover:text-[#2563eb]">04</span>
                Acceptable use
              </a>

              <a href="#termination" className="group flex items-center gap-[9px] rounded-[7px] px-[7px] py-[9px] text-[10.5px] leading-[1.4] text-[#718096] no-underline transition duration-200 hover:bg-[#f5f8ff] hover:text-[#2563eb] max-[900px]:flex-1 max-[900px]:min-w-[120px]">
                <span className="text-[9px] font-extrabold text-[#b0bac8] group-hover:text-[#2563eb]">05</span>
                Termination
              </a>

              <a href="#liability" className="group flex items-center gap-[9px] rounded-[7px] px-[7px] py-[9px] text-[10.5px] leading-[1.4] text-[#718096] no-underline transition duration-200 hover:bg-[#f5f8ff] hover:text-[#2563eb] max-[900px]:flex-1 max-[900px]:min-w-[120px]">
                <span className="text-[9px] font-extrabold text-[#b0bac8] group-hover:text-[#2563eb]">06</span>
                Limitation of liability
              </a>

              <a href="#contact" className="group flex items-center gap-[9px] rounded-[7px] px-[7px] py-[9px] text-[10.5px] leading-[1.4] text-[#718096] no-underline transition duration-200 hover:bg-[#f5f8ff] hover:text-[#2563eb] max-[900px]:flex-1 max-[900px]:min-w-[120px]">
                <span className="text-[9px] font-extrabold text-[#b0bac8] group-hover:text-[#2563eb]">07</span>
                Contact
              </a>

            </aside>

            {/* =================================================
                DOCUMENT
            ================================================= */}
            <article className="max-w-[760px] max-[900px]:max-w-none rounded-[17px] border border-[#e5e9f0] bg-white px-[38px] py-[10px] max-[640px]:rounded-[14px] max-[640px]:px-5 max-[640px]:py-1 max-[400px]:px-[17px] shadow-[0_10px_35px_rgba(15,23,42,0.035)]">

              {/* 01 */}
              <section className="grid grid-cols-[42px_1fr] max-[640px]:grid-cols-1 gap-[17px] max-[640px]:gap-3 border-b border-[#edf0f4] py-[34px] max-[640px]:py-[27px]" id="acceptance">
                <div className="flex h-8 w-8 max-[640px]:h-[30px] max-[640px]:w-[30px] items-center justify-center rounded-[9px] bg-[#eff6ff] text-[9px] font-extrabold text-[#2563eb]">01</div>

                <div>
                  <h2 className="mt-[2px] mb-[11px] text-[18px] max-[640px]:text-[17px] font-[750] tracking-[-0.3px] text-[#172033]">Acceptance of terms</h2>

                  <p className="mb-[13px] last-of-type:mb-0 text-[12.5px] max-[640px]:text-[12px] leading-[1.85] max-[640px]:leading-[1.8] text-[#68778c]">
                    By creating an account or using CQA Booking, you agree
                    to these Terms of Service and any applicable policies
                    referenced by the platform.
                  </p>

                  <p className="mb-[13px] last-of-type:mb-0 text-[12.5px] max-[640px]:text-[12px] leading-[1.85] max-[640px]:leading-[1.8] text-[#68778c]">
                    If you do not agree with these terms, please do not
                    create an account or use the CQA Booking platform.
                  </p>
                </div>
              </section>

              {/* 02 */}
              <section className="grid grid-cols-[42px_1fr] max-[640px]:grid-cols-1 gap-[17px] max-[640px]:gap-3 border-b border-[#edf0f4] py-[34px] max-[640px]:py-[27px]" id="accounts">
                <div className="flex h-8 w-8 max-[640px]:h-[30px] max-[640px]:w-[30px] items-center justify-center rounded-[9px] bg-[#eff6ff] text-[9px] font-extrabold text-[#2563eb]">02</div>

                <div>
                  <h2 className="mt-[2px] mb-[11px] text-[18px] max-[640px]:text-[17px] font-[750] tracking-[-0.3px] text-[#172033]">Accounts</h2>

                  <p className="mb-[13px] last-of-type:mb-0 text-[12.5px] max-[640px]:text-[12px] leading-[1.85] max-[640px]:leading-[1.8] text-[#68778c]">
                    You are responsible for maintaining the confidentiality
                    of your account credentials and for activity performed
                    through your account.
                  </p>

                  <p className="mb-[13px] last-of-type:mb-0 text-[12.5px] max-[640px]:text-[12px] leading-[1.85] max-[640px]:leading-[1.8] text-[#68778c]">
                    You must provide accurate and current information when
                    registering and keep your account information up to date.
                  </p>

                  <div className="mt-[22px] flex items-start gap-3 rounded-[10px] border border-[#dbeafe] bg-[#f7fbff] p-[15px]">
                    <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-[#eaf3ff] text-[#2563eb]">
                      <ShieldMinus className="h-[17px] w-[17px]" strokeWidth={1.8} />
                    </div>

                    <div>
                      <strong className="block mb-[3px] text-[11px] text-[#1e3a8a] font-bold">Keep your account secure.</strong>

                      <span className="block text-[10.5px] leading-[1.5] text-[#718096]">
                        Do not share your login credentials or allow
                        unauthorized users to access your account.
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 03 */}
              <section className="grid grid-cols-[42px_1fr] max-[640px]:grid-cols-1 gap-[17px] max-[640px]:gap-3 border-b border-[#edf0f4] py-[34px] max-[640px]:py-[27px]" id="subscriptions">
                <div className="flex h-8 w-8 max-[640px]:h-[30px] max-[640px]:w-[30px] items-center justify-center rounded-[9px] bg-[#eff6ff] text-[9px] font-extrabold text-[#2563eb]">03</div>

                <div>
                  <h2 className="mt-[2px] mb-[11px] text-[18px] max-[640px]:text-[17px] font-[750] tracking-[-0.3px] text-[#172033]">Subscriptions &amp; plans</h2>

                  <p className="mb-[13px] last-of-type:mb-0 text-[12.5px] max-[640px]:text-[12px] leading-[1.85] max-[640px]:leading-[1.8] text-[#68778c]">
                    Paid plans renew automatically unless cancelled before
                    the applicable renewal date. Fees are charged in advance
                    according to the selected plan.
                  </p>

                  <p className="mb-[13px] last-of-type:mb-0 text-[12.5px] max-[640px]:text-[12px] leading-[1.85] max-[640px]:leading-[1.8] text-[#68778c]">
                    Subscription fees are generally non-refundable except
                    where a refund is required by applicable law or expressly
                    provided by the applicable plan terms.
                  </p>

                  <p className="mb-[13px] last-of-type:mb-0 text-[12.5px] max-[640px]:text-[12px] leading-[1.85] max-[640px]:leading-[1.8] text-[#68778c]">
                    We may modify plan features or pricing from time to time.
                    Where appropriate, we will provide reasonable notice
                    before material changes take effect.
                  </p>

                  <div className="mt-[22px] grid grid-cols-2 max-[640px]:grid-cols-1 gap-[10px]">

                    <div className="flex items-center gap-[10px] rounded-[10px] border border-[#e9edf3] bg-[#fafbfd] p-[13px]">
                      <div className="flex h-[31px] w-[31px] shrink-0 items-center justify-center rounded-lg bg-[#eff6ff] text-[#2563eb]">
                        <CircleDollarSign className="h-[17px] w-[17px]" strokeWidth={1.8} />
                      </div>

                      <div>
                        <strong className="block mb-0.5 text-[10.5px] text-[#334155] font-bold">Automatic renewal</strong>
                        <span className="block text-[9.5px] text-[#94a3b8]">Plans renew unless cancelled</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-[10px] rounded-[10px] border border-[#e9edf3] bg-[#fafbfd] p-[13px]">
                      <div className="flex h-[31px] w-[31px] shrink-0 items-center justify-center rounded-lg bg-[#eff6ff] text-[#2563eb]">
                        <List className="h-[17px] w-[17px]" strokeWidth={1.8} />
                      </div>

                      <div>
                        <strong className="block mb-0.5 text-[10.5px] text-[#334155] font-bold">Plan changes</strong>
                        <span className="block text-[9.5px] text-[#94a3b8]">Features may change over time</span>
                      </div>
                    </div>

                  </div>
                </div>
              </section>

              {/* 04 */}
              <section className="grid grid-cols-[42px_1fr] max-[640px]:grid-cols-1 gap-[17px] max-[640px]:gap-3 border-b border-[#edf0f4] py-[34px] max-[640px]:py-[27px]" id="acceptable-use">
                <div className="flex h-8 w-8 max-[640px]:h-[30px] max-[640px]:w-[30px] items-center justify-center rounded-[9px] bg-[#eff6ff] text-[9px] font-extrabold text-[#2563eb]">04</div>

                <div>
                  <h2 className="mt-[2px] mb-[11px] text-[18px] max-[640px]:text-[17px] font-[750] tracking-[-0.3px] text-[#172033]">Acceptable use</h2>

                  <p className="mb-[13px] last-of-type:mb-0 text-[12.5px] max-[640px]:text-[12px] leading-[1.85] max-[640px]:leading-[1.8] text-[#68778c]">
                    You agree to use CQA Booking responsibly and only for
                    lawful purposes.
                  </p>

                  <div className="mt-5 flex flex-col gap-2">

                    <div className="flex items-center gap-[10px] rounded-[9px] border border-[#edf0f4] bg-[#fafbfd] px-3 py-[10px] text-[10.5px] leading-[1.5] text-[#68778c]">
                      <span className="flex h-[25px] w-[25px] shrink-0 items-center justify-center rounded-[7px] bg-[#ecfdf5] text-[#16a34a]">
                        <Check className="h-[13px] w-[13px]" strokeWidth={2} />
                      </span>
                      <span>Use the platform for legitimate business activities.</span>
                    </div>

                    <div className="flex items-center gap-[10px] rounded-[9px] border border-[#edf0f4] bg-[#fafbfd] px-3 py-[10px] text-[10.5px] leading-[1.5] text-[#68778c]">
                      <span className="flex h-[25px] w-[25px] shrink-0 items-center justify-center rounded-[7px] bg-[#ecfdf5] text-[#16a34a]">
                        <Check className="h-[13px] w-[13px]" strokeWidth={2} />
                      </span>
                      <span>Protect your account and authorized access.</span>
                    </div>

                    <div className="flex items-center gap-[10px] rounded-[9px] border border-[#edf0f4] bg-[#fafbfd] px-3 py-[10px] text-[10.5px] leading-[1.5] text-[#68778c]">
                      <span className="flex h-[25px] w-[25px] shrink-0 items-center justify-center rounded-[7px] bg-[#fff1f2] text-[#e11d48]">
                        <X className="h-[13px] w-[13px]" strokeWidth={2} />
                      </span>
                      <span>Do not attempt to access other users&apos; accounts.</span>
                    </div>

                    <div className="flex items-center gap-[10px] rounded-[9px] border border-[#edf0f4] bg-[#fafbfd] px-3 py-[10px] text-[10.5px] leading-[1.5] text-[#68778c]">
                      <span className="flex h-[25px] w-[25px] shrink-0 items-center justify-center rounded-[7px] bg-[#fff1f2] text-[#e11d48]">
                        <X className="h-[13px] w-[13px]" strokeWidth={2} />
                      </span>
                      <span>Do not interfere with or disrupt the service.</span>
                    </div>

                    <div className="flex items-center gap-[10px] rounded-[9px] border border-[#edf0f4] bg-[#fafbfd] px-3 py-[10px] text-[10.5px] leading-[1.5] text-[#68778c]">
                      <span className="flex h-[25px] w-[25px] shrink-0 items-center justify-center rounded-[7px] bg-[#fff1f2] text-[#e11d48]">
                        <X className="h-[13px] w-[13px]" strokeWidth={2} />
                      </span>
                      <span>Do not use the platform for unlawful purposes.</span>
                    </div>

                  </div>
                </div>
              </section>

              {/* 05 */}
              <section className="grid grid-cols-[42px_1fr] max-[640px]:grid-cols-1 gap-[17px] max-[640px]:gap-3 border-b border-[#edf0f4] py-[34px] max-[640px]:py-[27px]" id="termination">
                <div className="flex h-8 w-8 max-[640px]:h-[30px] max-[640px]:w-[30px] items-center justify-center rounded-[9px] bg-[#eff6ff] text-[9px] font-extrabold text-[#2563eb]">05</div>

                <div>
                  <h2 className="mt-[2px] mb-[11px] text-[18px] max-[640px]:text-[17px] font-[750] tracking-[-0.3px] text-[#172033]">Termination</h2>

                  <p className="mb-[13px] last-of-type:mb-0 text-[12.5px] max-[640px]:text-[12px] leading-[1.85] max-[640px]:leading-[1.8] text-[#68778c]">
                    We may suspend or terminate access to CQA Booking when
                    necessary to protect the platform, its users, or our
                    services.
                  </p>

                  <p className="mb-[13px] last-of-type:mb-0 text-[12.5px] max-[640px]:text-[12px] leading-[1.85] max-[640px]:leading-[1.8] text-[#68778c]">
                    This may include violations of these terms, non-payment,
                    unauthorized activity, or conduct that may harm the
                    service or other users.
                  </p>

                  <div className="mt-[22px] flex items-start gap-3 rounded-[10px] border border-[#fde7c2] bg-[#fffbf4] p-[15px]">
                    <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-[#fff3d9] text-[#d97706]">
                      <AlertTriangle className="h-[17px] w-[17px]" strokeWidth={1.8} />
                    </div>

                    <div>
                      <strong className="block mb-[3px] text-[11px] text-[#92400e] font-bold">Account access may be restricted.</strong>

                      <span className="block text-[10.5px] leading-[1.5] text-[#8a6d4a]">
                        We may take action when continued access could
                        negatively affect the platform or other users.
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 06 */}
              <section className="grid grid-cols-[42px_1fr] max-[640px]:grid-cols-1 gap-[17px] max-[640px]:gap-3 border-b border-[#edf0f4] py-[34px] max-[640px]:py-[27px]" id="liability">
                <div className="flex h-8 w-8 max-[640px]:h-[30px] max-[640px]:w-[30px] items-center justify-center rounded-[9px] bg-[#eff6ff] text-[9px] font-extrabold text-[#2563eb]">06</div>

                <div>
                  <h2 className="mt-[2px] mb-[11px] text-[18px] max-[640px]:text-[17px] font-[750] tracking-[-0.3px] text-[#172033]">Limitation of liability</h2>

                  <p className="mb-[13px] last-of-type:mb-0 text-[12.5px] max-[640px]:text-[12px] leading-[1.85] max-[640px]:leading-[1.8] text-[#68778c]">
                    CQA Booking is provided on an &quot;as is&quot; and &quot;as available&quot;
                    basis, to the extent permitted by applicable law.
                  </p>

                  <p className="mb-[13px] last-of-type:mb-0 text-[12.5px] max-[640px]:text-[12px] leading-[1.85] max-[640px]:leading-[1.8] text-[#68778c]">
                    To the maximum extent permitted by law, CQA Booking is
                    not liable for indirect, incidental, special, or
                    consequential damages arising from the use of or
                    inability to use the service.
                  </p>

                  <div className="mt-[22px] border-l-[3px] border-[#94a3b8] bg-[#f8fafc] px-[15px] py-[14px]">
                    <span className="block mb-[5px] text-[9px] font-extrabold tracking-[1px] text-[#64748b]">IMPORTANT</span>

                    <p className="!m-0 text-[10.5px] leading-[1.6] text-[#7b8799]">
                      Nothing in these terms is intended to exclude or limit
                      liability where such exclusion or limitation is not
                      permitted by applicable law.
                    </p>
                  </div>
                </div>
              </section>

              {/* 07 */}
              <section className="grid grid-cols-[42px_1fr] max-[640px]:grid-cols-1 gap-[17px] max-[640px]:gap-3 py-[34px] max-[640px]:py-[27px]" id="contact">
                <div className="flex h-8 w-8 max-[640px]:h-[30px] max-[640px]:w-[30px] items-center justify-center rounded-[9px] bg-[#eff6ff] text-[9px] font-extrabold text-[#2563eb]">07</div>

                <div>
                  <h2 className="mt-[2px] mb-[11px] text-[18px] max-[640px]:text-[17px] font-[750] tracking-[-0.3px] text-[#172033]">Contact us</h2>

                  <p className="mb-[13px] last-of-type:mb-0 text-[12.5px] max-[640px]:text-[12px] leading-[1.85] max-[640px]:leading-[1.8] text-[#68778c]">
                    If you have questions about these Terms of Service or
                    need clarification about your account, subscriptions,
                    or use of the platform, please contact our support team.
                  </p>

                  <a
                    href="mailto:support@cqabooking.com"
                    className="mt-2 inline-flex items-center gap-2 rounded-lg border border-[#dbeafe] bg-[#f7fbff] px-[13px] py-[10px] text-[11.5px] font-bold text-[#2563eb] no-underline transition duration-200 hover:bg-[#eff6ff] hover:border-[#bfdbfe] hover:-translate-y-px"
                  >
                    support@cqabooking.com
                    <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
                  </a>
                </div>
              </section>

            </article>
          </div>

          {/* =====================================================
              CTA
          ===================================================== */}
          <section className="mt-[50px] flex items-center gap-[17px] max-[640px]:flex-wrap max-[640px]:items-start rounded-2xl border border-[#dce5f5] px-7 py-[26px] max-[640px]:p-[22px] bg-[linear-gradient(110deg,#f8fbff_0%,#eef5ff_100%)]">

            <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-[#2563eb] text-white shadow-[0_7px_18px_rgba(37,99,235,0.2)]">
              <MessageCircle className="h-[22px] w-[22px]" strokeWidth={1.8} />
            </div>

            <div className="flex-1 max-[640px]:min-w-[calc(100%-65px)]">
              <h3 className="mb-1 text-[15px] text-[#172033]">Have questions about these terms?</h3>

              <p className="text-[11px] leading-[1.6] text-[#718096]">
                Our support team can help clarify questions about your
                account, subscription, or use of CQA Booking.
              </p>
            </div>

            <Link
              href="/support"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[9px] bg-[#1e3a8a] px-4 py-[11px] text-[10.5px] font-bold text-white no-underline shadow-[0_6px_18px_rgba(30,58,138,0.16)] transition duration-200 hover:bg-[#1d4ed8] hover:-translate-y-px max-[640px]:mt-[3px] max-[640px]:w-full"
            >
              Visit Support Center
              <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
            </Link>

          </section>

        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="border-t border-[#e5e9f0] bg-white">
        <div className="mx-auto w-[min(1120px,calc(100%-40px))] max-[640px]:w-[min(100%-28px,1120px)] flex min-h-[70px] max-[640px]:min-h-[90px] items-center max-[640px]:items-start justify-between max-[640px]:justify-center gap-5 max-[640px]:flex-col max-[640px]:py-5 text-[10.5px] text-[#94a3b8]">

          <span>
            Â© {new Date().getFullYear()} CQA Booking
          </span>

          <div className="flex gap-5 max-[640px]:gap-[15px] max-[640px]:flex-wrap">
            <Link href="/" className="text-[#64748b] no-underline transition duration-200 hover:text-[#2563eb]">Home</Link>
            <Link href="/privacy" className="text-[#64748b] no-underline transition duration-200 hover:text-[#2563eb]">Privacy</Link>
            <Link href="/support" className="text-[#64748b] no-underline transition duration-200 hover:text-[#2563eb]">Support</Link>
            <Link href="/login" className="text-[#64748b] no-underline transition duration-200 hover:text-[#2563eb]">Login</Link>
            <Link href="/tenant/register" className="text-[#64748b] no-underline transition duration-200 hover:text-[#2563eb]">Register</Link>
          </div>

        </div>
      </footer>

    </main>
  );
}
