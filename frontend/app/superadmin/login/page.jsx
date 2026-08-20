'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { storage } from '@/lib/storage';

export default function SuperAdminLoginPage() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [email, setEmail] = useState('superadmin@cqabooking.com');
  const [password, setPassword] = useState('SuperAdmin@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  /* ============================================
     CHECK EXISTING AUTH
  ============================================ */

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = storage.getToken();
        const user = storage.getUser();

        if (
          token &&
          user &&
          user.role === 'superadmin'
        ) {
          router.replace('/superadmin/dashboard');
          return;
        }

        if (
          token &&
          user &&
          user.role !== 'superadmin'
        ) {
          storage.clear();
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }

      setCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

  /* ============================================
     LOGIN
  ============================================ */

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError('');

    try {
      const result = await authAPI.login(
        email.trim(),
        password
      );

      if (!result?.success) {
        setError(
          result?.error ||
            result?.message ||
            'Login failed. Please check your credentials.'
        );

        setLoading(false);
        return;
      }

      const user = result?.data?.user;
      const token = result?.data?.token;

      if (!user || !token) {
        setError(
          'Invalid server response. Token or user information is missing.'
        );

        setLoading(false);
        return;
      }

      if (user.role !== 'superadmin') {
        storage.clear();

        setError(
          'This account does not have Super Admin access.'
        );

        setLoading(false);
        return;
      }

      storage.setToken(token);
      storage.setUser(user);

      router.replace('/superadmin/dashboard');
    } catch (err) {
      console.error(
        'Super Admin Login Error:',
        err
      );

      setError(
        err?.message ||
          'Unable to connect to the server. Please try again.'
      );

      setLoading(false);
    }
  };

  /* ============================================
     AUTH CHECK
  ============================================ */

  if (checkingAuth) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
        <p>Checking your session...</p>

        <style jsx>{`
          .auth-loading {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #080b14;
            color: #98a2b3;
            font-family:
              Inter,
              Arial,
              sans-serif;
          }

          .loading-spinner {
            width: 38px;
            height: 38px;
            border: 3px solid rgba(255,255,255,0.12);
            border-top-color: #818cf8;
            border-radius: 50%;
            animation: spin 0.7s linear infinite;
          }

          .auth-loading p {
            margin-top: 15px;
            font-size: 13px;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <main className="login-page">

      {/* Background */}

      <div className="background-grid"></div>

      <div className="glow glow-one"></div>
      <div className="glow glow-two"></div>

      {/* Main Card */}

      <div className="login-card">

        {/* ======================================
            LEFT BRAND PANEL
        ====================================== */}

        <section className="brand-panel">

          <div className="brand-top">

            <div className="brand-logo">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 3L14.4 8.2L20 9L16 13L17 18.7L12 16L7 18.7L8 13L4 9L9.6 8.2L12 3Z"
                  fill="white"
                />
              </svg>
            </div>

            <div className="brand-name">
              CQA<span>BOOKING</span>
            </div>

          </div>

          <div className="brand-content">

            <div className="secure-label">
              <span></span>
              SUPER ADMIN PORTAL
            </div>

            <h1>
              Complete control.
              <br />
              One powerful dashboard.
            </h1>

            <p>
              Manage organizations, venues,
              subscriptions, users and platform
              operations from a centralized
              administration panel.
            </p>

            <div className="feature-list">

              <Feature
                title="Organization Management"
                text="Manage every organization from a single platform."
              />

              <Feature
                title="Real-time Analytics"
                text="Track users, subscriptions and platform revenue."
              />

              <Feature
                title="Secure Access"
                text="Enterprise-grade administrative access control."
              />

            </div>

          </div>

          <div className="brand-footer">
            © 2026 CQA Booking Platform
          </div>

        </section>

        {/* ======================================
            RIGHT LOGIN PANEL
        ====================================== */}

        <section className="form-panel">

          <div className="form-container">

            {/* Mobile Brand */}

            <div className="mobile-brand">

              <div className="mobile-logo">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M12 3L14.4 8.2L20 9L16 13L17 18.7L12 16L7 18.7L8 13L4 9L9.6 8.2L12 3Z"
                    fill="white"
                  />
                </svg>
              </div>

              <div className="brand-name">
                CQA<span>BOOKING</span>
              </div>

            </div>

            {/* Header */}

            <div className="form-header">

              <div className="portal-badge">
                <span>●</span>
                SECURE ADMINISTRATION
              </div>

              <h2>
                Welcome back
              </h2>

              <p>
                Sign in to access your Super Admin
                dashboard.
              </p>

            </div>

            {/* Error */}

            {error && (
              <div className="error-box">

                <div className="error-icon">
                  !
                </div>

                <div>
                  <strong>
                    Authentication failed
                  </strong>

                  <p>{error}</p>
                </div>

              </div>
            )}

            {/* Form */}

            <form
              onSubmit={handleLogin}
              className="login-form"
            >

              {/* Email */}

              <div className="form-group">

                <label htmlFor="email">
                  Email address
                </label>

                <div className="input-wrapper">

                  <svg
                    className="input-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M4 5H20C21.1 5 22 5.9 22 7V17C22 18.1 21.1 19 20 19H4C2.9 19 2 18.1 2 17V7C2 5.9 2.9 5 4 5Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M3 7L12 13L21 7"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="superadmin@cqabooking.com"
                    autoComplete="email"
                    disabled={loading}
                    required
                  />

                </div>

              </div>

              {/* Password */}

              <div className="form-group">

                <div className="password-label-row">

                  <label htmlFor="password">
                    Password
                  </label>

                  <span>
                    Protected
                  </span>

                </div>

                <div className="input-wrapper">

                  <svg
                    className="input-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <rect
                      x="4"
                      y="10"
                      width="16"
                      height="11"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />

                    <path
                      d="M8 10V7C8 4.8 9.8 3 12 3C14.2 3 16 4.8 16 7V10"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />

                    <circle
                      cx="12"
                      cy="15.5"
                      r="1.3"
                      fill="currentColor"
                    />
                  </svg>

                  <input
                    id="password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={loading}
                    required
                  />

                  {/* EYE BUTTON */}

                  <button
                    type="button"
                    className="eye-button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    disabled={loading}
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >

                    {showPassword ? (
                      /* Eye Off */

                      <svg
                        width="19"
                        height="19"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M3 3L21 21"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />

                        <path
                          d="M10.6 10.6C10.2 11 10 11.5 10 12C10 13.1 10.9 14 12 14C12.5 14 13 13.8 13.4 13.4"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />

                        <path
                          d="M9.9 4.4C10.6 4.1 11.3 4 12 4C17 4 20.7 8.2 22 12C21.4 13.8 20.3 15.5 18.9 16.8"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />

                        <path
                          d="M6.2 6.2C4.2 7.6 2.8 9.8 2 12C3.3 15.8 7 20 12 20C13.7 20 15.3 19.5 16.7 18.7"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      /* Eye */

                      <svg
                        width="19"
                        height="19"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M2 12C3.5 7.8 7.3 5 12 5C16.7 5 20.5 7.8 22 12C20.5 16.2 16.7 19 12 19C7.3 19 3.5 16.2 2 12Z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />

                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />
                      </svg>
                    )}

                  </button>

                </div>

              </div>

              {/* Submit */}

              <button
                type="submit"
                className="login-button"
                disabled={
                  loading ||
                  !email ||
                  !password
                }
              >

                {loading ? (
                  <>
                    <span className="button-spinner"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Access Dashboard
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M5 12H19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />

                      <path
                        d="M13 6L19 12L13 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </>
                )}

              </button>

            </form>

            {/* Demo */}

            <div className="demo-box">

              <div className="demo-title">
                <span>DEMO CREDENTIALS</span>
                <i></i>
              </div>

              <div className="demo-item">
                <span>Email</span>
                <code>
                  superadmin@cqabooking.com
                </code>
              </div>

              <div className="demo-item">
                <span>Password</span>
                <code>
                  SuperAdmin@123
                </code>
              </div>

            </div>

            {/* Home */}

            <a
              href="/"
              className="home-link"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M19 12H5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />

                <path
                  d="M11 18L5 12L11 6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              Back to CQA Booking
            </a>

          </div>
        </section>

      </div>

      {/* ==========================================
          CSS
      ========================================== */}

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .login-page {
          min-height: 100vh;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          overflow: hidden;
          background: #080b14;
          font-family:
            Inter,
            Arial,
            Helvetica,
            sans-serif;
        }

        /* Background */

        .background-grid {
          position: absolute;
          inset: 0;
          opacity: 0.035;
          background-image:
            linear-gradient(
              rgba(255,255,255,.7) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,.7) 1px,
              transparent 1px
            );
          background-size: 45px 45px;
          pointer-events: none;
        }

        .glow {
          position: absolute;
          width: 450px;
          height: 450px;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
        }

        .glow-one {
          top: -260px;
          left: -200px;
          background: rgba(99,102,241,.18);
        }

        .glow-two {
          right: -250px;
          bottom: -280px;
          background: rgba(124,58,237,.18);
        }

        /* Main */

        .login-card {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1080px;
          min-height: 650px;
          display: grid;
          grid-template-columns: 1fr 0.9fr;
          overflow: hidden;
          border-radius: 26px;
          border: 1px solid rgba(255,255,255,.08);
          background: rgba(13,17,29,.94);
          box-shadow:
            0 35px 100px rgba(0,0,0,.45);
        }

        /* Left */

        .brand-panel {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 55px;
          border-right: 1px solid rgba(255,255,255,.07);
          background:
            radial-gradient(
              circle at 20% 20%,
              rgba(99,102,241,.13),
              transparent 40%
            );
        }

        .brand-top {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .brand-logo,
        .mobile-logo {
          width: 46px;
          height: 46px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          background:
            linear-gradient(
              135deg,
              #667eea,
              #764ba2
            );
          box-shadow:
            0 10px 30px rgba(102,126,234,.25);
        }

        .brand-name {
          color: #fff;
          font-size: 17px;
          font-weight: 800;
          letter-spacing: 1.6px;
        }

        .brand-name span {
          color: #8b95f9;
        }

        .brand-content {
          max-width: 470px;
        }

        .secure-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 25px;
          color: #9da8ff;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.3px;
        }

        .secure-label span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #6ee7b7;
          box-shadow:
            0 0 10px #6ee7b7;
        }

        .brand-content h1 {
          margin: 0;
          color: #f7f8fb;
          font-size: clamp(36px, 4vw, 52px);
          line-height: 1.08;
          letter-spacing: -2px;
          font-weight: 750;
        }

        .brand-content > p {
          margin: 23px 0 0;
          max-width: 430px;
          color: #818ca0;
          font-size: 14px;
          line-height: 1.8;
        }

        .feature-list {
          display: grid;
          gap: 17px;
          margin-top: 35px;
        }

        .feature {
          display: flex;
          gap: 12px;
        }

        .feature-icon {
          width: 25px;
          height: 25px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
          background: rgba(129,140,248,.1);
          color: #9da8ff;
          font-size: 12px;
        }

        .feature strong {
          display: block;
          color: #dce1ea;
          font-size: 12px;
          margin-bottom: 3px;
        }

        .feature p {
          margin: 0;
          color: #69758a;
          font-size: 11px;
          line-height: 1.5;
        }

        .brand-footer {
          color: #525d71;
          font-size: 10px;
        }

        /* Right */

        .form-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 50px;
          background: rgba(8,11,20,.58);
        }

        .form-container {
          width: 100%;
          max-width: 370px;
        }

        .mobile-brand {
          display: none;
        }

        .portal-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 9px;
          border: 1px solid rgba(129,140,248,.18);
          border-radius: 6px;
          background: rgba(129,140,248,.06);
          color: #9da8ff;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .portal-badge span {
          color: #6ee7b7;
          font-size: 7px;
        }

        .form-header {
          margin-bottom: 28px;
        }

        .form-header h2 {
          margin: 17px 0 8px;
          color: #f5f7fb;
          font-size: 32px;
          letter-spacing: -1px;
        }

        .form-header p {
          margin: 0;
          color: #778196;
          font-size: 12px;
          line-height: 1.7;
        }

        /* Error */

        .error-box {
          display: flex;
          gap: 11px;
          padding: 12px;
          margin-bottom: 20px;
          border: 1px solid rgba(248,113,113,.18);
          border-radius: 10px;
          background: rgba(239,68,68,.06);
          color: #fca5a5;
        }

        .error-icon {
          width: 21px;
          height: 21px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(239,68,68,.15);
          font-size: 11px;
          font-weight: 800;
        }

        .error-box strong {
          display: block;
          margin-bottom: 3px;
          font-size: 11px;
        }

        .error-box p {
          margin: 0;
          font-size: 10px;
          line-height: 1.5;
        }

        /* Form */

        .login-form {
          display: grid;
          gap: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #c8ced9;
          font-size: 11px;
          font-weight: 650;
        }

        .password-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .password-label-row span {
          color: #566176;
          font-size: 9px;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #59657a;
          pointer-events: none;
        }

        .input-wrapper input {
          width: 100%;
          height: 49px;
          padding: 0 43px;
          border: 1px solid #252d3e;
          border-radius: 10px;
          outline: none;
          background: #0e1320;
          color: #edf0f6;
          font-size: 12px;
          transition: all .2s ease;
        }

        .input-wrapper input::placeholder {
          color: #4f596c;
        }

        .input-wrapper input:focus {
          border-color: #707bea;
          background: #101625;
          box-shadow:
            0 0 0 3px rgba(112,123,234,.09);
        }

        .input-wrapper input:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        /* Eye */

        .eye-button {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          color: #68748a;
          cursor: pointer;
          border-radius: 6px;
        }

        .eye-button:hover {
          color: #a5b4fc;
          background: rgba(129,140,248,.07);
        }

        .eye-button:disabled {
          cursor: not-allowed;
          opacity: .5;
        }

        /* Button */

        .login-button {
          width: 100%;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          margin-top: 3px;
          border: none;
          border-radius: 10px;
          background:
            linear-gradient(
              135deg,
              #667eea,
              #764ba2
            );
          color: white;
          font-size: 12px;
          font-weight: 750;
          cursor: pointer;
          box-shadow:
            0 10px 30px rgba(102,126,234,.2);
          transition: all .2s ease;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow:
            0 15px 35px rgba(102,126,234,.3);
        }

        .login-button:disabled {
          opacity: .5;
          cursor: not-allowed;
          box-shadow: none;
        }

        .button-spinner {
          width: 15px;
          height: 15px;
          border: 2px solid rgba(255,255,255,.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin .7s linear infinite;
        }

        /* Demo */

        .demo-box {
          margin-top: 23px;
          padding: 14px;
          border: 1px solid rgba(255,255,255,.06);
          border-radius: 10px;
          background: rgba(255,255,255,.025);
        }

        .demo-title {
          display: flex;
          justify-content: space-between;
          margin-bottom: 9px;
          color: #68748a;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .demo-title i {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #6ee7b7;
        }

        .demo-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 4px 0;
          color: #667287;
          font-size: 9px;
        }

        .demo-item code {
          color: #a6afbf;
          font-size: 9px;
          text-align: right;
        }

        .home-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 21px;
          color: #626e83;
          font-size: 10px;
          text-decoration: none;
          transition: color .2s;
        }

        .home-link:hover {
          color: #a5b4fc;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* ======================================
           LARGE TABLET
        ====================================== */

        @media (max-width: 1000px) {

          .login-page {
            padding: 25px;
          }

          .login-card {
            max-width: 850px;
            grid-template-columns: 1fr 1fr;
          }

          .brand-panel {
            padding: 40px;
          }

          .form-panel {
            padding: 40px;
          }

          .brand-content h1 {
            font-size: 38px;
          }

          .feature-list {
            margin-top: 25px;
          }
        }

        /* ======================================
           TABLET / MOBILE
        ====================================== */

        @media (max-width: 768px) {

          .login-page {
            min-height: 100dvh;
            padding: 20px;
            align-items: center;
          }

          .login-card {
            display: block;
            width: 100%;
            max-width: 480px;
            min-height: auto;
            border-radius: 20px;
          }

          .brand-panel {
            display: none;
          }

          .form-panel {
            width: 100%;
            padding: 35px 30px;
          }

          .mobile-brand {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 11px;
            margin-bottom: 32px;
          }

          .mobile-logo {
            width: 40px;
            height: 40px;
            border-radius: 11px;
          }

          .mobile-brand .brand-name {
            font-size: 15px;
          }

          .form-container {
            max-width: none;
          }
        }

        /* ======================================
           SMALL MOBILE
        ====================================== */

        @media (max-width: 480px) {

          .login-page {
            padding: 12px;
            align-items: flex-start;
            padding-top: 18px;
          }

          .login-card {
            border-radius: 17px;
          }

          .form-panel {
            padding: 28px 20px 25px;
          }

          .mobile-brand {
            margin-bottom: 28px;
          }

          .form-header {
            margin-bottom: 24px;
          }

          .form-header h2 {
            font-size: 28px;
            margin-top: 14px;
          }

          .form-header p {
            font-size: 11px;
          }

          .login-form {
            gap: 18px;
          }

          .input-wrapper input {
            height: 48px;
            font-size: 12px;
          }

          .login-button {
            height: 49px;
          }

          .demo-box {
            margin-top: 20px;
          }

          .demo-item {
            align-items: flex-start;
            flex-direction: column;
            gap: 3px;
          }

          .demo-item code {
            text-align: left;
            word-break: break-word;
          }
        }

        /* ======================================
           VERY SMALL DEVICES
        ====================================== */

        @media (max-width: 360px) {

          .login-page {
            padding: 8px;
            padding-top: 12px;
          }

          .form-panel {
            padding: 24px 16px;
          }

          .form-header h2 {
            font-size: 25px;
          }

          .portal-badge {
            font-size: 7px;
          }

          .mobile-brand {
            margin-bottom: 24px;
          }
        }

      `}</style>
    </main>
  );
}


/* ============================================
   FEATURE COMPONENT
============================================ */

function Feature({ title, text }) {
  return (
    <div className="feature">

      <div className="feature-icon">
        ✓
      </div>

      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>

    </div>
  );
}