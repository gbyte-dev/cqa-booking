'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { storage } from '@/lib/storage';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError('');

    try {
      const result = await authAPI.login(email, password);

      if (result.success) {
        storage.setToken(result.data.token);
        storage.setUser(result.data.user);

        router.push('/tenant/dashboard');
      } else {
        setError(result.error || 'Invalid email or password.');
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
    <main className="tenant-login-page">

      <div className="login-wrapper">

        {/* Brand */}
        <div className="login-brand">
          <div className="brand-logo">C</div>
          <span>CQA Booking</span>
        </div>

        {/* Card */}
        <div className="login-card">

          <div className="login-header">
            <h1>Welcome back</h1>
            <p>
              Sign in to manage your venue and reservations.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="login-error">
              <span className="error-symbol">!</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>

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
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />

              </div>
            </div>

            {/* Password */}
            <div className="field">

              <div className="password-heading">
                <label htmlFor="password">
                  Password
                </label>

                <a href="/tenant/forgot-password">
                  Forgot password?
                </a>
              </div>

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
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
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
            </div>

            {/* Remember */}
            <label className="remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) =>
                  setRememberMe(e.target.checked)
                }
              />

              <span className="checkmark"></span>

              <span>Remember me</span>
            </label>

            {/* Login */}
            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loader"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in

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

          {/* Register */}
          <div className="register">
            <span>Don't have an account?</span>
            <a href="/tenant/register">
              Create an account
            </a>
          </div>

        </div>

        {/* Footer */}
        <div className="login-footer">
          <span>© 2026 CQA Booking</span>
          <span>Secure access</span>
        </div>

      </div>

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .tenant-login-page {
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
          padding: 30px 20px;
          color: #1f2933;
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .login-wrapper {
          width: 100%;
          max-width: 430px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* BRAND */

        .login-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
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
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 800;
        }

        /* CARD */

        .login-card {
          width: 100%;
          background: #ffffff;
          border: 1px solid #e4e7ea;
          border-radius: 12px;
          padding: 34px 36px 30px;
          box-shadow:
            0 8px 30px rgba(16, 24, 40, 0.055);
        }

        /* HEADER */

        .login-header {
          margin-bottom: 28px;
        }

        .login-header h1 {
          margin: 0;
          font-size: 26px;
          line-height: 1.25;
          letter-spacing: -0.7px;
          font-weight: 700;
          color: #18212a;
        }

        .login-header p {
          margin: 8px 0 0;
          color: #7b858e;
          font-size: 13px;
          line-height: 1.6;
        }

        /* ERROR */

        .login-error {
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

        /* FIELDS */

        .field {
          margin-bottom: 19px;
        }

        .field label {
          display: block;
          margin-bottom: 7px;
          color: #39444e;
          font-size: 12px;
          font-weight: 600;
        }

        .password-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .password-heading label {
          margin-bottom: 7px;
        }

        .password-heading a {
          color: #596570;
          font-size: 11px;
          font-weight: 600;
          text-decoration: none;
        }

        .password-heading a:hover {
          color: #1d2731;
          text-decoration: underline;
        }

        .input-box {
          position: relative;
          width: 100%;
        }

        .input-box input {
          width: 100%;
          height: 46px;
          border: 1px solid #d9dde1;
          border-radius: 7px;
          background: #fff;
          outline: none;
          padding: 0 42px 0 42px;
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

        /* REMEMBER */

        .remember {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 22px;
          color: #69747e;
          font-size: 12px;
          cursor: pointer;
          user-select: none;
        }

        .remember input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .checkmark {
          width: 16px;
          height: 16px;
          border: 1px solid #c9ced3;
          border-radius: 4px;
          background: #fff;
          position: relative;
        }

        .remember input:checked + .checkmark {
          background: #1d2731;
          border-color: #1d2731;
        }

        .remember input:checked + .checkmark::after {
          content: "✓";
          position: absolute;
          left: 2px;
          top: -1px;
          color: white;
          font-size: 12px;
          font-weight: 700;
        }

        /* LOGIN BUTTON */

        .login-btn {
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

        .login-btn:hover:not(:disabled) {
          background: #2b3945;
          transform: translateY(-1px);
        }

        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .loader {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          animation: rotate 0.7s linear infinite;
        }

        @keyframes rotate {
          to {
            transform: rotate(360deg);
          }
        }

        /* REGISTER */

        .register {
          display: flex;
          justify-content: center;
          gap: 5px;
          margin-top: 22px;
          color: #8a949c;
          font-size: 12px;
        }

        .register a {
          color: #1d2731;
          font-weight: 650;
          text-decoration: none;
        }

        .register a:hover {
          text-decoration: underline;
        }

        /* FOOTER */

        .login-footer {
          width: 100%;
          display: flex;
          justify-content: space-between;
          margin-top: 17px;
          padding: 0 3px;
          color: #a1a8ae;
          font-size: 10px;
        }

        /* TABLET */

        @media (max-width: 600px) {

          .tenant-login-page {
            padding: 22px 16px;
            align-items: center;
          }

          .login-brand {
            margin-bottom: 20px;
          }

          .login-card {
            padding: 28px 22px 25px;
            border-radius: 10px;
          }

          .login-header h1 {
            font-size: 24px;
          }

          .login-footer {
            margin-top: 14px;
          }
        }

        /* SMALL MOBILE */

        @media (max-width: 360px) {

          .tenant-login-page {
            padding: 16px 12px;
          }

          .login-card {
            padding: 25px 18px 22px;
          }

          .login-header {
            margin-bottom: 24px;
          }

          .login-header h1 {
            font-size: 23px;
          }

          .login-header p {
            font-size: 12px;
          }

          .login-footer {
            font-size: 9px;
          }
        }

      `}</style>

    </main>
  );
}
