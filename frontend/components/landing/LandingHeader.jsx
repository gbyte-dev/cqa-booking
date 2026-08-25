'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Menu,
  X,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';

import ProfileMenu from '@/components/ProfileMenu';

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#industries', label: 'Who It’s For' },
  { href: '#about', label: 'About CQA' },
];

export default function LandingHeader({ user }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => {
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-[100] border-b border-white/[0.10] bg-[#080b14]/95 shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl">
      <div className="mx-auto flex min-h-[72px] max-w-[1240px] items-center justify-between gap-6 px-5 sm:px-7 lg:px-8">

        {/* LOGO */}
        <Link
          href="/"
          onClick={closeMobile}
          className="group flex shrink-0 items-center gap-2.5"
          aria-label="CQA Booking home"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[linear-gradient(135deg,#667eea,#764ba2)] shadow-[0_7px_22px_rgba(102,126,234,0.38)] transition-transform duration-200 group-hover:scale-105">
            <Sparkles className="h-[18px] w-[18px] text-white" />
          </div>

          <span className="text-[14px] font-extrabold tracking-[-0.2px] text-white sm:text-[15px]">
            CQA
            <span className="text-[#9da8ff]">BOOKING</span>
          </span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="
                group relative rounded-lg px-3.5 py-2.5
                text-[13px] font-semibold
                text-[#c2c8d6]
                transition-all duration-200
                hover:bg-white/[0.07]
                hover:text-white
              "
            >
              {link.label}

              <span
                className="
                  absolute inset-x-3 bottom-1 h-px
                  origin-center scale-x-0
                  bg-[#8b95f9]
                  transition-transform duration-200
                  group-hover:scale-x-100
                "
              />
            </a>
          ))}
        </nav>

        {/* DESKTOP ACTIONS */}
        <div className="hidden items-center gap-3 sm:flex">
          {user ? (
            <ProfileMenu
              user={user}
              size={36}
              dark
            />
          ) : (
            <>
              <Link
                href="/login"
                className="
                  inline-flex min-h-[40px] items-center justify-center
                  rounded-[9px]
                  border border-white/[0.18]
                  bg-white/[0.025]
                  px-4
                  text-[13px] font-semibold
                  text-[#e5e7eb]
                  transition-all duration-200
                  hover:border-white/[0.35]
                  hover:bg-white/[0.08]
                  hover:text-white
                "
              >
                Login
              </Link>

              <Link
                href="/tenant/register"
                className="
                  inline-flex min-h-[40px] items-center justify-center gap-1.5
                  rounded-[9px]
                  bg-[linear-gradient(135deg,#667eea,#764ba2)]
                  px-4.5
                  text-[13px] font-bold
                  text-white
                  shadow-[0_8px_24px_rgba(102,126,234,0.32)]
                  transition-all duration-200
                  hover:-translate-y-[1px]
                  hover:shadow-[0_12px_30px_rgba(102,126,234,0.42)]
                "
              >
                Book a Demo
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          className="
            flex h-10 w-10 items-center justify-center
            rounded-lg
            border border-white/[0.18]
            bg-white/[0.04]
            text-white
            transition-colors
            hover:bg-white/[0.09]
            sm:hidden
          "
          onClick={() => setMobileOpen((value) => !value)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <X size={19} />
          ) : (
            <Menu size={19} />
          )}
        </button>
      </div>

      {/* MOBILE NAVIGATION */}
      {mobileOpen && (
        <div
          className="
            border-t border-white/[0.10]
            bg-[#080b14]
            px-5 pb-5 pt-4
            shadow-[0_18px_40px_rgba(0,0,0,0.30)]
            sm:hidden
          "
        >
          <nav
            className="flex flex-col gap-1"
            aria-label="Mobile navigation"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMobile}
                className="
                  flex min-h-[46px] items-center justify-between
                  rounded-lg
                  border border-transparent
                  px-4
                  text-[14px] font-semibold
                  text-[#d4d8e2]
                  transition-all
                  hover:border-white/[0.08]
                  hover:bg-white/[0.06]
                  hover:text-white
                "
              >
                <span>{link.label}</span>
                <ChevronDown className="h-4 w-4 -rotate-90 text-[#8b95f9]" />
              </a>
            ))}
          </nav>

          <div className="my-4 h-px bg-white/[0.09]" />

          {user ? (
            <Link
              href="/account/profile"
              onClick={closeMobile}
              className="
                flex min-h-[46px] items-center justify-center
                rounded-[10px]
                border border-white/[0.16]
                bg-white/[0.04]
                px-4
                text-[13px] font-bold
                text-white
                transition-all
                hover:bg-white/[0.08]
              "
            >
              My Profile
            </Link>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/login"
                onClick={closeMobile}
                className="
                  flex min-h-[46px] items-center justify-center
                  rounded-[10px]
                  border border-white/[0.18]
                  bg-white/[0.03]
                  px-4
                  text-[13px] font-semibold
                  text-white
                  transition-all
                  hover:bg-white/[0.08]
                "
              >
                Login
              </Link>

              <Link
                href="/tenant/register"
                onClick={closeMobile}
                className="
                  flex min-h-[46px] items-center justify-center gap-1.5
                  rounded-[10px]
                  bg-[linear-gradient(135deg,#667eea,#764ba2)]
                  px-4
                  text-[13px] font-bold
                  text-white
                  shadow-[0_8px_22px_rgba(102,126,234,0.28)]
                "
              >
                Book a Demo
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}