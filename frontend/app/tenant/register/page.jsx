'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
        setError(result.error || 'Registration failed.');
      }
    } catch (err) {
      setError(
        err?.message
          ? `Connection error: ${err.message}`
          : 'Unable to connect to the server.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">

      <div className="register-wrapper">

        {/* Brand */}
        <div className="register-brand">
          <div className="brand-logo">C</div>
          <span>CQA Booking</span>
        </div>

        {/* Card */}
        <div className="register-card">

          {/* Header */}
          <div className="register-header">
            <span className="register-label">
              GET STARTED
            </span>

            <h1>Create your account</h1>

            <p>
              Set up your organization and start managing
              your venue with CQA Booking.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="register-error">
              <span className="error-symbol">!</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister}>

            {/* Organization */}
            <div className="section-heading">
              <div className="section-number">01</div>

              <div>
                <h3>Organization details</h3>
                <p>Tell us about your business</p>
              </div>
            </div>

            <div className="field">

              <label htmlFor="organizationName">
                Organization name
              </label>

              <div className="input-box">

                <span className="input-icon">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M3 21h18" />
                    <path d="M5 21V6l7-3 7 3v15" />
                    <path d="M9 21v-5h6v5" />
                    <path d="M8 9h1" />
                    <path d="M15 9h1" />
                    <path d="M8 12h1" />
                    <path d="M15 12h1" />
                  </svg>
                </span>

                <input
                  id="organizationName"
                  type="text"
                  value={organizationName}
                  onChange={(e) =>
                    setOrganizationName(e.target.value)
                  }
                  placeholder="e.g. Pizza Palace"
                  autoComplete="organization"
                  required
                />

              </div>
            </div>

            {/* Owner */}
            <div className="section-heading owner-heading">
              <div className="section-number">02</div>

              <div>
                <h3>Account details</h3>
                <p>Create your administrator account</p>
              </div>
            </div>

            {/* Name */}
            <div className="name-grid">

              <div className="field">

                <label htmlFor="firstName">
                  First name
                </label>

                <div className="input-box">

                  <span className="input-icon">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <circle cx="12" cy="8" r="3.5" />
                      <path d="M5 20c.8-3.4 3.1-5 7-5s6.2 1.6 7 5" />
                    </svg>
                  </span>

                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) =>
                      setFirstName(e.target.value)
                    }
                    placeholder="John"
                    autoComplete="given-name"
                    required
                  />

                </div>
              </div>

              <div className="field">

                <label htmlFor="lastName">
                  Last name
                </label>

                <div className="input-box">

                  <span className="input-icon">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <circle cx="12" cy="8" r="3.5" />
                      <path d="M5 20c.8-3.4 3.1-5 7-5s6.2 1.6 7 5" />
                    </svg>
                  </span>

                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) =>
                      setLastName(e.target.value)
                    }
                    placeholder="Doe"
                    autoComplete="family-name"
                  />

                </div>
              </div>

            </div>

            {/* Email */}
            <div className="field">

              <label htmlFor="email">
                Email address
              </label>

              <div className="input-box">

                <span className="input-icon">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2"
                    />
                    <path d="m3 7 9 6 9-6" />
                  </svg>
                </span>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />

              </div>
            </div>

            {/* Password */}
            <div className="field password-field">

              <label htmlFor="password">
                Password
              </label>

              <div className="input-box">

                <span className="input-icon">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <rect
                      x="5"
                      y="10"
                      width="14"
                      height="10"
                      rx="2"
                    />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                </span>

                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Create a secure password"
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="show-password"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showPassword ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                      <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5.2 0 9 4.3 10 8a11.7 11.7 0 0 1-3.1 5.1" />
                      <path d="M6.6 6.6A11.8 11.8 0 0 0 2 12c1 3.7 4.8 8 10 8a10.7 10.7 0 0 0 3.4-.6" />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
                      <circle cx="12" cy="12" r="2.8" />
                    </svg>
                  )}
                </button>

              </div>

              <span className="password-hint">
                Use at least 8 characters.
              </span>

            </div>

            {/* Terms */}
            <label className="terms">

              <input type="checkbox" required />

              <span className="terms-check"></span>

              <span>
                I agree to the{' '}
                <Link href="/terms">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy">
                  Privacy Policy
                </Link>
              </span>

            </label>

            {/* Submit */}
            <button
              type="submit"
              className="register-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loader"></span>
                  Creating account...
                </>
              ) : (
                <>
                  Create account

                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                  </svg>
                </>
              )}
            </button>

          </form>

          {/* Login */}
          <div className="login-link">
            <span>Already have an account?</span>

            <Link href="/tenant/login">
              Sign in
            </Link>
          </div>

        </div>

        {/* Footer */}
        <div className="register-footer">
          <span>© 2026 CQA Booking</span>
          <span>Secure registration</span>
        </div>

      </div>

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .register-page {
          min-height: 100vh;
          min-height: 100dvh;
          width: 100%;
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(31, 41, 55, 0.045),
              transparent 40%
            ),
            #f6f7f9;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 28px 20px;
          color: #1f2933;
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .register-wrapper {
          width: 100%;
          max-width: 500px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* BRAND */

        .register-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          color: #1d2731;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.3px;
        }

        .brand-logo {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: #1d2731;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 800;
        }

        /* CARD */

        .register-card {
          width: 100%;
          background: #fff;
          border: 1px solid #e4e7ea;
          border-radius: 12px;
          padding: 32px 36px 28px;
          box-shadow:
            0 8px 30px rgba(16, 24, 40, 0.055);
        }

        /* HEADER */

        .register-header {
          margin-bottom: 25px;
        }

        .register-label {
          display: inline-block;
          margin-bottom: 9px;
          color: #89939c;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.4px;
        }

        .register-header h1 {
          margin: 0;
          color: #18212a;
          font-size: 26px;
          line-height: 1.2;
          letter-spacing: -0.7px;
          font-weight: 700;
        }

        .register-header p {
          margin: 8px 0 0;
          color: #7b858e;
          font-size: 13px;
          line-height: 1.6;
        }

        /* ERROR */

        .register-error {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 11px 12px;
          margin-bottom: 20px;
          background: #fff7f7;
          border: 1px solid #f1d0d0;
          border-radius: 7px;
          color: #a33b3b;
          font-size: 12px;
          line-height: 1.4;
        }

        .error-symbol {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #a33b3b;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
        }

        /* SECTION */

        .section-heading {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 16px;
        }

        .owner-heading {
          margin-top: 25px;
        }

        .section-number {
          width: 27px;
          height: 27px;
          flex-shrink: 0;
          border-radius: 7px;
          background: #f0f2f4;
          color: #69747e;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
        }

        .section-heading h3 {
          margin: 0;
          color: #35404a;
          font-size: 12px;
          font-weight: 700;
        }

        .section-heading p {
          margin: 2px 0 0;
          color: #9aa2a9;
          font-size: 10px;
        }

        /* FIELDS */

        .field {
          margin-bottom: 16px;
        }

        .field label {
          display: block;
          margin-bottom: 7px;
          color: #39444e;
          font-size: 12px;
          font-weight: 600;
        }

        .name-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .input-box {
          position: relative;
          width: 100%;
        }

        .input-box input {
          width: 100%;
          height: 44px;
          padding: 0 40px;
          border: 1px solid #d9dde1;
          border-radius: 7px;
          background: #fff;
          outline: none;
          color: #202a33;
          font-size: 13px;
          transition:
            border-color 0.15s ease,
            box-shadow 0.15s ease;
        }

        .input-box input::placeholder {
          color: #a1a8af;
        }

        .input-box input:focus {
          border-color: #65717c;
          box-shadow:
            0 0 0 3px rgba(29, 39, 49, 0.06);
        }

        .input-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #8a949d;
          display: flex;
          pointer-events: none;
        }

        /* PASSWORD */

        .password-field {
          margin-bottom: 17px;
        }

        .password-hint {
          display: block;
          margin-top: 6px;
          color: #9ba3aa;
          font-size: 10px;
        }

        .show-password {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          border: 0;
          background: transparent;
          padding: 5px;
          color: #87919a;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .show-password:hover {
          color: #1d2731;
        }

        /* TERMS */

        .terms {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          color: #737e87;
          font-size: 10.5px;
          line-height: 1.5;
          cursor: pointer;
          margin-bottom: 20px;
        }

        .terms input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .terms-check {
          width: 16px;
          height: 16px;
          flex: 0 0 16px;
          margin-top: 1px;
          border: 1px solid #c9ced3;
          border-radius: 4px;
          background: #fff;
          position: relative;
        }

        .terms input:checked + .terms-check {
          background: #1d2731;
          border-color: #1d2731;
        }

        .terms input:checked + .terms-check::after {
          content: "✓";
          position: absolute;
          left: 2px;
          top: -1px;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
        }

        .terms a {
          color: #3d4852;
          font-weight: 600;
          text-decoration: none;
        }

        .terms a:hover {
          text-decoration: underline;
        }

        /* BUTTON */

        .register-btn {
          width: 100%;
          height: 46px;
          border: 0;
          border-radius: 7px;
          background: #1d2731;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 650;
          cursor: pointer;
          transition:
            background 0.15s ease,
            transform 0.15s ease;
        }

        .register-btn:hover:not(:disabled) {
          background: #2b3945;
          transform: translateY(-1px);
        }

        .register-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .register-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .loader {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          animation: rotate 0.7s linear infinite;
        }

        @keyframes rotate {
          to {
            transform: rotate(360deg);
          }
        }

        /* LOGIN */

        .login-link {
          display: flex;
          justify-content: center;
          gap: 5px;
          margin-top: 20px;
          color: #8a949c;
          font-size: 12px;
        }

        .login-link a {
          color: #1d2731;
          font-weight: 650;
          text-decoration: none;
        }

        .login-link a:hover {
          text-decoration: underline;
        }

        /* FOOTER */

        .register-footer {
          width: 100%;
          display: flex;
          justify-content: space-between;
          margin-top: 14px;
          padding: 0 3px;
          color: #a1a8ae;
          font-size: 10px;
        }

        /* MOBILE */

        @media (max-width: 600px) {

          .register-page {
            padding: 20px 14px;
            align-items: center;
          }

          .register-brand {
            margin-bottom: 17px;
          }

          .register-card {
            padding: 27px 21px 24px;
            border-radius: 10px;
          }

          .register-header h1 {
            font-size: 24px;
          }

          .register-header p {
            font-size: 12px;
          }

          .name-grid {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .owner-heading {
            margin-top: 23px;
          }

          .register-footer {
            font-size: 9px;
          }
        }

        @media (max-width: 360px) {

          .register-page {
            padding: 15px 10px;
          }

          .register-card {
            padding: 24px 17px 21px;
          }

          .register-header h1 {
            font-size: 22px;
          }

          .section-heading h3 {
            font-size: 11px;
          }

          .input-box input {
            height: 43px;
          }

          .register-btn {
            height: 44px;
          }
        }

      `}</style>

    </main>
  );
}
