import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Globe,
  Mail,
  MessageCircle,
  Share2,
} from 'lucide-react';

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Who It’s For', href: '#industries' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About CQA', href: '#about' },
      { label: 'Support', href: '/support' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Login', href: '/login' },
      { label: 'Book a Demo', href: '/tenant/register' },
    ],
  },
];

const socials = [
  {
    icon: Globe,
    label: 'Website',
  },
  {
    icon: Mail,
    label: 'Email',
  },
  {
    icon: MessageCircle,
    label: 'Support',
  },
  {
    icon: Share2,
    label: 'Share',
  },
];

export default function LandingFooter() {
  return (
    <footer className="bg-[#080b14] text-white">

      {/* MAIN FOOTER */}
      <div className="mx-auto max-w-[1240px] px-5 pb-8 pt-16 sm:px-7 lg:px-8">

        <div
          className="
            grid grid-cols-1 gap-12
            border-b border-white/[0.10]
            pb-14
            sm:grid-cols-2
            lg:grid-cols-[1.5fr_1fr_1fr_1fr]
          "
        >

          {/* BRAND */}
          <div className="max-w-[310px]">
            <Link
              href="/"
              className="group inline-flex items-center gap-2.5"
            >
              <div
                className="
                  flex h-10 w-10 items-center justify-center
                  rounded-[12px]
                  bg-[linear-gradient(135deg,#667eea,#764ba2)]
                  shadow-[0_8px_24px_rgba(102,126,234,0.32)]
                  transition-transform
                  group-hover:scale-105
                "
              >
                <Sparkles className="h-[19px] w-[19px] text-white" />
              </div>

              <span className="text-[15px] font-extrabold tracking-[-0.2px] text-white">
                CQA
                <span className="text-[#9da8ff]">BOOKING</span>
              </span>
            </Link>

            <p className="mt-5 text-[13px] leading-[1.75] text-[#aeb6c7]">
              The multi-tenant booking and guest management platform
              for independent hospitality businesses.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#8b95f9]/20 bg-[#8b95f9]/[0.07] px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6ee7b7]" />
              <span className="text-[10px] font-bold tracking-[0.4px] text-[#b8c0ff]">
                Built for Hospitality
              </span>
            </div>
          </div>

          {/* FOOTER COLUMNS */}
          {columns.map((column) => (
            <div key={column.title}>
              <h4
                className="
                  mb-5
                  text-[12px]
                  font-extrabold
                  tracking-[1.2px]
                  text-white
                  uppercase
                "
              >
                {column.title}
              </h4>

              <ul className="space-y-3.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="
                        group inline-flex items-center
                        text-[13px]
                        font-medium
                        text-[#aeb6c7]
                        transition-all duration-200
                        hover:translate-x-0.5
                        hover:text-white
                      "
                    >
                      <span>{link.label}</span>

                      <ArrowRight
                        className="
                          ml-1.5 h-3 w-3
                          opacity-0
                          -translate-x-1
                          text-[#8b95f9]
                          transition-all
                          group-hover:translate-x-0
                          group-hover:opacity-100
                        "
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className="
            relative overflow-hidden
            border-b border-white/[0.10]
            py-16
            text-center
          "
        >
          {/* Glow */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[260px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#667eea]/[0.09] blur-[90px]" />

          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center rounded-full border border-[#8b95f9]/20 bg-[#8b95f9]/[0.07] px-3.5 py-1.5 text-[10px] font-extrabold tracking-[1.1px] text-[#aeb7ff] uppercase">
              Get Started Today
            </div>

            <h3
              className="
                mx-auto max-w-[600px]
                text-[26px]
                font-extrabold
                leading-[1.2]
                tracking-[-0.7px]
                text-white
                sm:text-[30px]
              "
            >
              Ready to transform your
              <br className="hidden sm:block" />
              hospitality business?
            </h3>

            <p className="mx-auto mt-4 max-w-[470px] text-[13px] leading-[1.7] text-[#9da6b8]">
              Start building better guest relationships and fill more
              tables with CQA Booking.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/tenant/register"
                className="
                  inline-flex min-h-[46px]
                  items-center justify-center gap-2
                  rounded-[11px]
                  bg-[linear-gradient(135deg,#667eea,#764ba2)]
                  px-6
                  text-[13px] font-bold
                  text-white
                  shadow-[0_10px_30px_rgba(102,126,234,0.34)]
                  transition-all duration-200
                  hover:-translate-y-0.5
                  hover:shadow-[0_14px_34px_rgba(102,126,234,0.45)]
                "
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/tenant/register"
                className="
                  inline-flex min-h-[46px]
                  items-center justify-center
                  rounded-[11px]
                  border border-white/[0.20]
                  bg-white/[0.035]
                  px-6
                  text-[13px] font-bold
                  text-white
                  transition-all duration-200
                  hover:border-white/[0.35]
                  hover:bg-white/[0.08]
                "
              >
                Book a Demo
              </Link>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div
          className="
            flex flex-col gap-6
            pt-8
            md:flex-row
            md:items-center
            md:justify-between
          "
        >

          {/* COPYRIGHT */}
          <div className="text-center md:text-left">
            <p className="text-[11px] font-medium text-[#7f899d]">
              © {new Date().getFullYear()} CQA Booking. All rights reserved.
            </p>
          </div>

          {/* SOCIALS */}
          <div className="flex items-center justify-center gap-2.5">
            {socials.map(({ icon: Icon, label }) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                className="
                  flex h-9 w-9
                  items-center justify-center
                  rounded-full
                  border border-white/[0.14]
                  bg-white/[0.035]
                  text-[#aeb6c7]
                  transition-all duration-200
                  hover:border-[#8b95f9]/40
                  hover:bg-[#8b95f9]/10
                  hover:text-[#b8c0ff]
                "
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>

          {/* LEGAL */}
          <div className="flex items-center justify-center gap-5">
            <Link
              href="/privacy"
              className="
                text-[11px]
                font-medium
                text-[#7f899d]
                transition-colors
                hover:text-white
              "
            >
              Privacy Policy
            </Link>

            <span className="h-3 w-px bg-white/[0.12]" />

            <Link
              href="/terms"
              className="
                text-[11px]
                font-medium
                text-[#7f899d]
                transition-colors
                hover:text-white
              "
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}