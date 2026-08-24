'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { storage } from '@/lib/storage';

export default function RegisterPage() {
  const router = useRouter();

  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError('');

    try {
      const organizationSlug = organizationName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');

      const result = await authAPI.register({
        organizationName: organizationName.trim(),
        organizationSlug,
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
      });

      if (result.success) {
        storage.setToken(result.data.token);
        storage.setUser(result.data.user);
        storage.setOrganization(result.data.organization);

        router.push('/tenant/dashboard');
      } else {
        setError('We could not complete your registration. Please review your details and try again.');
      }
    } catch (err) {
      setError("We couldn't create your account. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-[radial-gradient(circle_at_50%_0%,rgba(31,41,55,0.045),transparent_40%),#f6f7f9] p-[28px_20px] max-[600px]:p-[20px_14px] max-[360px]:p-[15px_10px] font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif] text-[#1f2933]">

      <div className="flex w-full max-w-[500px] flex-col items-center">

        {/* Brand */}
        <div className="mb-5 max-[600px]:mb-[17px] flex items-center gap-[10px] text-lg font-bold tracking-[-0.3px] text-[#1d2731]">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1d2731] text-lg font-extrabold text-white">C</div>
          <span>CQA Booking</span>
        </div>

        {/* Card */}
        <div className="w-full rounded-xl border border-[#e4e7ea] bg-white p-[32px_36px_28px] max-[600px]:rounded-[10px] max-[600px]:p-[27px_21px_24px] max-[360px]:p-[24px_17px_21px] shadow-[0_8px_30px_rgba(16,24,40,0.055)]">

          {/* Header */}
          <div className="mb-[25px]">
            <span className="mb-[9px] inline-block text-[10px] font-bold tracking-[1.4px] text-[#89939c]">
              GET STARTED
            </span>

            <h1 className="m-0 text-[26px] max-[600px]:text-2xl max-[360px]:text-[22px] font-bold leading-[1.2] tracking-[-0.7px] text-[#18212a]">Create your account</h1>

            <p className="mt-2 mb-0 text-[13px] max-[600px]:text-xs leading-relaxed text-[#7b858e]">
              Set up your organization and start managing
              your venue with CQA Booking.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-center gap-[9px] rounded-[7px] border border-[#f1d0d0] bg-[#fff7f7] px-3 py-[11px] text-xs leading-[1.4] text-[#a33b3b]">
              <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#a33b3b] text-[11px] font-bold text-white">!</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister}>

            {/* Organization */}
            <div className="mb-4 flex items-center gap-[11px]">
              <div className="flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-[7px] bg-[#f0f2f4] text-[10px] font-bold text-[#69747e]">01</div>

              <div>
                <h3 className="m-0 text-xs max-[360px]:text-[11px] font-bold text-[#35404a]">Organization details</h3>
                <p className="mt-[2px] mb-0 text-[10px] text-[#9aa2a9]">Tell us about your business</p>
              </div>
            </div>

            <div className="mb-4">

              <label htmlFor="organizationName" className="mb-[7px] block text-xs font-semibold text-[#39444e]">
                Organization name
              </label>

              <div className="relative w-full">

                <span className="pointer-events-none absolute left-[13px] top-1/2 flex -translate-y-1/2 items-center text-[#8a949d]">
                  <Building2 size={18} />
                </span>

                <input
                  id="organizationName"
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="e.g. Pizza Palace"
                  autoComplete="organization"
                  required
                  className="h-11 max-[360px]:h-[43px] w-full rounded-[7px] border border-[#d9dde1] bg-white px-10 text-[13px] text-[#202a33] outline-none transition-[border-color,box-shadow] duration-150 ease placeholder:text-[#a1a8af] focus:border-[#65717c] focus:shadow-[0_0_0_3px_rgba(29,39,49,0.06)]"
                />

              </div>
            </div>

            {/* Owner */}
            <div className="mb-4 mt-[25px] max-[600px]:mt-[23px] flex items-center gap-[11px]">
              <div className="flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-[7px] bg-[#f0f2f4] text-[10px] font-bold text-[#69747e]">02</div>

              <div>
                <h3 className="m-0 text-xs max-[360px]:text-[11px] font-bold text-[#35404a]">Account details</h3>
                <p className="mt-[2px] mb-0 text-[10px] text-[#9aa2a9]">Create your administrator account</p>
              </div>
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 max-[600px]:grid-cols-1 gap-3 max-[600px]:gap-0">

              <div className="mb-4">

                <label htmlFor="firstName" className="mb-[7px] block text-xs font-semibold text-[#39444e]">
                  First name
                </label>

                <div className="relative w-full">

                  <span className="pointer-events-none absolute left-[13px] top-1/2 flex -translate-y-1/2 items-center text-[#8a949d]">
                    <User size={18} />
                  </span>

                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    autoComplete="given-name"
                    required
                    className="h-11 max-[360px]:h-[43px] w-full rounded-[7px] border border-[#d9dde1] bg-white px-10 text-[13px] text-[#202a33] outline-none transition-[border-color,box-shadow] duration-150 ease placeholder:text-[#a1a8af] focus:border-[#65717c] focus:shadow-[0_0_0_3px_rgba(29,39,49,0.06)]"
                  />

                </div>
              </div>

              <div className="mb-4">

                <label htmlFor="lastName" className="mb-[7px] block text-xs font-semibold text-[#39444e]">
                  Last name
                </label>

                <div className="relative w-full">

                  <span className="pointer-events-none absolute left-[13px] top-1/2 flex -translate-y-1/2 items-center text-[#8a949d]">
                    <User size={18} />
                  </span>

                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    autoComplete="family-name"
                    className="h-11 max-[360px]:h-[43px] w-full rounded-[7px] border border-[#d9dde1] bg-white px-10 text-[13px] text-[#202a33] outline-none transition-[border-color,box-shadow] duration-150 ease placeholder:text-[#a1a8af] focus:border-[#65717c] focus:shadow-[0_0_0_3px_rgba(29,39,49,0.06)]"
                  />

                </div>
              </div>

            </div>

            {/* Email */}
            <div className="mb-4">

              <label htmlFor="email" className="mb-[7px] block text-xs font-semibold text-[#39444e]">
                Email address
              </label>

              <div className="relative w-full">

                <span className="pointer-events-none absolute left-[13px] top-1/2 flex -translate-y-1/2 items-center text-[#8a949d]">
                  <Mail size={18} />
                </span>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                  className="h-11 max-[360px]:h-[43px] w-full rounded-[7px] border border-[#d9dde1] bg-white px-10 text-[13px] text-[#202a33] outline-none transition-[border-color,box-shadow] duration-150 ease placeholder:text-[#a1a8af] focus:border-[#65717c] focus:shadow-[0_0_0_3px_rgba(29,39,49,0.06)]"
                />

              </div>
            </div>

            {/* Password */}
            <div className="mb-[17px]">

              <label htmlFor="password" className="mb-[7px] block text-xs font-semibold text-[#39444e]">
                Password
              </label>

              <div className="relative w-full">

                <span className="pointer-events-none absolute left-[13px] top-1/2 flex -translate-y-1/2 items-center text-[#8a949d]">
                  <Lock size={18} />
                </span>

                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a secure password"
                  autoComplete="new-password"
                  required
                  className="h-11 max-[360px]:h-[43px] w-full rounded-[7px] border border-[#d9dde1] bg-white px-10 text-[13px] text-[#202a33] outline-none transition-[border-color,box-shadow] duration-150 ease placeholder:text-[#a1a8af] focus:border-[#65717c] focus:shadow-[0_0_0_3px_rgba(29,39,49,0.06)]"
                />

                <button
                  type="button"
                  className="absolute right-[10px] top-1/2 flex -translate-y-1/2 items-center border-0 bg-transparent p-[5px] text-[#87919a] cursor-pointer hover:text-[#1d2731]"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>

              </div>

              <span className="mt-[6px] block text-[10px] text-[#9ba3aa]">
                Use at least 8 characters.
              </span>

            </div>

            {/* Terms */}
            <label className="relative mb-5 flex cursor-pointer items-start gap-2 text-[10.5px] leading-[1.5] text-[#737e87]">

              <input type="checkbox" required className="peer pointer-events-none absolute opacity-0" />

              <span className="relative mt-px h-4 w-4 flex-none rounded-[4px] border border-[#c9ced3] bg-white after:absolute after:left-[2px] after:top-[-1px] after:text-xs after:font-bold after:text-white after:opacity-0 after:content-[''] peer-checked:border-[#1d2731] peer-checked:bg-[#1d2731] peer-checked:after:opacity-100"></span>

              <span>
                I agree to the{' '}
                <Link href="/terms" className="font-semibold text-[#3d4852] no-underline hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="font-semibold text-[#3d4852] no-underline hover:underline">
                  Privacy Policy
                </Link>
              </span>

            </label>

            {/* Submit */}
            <button
              type="submit"
              className="flex h-[46px] max-[360px]:h-11 w-full items-center justify-center gap-2 rounded-[7px] border-0 bg-[#1d2731] text-[13px] font-semibold text-white cursor-pointer transition-[background-color,transform] duration-150 ease hover:bg-[#2b3945] hover:-translate-y-px active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-65"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="h-[15px] w-[15px] animate-[spin_0.7s_linear_infinite] rounded-full border-2 border-white/30 border-t-white"></span>
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight size={17} />
                </>
              )}
            </button>

          </form>

          {/* Login */}
          <div className="mt-5 flex justify-center gap-[5px] text-xs text-[#8a949c]">
            <span>Already have an account?</span>

            <Link href="/login" className="font-semibold text-[#1d2731] no-underline hover:underline">
              Sign in
            </Link>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-[14px] flex w-full justify-between px-[3px] text-[10px] max-[600px]:text-[9px] text-[#a1a8ae]">
          <span>Â© 2026 CQA Booking</span>
          <span>Secure registration</span>
        </div>

      </div>

    </main>
  );
}
