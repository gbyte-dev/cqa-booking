'use client';

import Link from 'next/link';
import { ArrowRight, Shield, ShieldCheck, Lock, MessageCircle } from 'lucide-react';

export default function PrivacyPage() {
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
              <Shield className="h-[13px] w-[13px]" strokeWidth={1.8} />
            </span>
            PRIVACY POLICY
          </div>

          <h1 className="mt-[21px] max-w-[760px] text-[clamp(40px,6vw,58px)] max-[640px]:text-[40px] max-[400px]:text-[35px] font-extrabold leading-[1.05] tracking-[-2.6px] max-[640px]:tracking-[-2px] text-[#111827]">
            Your privacy
            <span className="text-[#2563eb]"> matters to us.</span>
          </h1>

          <p className="mt-[18px] max-w-[590px] text-[14px] max-[640px]:text-[13px] leading-[1.75] text-[#64748b]">
            We believe your information should be handled responsibly,
            transparently, and securely.
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

            {/* SIDEBAR */}
            <aside className="sticky top-[25px] max-[900px]:static rounded-[14px] border border-[#e5e9f0] bg-white p-[19px] max-[900px]:flex max-[900px]:flex-wrap max-[900px]:items-center max-[900px]:gap-1 max-[900px]:p-3 shadow-[0_8px_30px_rgba(15,23,42,0.025)] max-[640px]:hidden">
              <div className="mb-3 max-[900px]:w-full max-[900px]:mx-[7px] max-[900px]:mt-[3px] max-[900px]:mb-[5px] text-[10px] font-extrabold uppercase tracking-[1px] text-[#172033]">
                On this page
              </div>

              <a href="#information" className="group flex items-center gap-[9px] rounded-[7px] px-[7px] py-[9px] text-[10.5px] leading-[1.4] text-[#718096] no-underline transition duration-200 hover:bg-[#f5f8ff] hover:text-[#2563eb] max-[900px]:flex-1 max-[900px]:min-w-[120px]">
                <span className="text-[9px] font-extrabold text-[#b0bac8] group-hover:text-[#2563eb]">01</span>
                Information we collect
              </a>

              <a href="#usage" className="group flex items-center gap-[9px] rounded-[7px] px-[7px] py-[9px] text-[10.5px] leading-[1.4] text-[#718096] no-underline transition duration-200 hover:bg-[#f5f8ff] hover:text-[#2563eb] max-[900px]:flex-1 max-[900px]:min-w-[120px]">
                <span className="text-[9px] font-extrabold text-[#b0bac8] group-hover:text-[#2563eb]">02</span>
                How we use information
              </a>

              <a href="#sharing" className="group flex items-center gap-[9px] rounded-[7px] px-[7px] py-[9px] text-[10.5px] leading-[1.4] text-[#718096] no-underline transition duration-200 hover:bg-[#f5f8ff] hover:text-[#2563eb] max-[900px]:flex-1 max-[900px]:min-w-[120px]">
                <span className="text-[9px] font-extrabold text-[#b0bac8] group-hover:text-[#2563eb]">03</span>
                Data sharing
              </a>

              <a href="#security" className="group flex items-center gap-[9px] rounded-[7px] px-[7px] py-[9px] text-[10.5px] leading-[1.4] text-[#718096] no-underline transition duration-200 hover:bg-[#f5f8ff] hover:text-[#2563eb] max-[900px]:flex-1 max-[900px]:min-w-[120px]">
                <span className="text-[9px] font-extrabold text-[#b0bac8] group-hover:text-[#2563eb]">04</span>
                Data security
              </a>

              <a href="#rights" className="group flex items-center gap-[9px] rounded-[7px] px-[7px] py-[9px] text-[10.5px] leading-[1.4] text-[#718096] no-underline transition duration-200 hover:bg-[#f5f8ff] hover:text-[#2563eb] max-[900px]:flex-1 max-[900px]:min-w-[120px]">
                <span className="text-[9px] font-extrabold text-[#b0bac8] group-hover:text-[#2563eb]">05</span>
                Your rights
              </a>

              <a href="#contact" className="group flex items-center gap-[9px] rounded-[7px] px-[7px] py-[9px] text-[10.5px] leading-[1.4] text-[#718096] no-underline transition duration-200 hover:bg-[#f5f8ff] hover:text-[#2563eb] max-[900px]:flex-1 max-[900px]:min-w-[120px]">
                <span className="text-[9px] font-extrabold text-[#b0bac8] group-hover:text-[#2563eb]">06</span>
                Contact
              </a>
            </aside>

            {/* POLICY */}
            <article className="max-w-[760px] max-[900px]:max-w-none rounded-[17px] border border-[#e5e9f0] bg-white px-[38px] py-[10px] max-[640px]:rounded-[14px] max-[640px]:px-5 max-[640px]:py-1 max-[400px]:px-[17px] shadow-[0_10px_35px_rgba(15,23,42,0.035)]">

              {/* 01 */}
              <section className="grid grid-cols-[42px_1fr] max-[640px]:grid-cols-1 gap-[17px] max-[640px]:gap-3 border-b border-[#edf0f4] py-[34px] max-[640px]:py-[27px]" id="information">
                <div className="flex h-8 w-8 max-[640px]:h-[30px] max-[640px]:w-[30px] items-center justify-center rounded-[9px] bg-[#eff6ff] text-[9px] font-extrabold text-[#2563eb]">01</div>

                <div>
                  <h2 className="mt-[2px] mb-[11px] text-[18px] max-[640px]:text-[17px] font-[750] tracking-[-0.3px] text-[#172033]">Information we collect</h2>

                  <p className="mb-[13px] last-of-type:mb-0 text-[12.5px] max-[640px]:text-[12px] leading-[1.85] max-[640px]:leading-[1.8] text-[#68778c]">
                    When you use CQA Booking, we collect information you
                    provide directly, such as your name, email address,
                    phone number, organization details, and booking
                    information.
                  </p>

                  <p className="mb-[13px] last-of-type:mb-0 text-[12.5px] max-[640px]:text-[12px] leading-[1.85] max-[640px]:leading-[1.8] text-[#68778c]">
                    We may also collect usage and technical information
                    about how you interact with our platform to help us
                    maintain, secure, and improve our services.
                  </p>
                </div>
              </section>

              {/* 02 */}
              <section className="grid grid-cols-[42px_1fr] max-[640px]:grid-cols-1 gap-[17px] max-[640px]:gap-3 border-b border-[#edf0f4] py-[34px] max-[640px]:py-[27px]" id="usage">
                <div className="flex h-8 w-8 max-[640px]:h-[30px] max-[640px]:w-[30px] items-center justify-center rounded-[9px] bg-[#eff6ff] text-[9px] font-extrabold text-[#2563eb]">02</div>

                <div>
                  <h2 className="mt-[2px] mb-[11px] text-[18px] max-[640px]:text-[17px] font-[750] tracking-[-0.3px] text-[#172033]">How we use your information</h2>

                  <p className="mb-[13px] last-of-type:mb-0 text-[12.5px] max-[640px]:text-[12px] leading-[1.85] max-[640px]:leading-[1.8] text-[#68778c]">
                    We use your information to provide and maintain the
                    booking platform, process reservations, manage your
                    account, and deliver the services you request.
                  </p>

                  <p className="mb-[13px] last-of-type:mb-0 text-[12.5px] max-[640px]:text-[12px] leading-[1.85] max-[640px]:leading-[1.8] text-[#68778c]">
                    Your information may also be used to send important
                    service notifications, improve our product, prevent
                    misuse, and maintain the reliability of the platform.
                  </p>

                  <div className="mt-[22px] flex items-start gap-3 rounded-[10px] border border-[#dbeafe] bg-[#f7fbff] p-[15px]">
                    <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-[#eaf3ff] text-[#2563eb]">
                      <ShieldCheck className="h-[17px] w-[17px]" strokeWidth={1.8} />
                    </div>

                    <div>
                      <strong className="block mb-[3px] text-[11px] text-[#1e3a8a] font-bold">We don&apos;t sell your personal data.</strong>
                      <span className="block text-[10.5px] leading-[1.5] text-[#718096]">
                        Your information is used to operate and improve
                        CQA Booking.
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 03 */}
              <section className="grid grid-cols-[42px_1fr] max-[640px]:grid-cols-1 gap-[17px] max-[640px]:gap-3 border-b border-[#edf0f4] py-[34px] max-[640px]:py-[27px]" id="sharing">
                <div className="flex h-8 w-8 max-[640px]:h-[30px] max-[640px]:w-[30px] items-center justify-center rounded-[9px] bg-[#eff6ff] text-[9px] font-extrabold text-[#2563eb]">03</div>

                <div>
                  <h2 className="mt-[2px] mb-[11px] text-[18px] max-[640px]:text-[17px] font-[750] tracking-[-0.3px] text-[#172033]">Data sharing</h2>

                  <p className="mb-[13px] last-of-type:mb-0 text-[12.5px] max-[640px]:text-[12px] leading-[1.85] max-[640px]:leading-[1.8] text-[#68778c]">
                    Your data is shared only with parties necessary to
                    operate the platform, such as hosting and infrastructure
                    providers, and only to the extent required to provide
                    the service.
                  </p>

                  <p className="mb-[13px] last-of-type:mb-0 text-[12.5px] max-[640px]:text-[12px] leading-[1.85] max-[640px]:leading-[1.8] text-[#68778c]">
                    Organizations using CQA Booking may access booking
                    information belonging to their own venues and
                    authorized users.
                  </p>
                </div>
              </section>

              {/* 04 */}
              <section className="grid grid-cols-[42px_1fr] max-[640px]:grid-cols-1 gap-[17px] max-[640px]:gap-3 border-b border-[#edf0f4] py-[34px] max-[640px]:py-[27px]" id="security">
                <div className="flex h-8 w-8 max-[640px]:h-[30px] max-[640px]:w-[30px] items-center justify-center rounded-[9px] bg-[#eff6ff] text-[9px] font-extrabold text-[#2563eb]">04</div>

                <div>
                  <h2 className="mt-[2px] mb-[11px] text-[18px] max-[640px]:text-[17px] font-[750] tracking-[-0.3px] text-[#172033]">Data security</h2>

                  <p className="mb-[13px] last-of-type:mb-0 text-[12.5px] max-[640px]:text-[12px] leading-[1.85] max-[640px]:leading-[1.8] text-[#68778c]">
                    We use industry-standard security practices designed
                    to protect your information against unauthorized
                    access, alteration, disclosure, or destruction.
                  </p>

                  <p className="mb-[13px] last-of-type:mb-0 text-[12.5px] max-[640px]:text-[12px] leading-[1.85] max-[640px]:leading-[1.8] text-[#68778c]">
                    Administrative functions are protected through
                    authentication and role-based permissions, helping
                    ensure that users can access only the information
                    appropriate to their role.
                  </p>

                  <div className="mt-[22px] grid grid-cols-2 max-[640px]:grid-cols-1 gap-[10px]">

                    <div className="flex items-center gap-[10px] rounded-[10px] border border-[#e9edf3] bg-[#fafbfd] p-[13px]">
                      <div className="flex h-[31px] w-[31px] shrink-0 items-center justify-center rounded-lg bg-[#eff6ff] text-[#2563eb]">
                        <Lock className="h-[17px] w-[17px]" strokeWidth={1.8} />
                      </div>

                      <div>
                        <strong className="block mb-0.5 text-[10.5px] text-[#334155] font-bold">Protected access</strong>
                        <span className="block text-[9.5px] text-[#94a3b8]">Role-based permissions</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-[10px] rounded-[10px] border border-[#e9edf3] bg-[#fafbfd] p-[13px]">
                      <div className="flex h-[31px] w-[31px] shrink-0 items-center justify-center rounded-lg bg-[#eff6ff] text-[#2563eb]">
                        <Shield className="h-[17px] w-[17px]" strokeWidth={1.8} />
                      </div>

                      <div>
                        <strong className="block mb-0.5 text-[10.5px] text-[#334155] font-bold">Secure systems</strong>
                        <span className="block text-[9.5px] text-[#94a3b8]">Industry-standard practices</span>
                      </div>
                    </div>

                  </div>
                </div>
              </section>

              {/* 05 */}
              <section className="grid grid-cols-[42px_1fr] max-[640px]:grid-cols-1 gap-[17px] max-[640px]:gap-3 border-b border-[#edf0f4] py-[34px] max-[640px]:py-[27px]" id="rights">
                <div className="flex h-8 w-8 max-[640px]:h-[30px] max-[640px]:w-[30px] items-center justify-center rounded-[9px] bg-[#eff6ff] text-[9px] font-extrabold text-[#2563eb]">05</div>

                <div>
                  <h2 className="mt-[2px] mb-[11px] text-[18px] max-[640px]:text-[17px] font-[750] tracking-[-0.3px] text-[#172033]">Your rights</h2>

                  <p className="mb-[13px] last-of-type:mb-0 text-[12.5px] max-[640px]:text-[12px] leading-[1.85] max-[640px]:leading-[1.8] text-[#68778c]">
                    You may request access to, correction of, or deletion
                    of your personal information by contacting our support
                    team.
                  </p>

                  <p className="mb-[13px] last-of-type:mb-0 text-[12.5px] max-[640px]:text-[12px] leading-[1.85] max-[640px]:leading-[1.8] text-[#68778c]">
                    Depending on your account and applicable requirements,
                    you may also request to export your information or
                    close your account.
                  </p>
                </div>
              </section>

              {/* 06 */}
              <section className="grid grid-cols-[42px_1fr] max-[640px]:grid-cols-1 gap-[17px] max-[640px]:gap-3 py-[34px] max-[640px]:py-[27px]" id="contact">
                <div className="flex h-8 w-8 max-[640px]:h-[30px] max-[640px]:w-[30px] items-center justify-center rounded-[9px] bg-[#eff6ff] text-[9px] font-extrabold text-[#2563eb]">06</div>

                <div>
                  <h2 className="mt-[2px] mb-[11px] text-[18px] max-[640px]:text-[17px] font-[750] tracking-[-0.3px] text-[#172033]">Contact us</h2>

                  <p className="mb-[13px] last-of-type:mb-0 text-[12.5px] max-[640px]:text-[12px] leading-[1.85] max-[640px]:leading-[1.8] text-[#68778c]">
                    If you have questions, concerns, or requests regarding
                    this Privacy Policy or the way we handle your
                    information, please contact our support team.
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
              BOTTOM CTA
          ===================================================== */}
          <section className="mt-[50px] flex items-center gap-[17px] max-[640px]:flex-wrap max-[640px]:items-start rounded-2xl border border-[#dce5f5] px-7 py-[26px] max-[640px]:p-[22px] bg-[linear-gradient(110deg,#f8fbff_0%,#eef5ff_100%)]">

            <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-[#2563eb] text-white shadow-[0_7px_18px_rgba(37,99,235,0.2)]">
              <MessageCircle className="h-[22px] w-[22px]" strokeWidth={1.8} />
            </div>

            <div className="flex-1 max-[640px]:min-w-[calc(100%-65px)]">
              <h3 className="mb-1 text-[15px] text-[#172033]">Have questions about your privacy?</h3>

              <p className="text-[11px] leading-[1.6] text-[#718096]">
                Our support team is available to help with privacy-related
                questions and requests.
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
            <Link href="/support" className="text-[#64748b] no-underline transition duration-200 hover:text-[#2563eb]">Support</Link>
            <Link href="/login" className="text-[#64748b] no-underline transition duration-200 hover:text-[#2563eb]">Login</Link>
            <Link href="/tenant/register" className="text-[#64748b] no-underline transition duration-200 hover:text-[#2563eb]">Register</Link>
          </div>

        </div>
      </footer>

    </main>
  );
}
