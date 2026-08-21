'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';

export default function Home() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = storage.getToken();
    const user = storage.getUser();

    if (token && user) {
      if (user.role === 'superadmin') {
        router.replace('/superadmin/dashboard');
      } else {
        router.replace('/tenant/dashboard');
      }
      return;
    }

    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div className="home-loading">
        <div className="home-loading-logo">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path d="M12 3L14.4 8.2L20 9L16 13L17 18.7L12 16L7 18.7L8 13L4 9L9.6 8.2L12 3Z" fill="#b45309" />
          </svg>
        </div>
        <p>Loading CQA Booking...</p>
      </div>
    );
  }

  return (
    <main className="home-page">
      {/* NAV */}
      <header className="home-nav">
        <div className="home-nav-inner">
          <div className="home-logo">
            <div className="home-logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 3L14.4 8.2L20 9L16 13L17 18.7L12 16L7 18.7L8 13L4 9L9.6 8.2L12 3Z" fill="white" />
              </svg>
            </div>
            <span>CQA<em>BOOKING</em></span>
          </div>

          <div className="home-nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <Link href="/tenant/login" className="nav-login">Sign in</Link>
            <Link href="/tenant/register" className="nav-register">Get started</Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="home-hero">
        <div className="home-hero-glow glow-a"></div>
        <div className="home-hero-glow glow-b"></div>

        <div className="home-hero-inner">
          <div className="home-hero-badge">
            <span>●</span>
            Multi-tenant booking platform
          </div>

          <h1>
            Book tables, manage venues,
            <br />
            <span>grow your restaurant.</span>
          </h1>

          <p>
            CQA Booking helps restaurants and venues accept reservations,
            manage tables, track customers, and grow revenue — all from one
            simple dashboard.
          </p>

          <div className="home-hero-actions">
            <Link href="/tenant/register" className="hero-btn primary">
              Start free
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M13 6L19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>

            <Link href="/tenant/login" className="hero-btn secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="10" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" />
              </svg>
              Sign in to dashboard
            </Link>
          </div>

          <div className="home-hero-proof">
            <div className="proof-item">
              <strong>3</strong>
              <span>Plans</span>
            </div>
            <div className="proof-item">
              <strong>∞</strong>
              <span>Venues</span>
            </div>
            <div className="proof-item">
              <strong>24/7</strong>
              <span>Availability</span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="home-section" id="features">
        <div className="home-section-inner">
          <div className="home-section-heading">
            <span className="home-kicker">FEATURES</span>
            <h2>Everything you need to run bookings</h2>
            <p>
              From first reservation to repeat customer — manage it all.
            </p>
          </div>

          <div className="home-features-grid">
            <div className="home-feature-card">
              <div className="feature-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M3 21h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M5 21V6l7-3 7 3v15" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M9 21v-5h6v5" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </div>
              <strong>Venue & table management</strong>
              <p>Add restaurants, lounges, and cafes. Define tables, capacity, and availability windows.</p>
            </div>

            <div className="home-feature-card">
              <div className="feature-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <strong>Smart reservations</strong>
              <p>Guests pick a date, time, and party size. Your staff confirms with one click.</p>
            </div>

            <div className="home-feature-card">
              <div className="feature-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M2 7h20v5H2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M12 22v-6" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </div>
              <strong>Customer profiles</strong>
              <p>Track regulars, preferences, spending, and booking history automatically.</p>
            </div>

            <div className="home-feature-card">
              <div className="feature-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <strong>Flexible plans</strong>
              <p>Start with the free plan. Scale to unlimited venues as your business grows.</p>
            </div>

            <div className="home-feature-card">
              <div className="feature-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </div>
              <strong>Real-time status</strong>
              <p>Check-ins, no-shows, and completions update your board instantly.</p>
            </div>

            <div className="home-feature-card">
              <div className="feature-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M6 3v18M18 3v18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </div>
              <strong>Reports & analytics</strong>
              <p>Understand occupancy, revenue, and guest trends with clear reports.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="home-section home-section-alt" id="how-it-works">
        <div className="home-section-inner">
          <div className="home-section-heading">
            <span className="home-kicker">HOW IT WORKS</span>
            <h2>Live in three simple steps</h2>
          </div>

          <div className="home-steps">
            <div className="home-step">
              <div className="step-number">01</div>
              <strong>Create your account</strong>
              <p>Register your restaurant or venue in under a minute.</p>
            </div>

            <div className="home-step">
              <div className="step-number">02</div>
              <strong>Set up your venues</strong>
              <p>Add your venues, tables, and opening hours.</p>
            </div>

            <div className="home-step">
              <div className="step-number">03</div>
              <strong>Accept bookings</strong>
              <p>Share your booking link and start filling tables.</p>
            </div>
          </div>

          <div className="home-step-cta">
            <Link href="/tenant/register" className="hero-btn primary">
              Create a free account
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="home-cta">
        <div className="home-cta-inner">
          <h2>Ready to fill more tables?</h2>
          <p>
            Join restaurants using CQA Booking to simplify reservations
            and grow their business.
          </p>
          <Link href="/tenant/register" className="hero-btn primary">
            Get started now
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="home-footer-inner">
          <div className="home-footer-brand">
            <div className="home-logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 3L14.4 8.2L20 9L16 13L17 18.7L12 16L7 18.7L8 13L4 9L9.6 8.2L12 3Z" fill="white" />
              </svg>
            </div>
            <span>CQA<em>BOOKING</em></span>
          </div>

          <div className="home-footer-links">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/support">Support</Link>
          </div>

          <div className="home-footer-copy">
            © {new Date().getFullYear()} CQA Booking. All rights reserved.
          </div>
        </div>
      </footer>

      <style jsx>{`
        * { box-sizing: border-box; }

        .home-page {
          min-height: 100vh;
          background: #faf6ef;
          color: #2b2118;
          font-family: Inter, system-ui, -apple-system, "Segoe UI", sans-serif;
          overflow-x: hidden;
        }

        .home-loading {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          background: #faf6ef;
          color: #8a6d3b;
          font-family: Inter, sans-serif;
          font-size: 13px;
        }

        .home-loading-logo {
          width: 58px;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          background: #fff8ed;
          border: 1px solid #eadfc8;
          animation: pulse 1.2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.75; }
        }

        /* NAV */
        .home-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(250, 246, 239, 0.92);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid #eadfc8;
        }

        .home-nav-inner {
          max-width: 1150px;
          margin: 0 auto;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .home-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 0.5px;
          color: #2b2118;
        }

        .home-logo em {
          font-style: normal;
          color: #b45309;
          margin-left: 4px;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 1.2px;
        }

        .home-logo-icon {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: linear-gradient(135deg, #d97706, #92400e);
          box-shadow: 0 6px 18px rgba(180, 83, 9, 0.22);
        }

        .home-nav-links {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .home-nav-links a {
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          color: #6b5d4b;
          padding: 9px 12px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .home-nav-links a:not(.nav-login):not(.nav-register):hover {
          color: #b45309;
          background: #f4ecdd;
        }

        .home-nav-links .nav-login {
          color: #3f3326;
        }

        .home-nav-links .nav-register {
          background: #1f2937;
          color: #fff;
          padding: 10px 18px;
          border-radius: 9px;
        }

        .home-nav-links .nav-register:hover {
          background: #b45309;
          transform: translateY(-1px);
        }

        /* HERO */
        .home-hero {
          position: relative;
          overflow: hidden;
          padding: 90px 24px 100px;
        }

        .home-hero-glow {
          position: absolute;
          width: 480px;
          height: 480px;
          border-radius: 50%;
          filter: blur(110px);
          pointer-events: none;
        }

        .glow-a { top: -180px; left: -160px; background: rgba(217, 119, 6, 0.16); }
        .glow-b { bottom: -240px; right: -160px; background: rgba(166, 108, 42, 0.14); }

        .home-hero-inner {
          position: relative;
          z-index: 2;
          max-width: 1150px;
          margin: 0 auto;
          text-align: center;
        }

        .home-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 999px;
          border: 1px solid #e4d5b8;
          background: #fff9ef;
          color: #8a6d3b;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .home-hero-badge span {
          color: #16a34a;
          font-size: 9px;
        }

        .home-hero h1 {
          margin: 28px 0 0;
          font-size: clamp(40px, 6vw, 68px);
          line-height: 1.08;
          letter-spacing: -2.5px;
          font-weight: 800;
          color: #241c14;
        }

        .home-hero h1 span {
          color: #b45309;
        }

        .home-hero-inner > p {
          margin: 24px auto 0;
          max-width: 620px;
          color: #7d6f5c;
          font-size: 16px;
          line-height: 1.75;
        }

        .home-hero-actions {
          display: flex;
          justify-content: center;
          gap: 14px;
          margin-top: 36px;
          flex-wrap: wrap;
        }

        .hero-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 15px 28px;
          border-radius: 11px;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .hero-btn.primary {
          background: #d97706;
          color: #fff;
          box-shadow: 0 10px 30px rgba(217, 119, 6, 0.28);
        }

        .hero-btn.primary:hover {
          background: #b45309;
          transform: translateY(-2px);
          box-shadow: 0 16px 38px rgba(180, 83, 9, 0.32);
        }

        .hero-btn.secondary {
          background: #fff;
          color: #3f3326;
          border: 1px solid #e4d5b8;
        }

        .hero-btn.secondary:hover {
          border-color: #b45309;
          color: #b45309;
          transform: translateY(-2px);
        }

        .home-hero-proof {
          display: flex;
          justify-content: center;
          gap: 42px;
          margin-top: 56px;
        }

        .proof-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .proof-item strong {
          font-size: 26px;
          font-weight: 800;
          color: #241c14;
        }

        .proof-item span {
          font-size: 11px;
          color: #8a7b66;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* SECTIONS */
        .home-section {
          padding: 85px 24px;
        }

        .home-section-alt {
          background: #f1e8d8;
        }

        .home-section-inner {
          max-width: 1100px;
          margin: 0 auto;
        }

        .home-section-heading {
          text-align: center;
          margin-bottom: 50px;
        }

        .home-kicker {
          display: inline-block;
          margin-bottom: 12px;
          color: #b45309;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .home-section-heading h2 {
          margin: 0;
          font-size: clamp(30px, 4vw, 42px);
          letter-spacing: -1.5px;
          color: #241c14;
        }

        .home-section-heading p {
          margin: 14px 0 0;
          color: #7d6f5c;
          font-size: 15px;
        }

        /* FEATURE GRID */
        .home-features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
        }

        .home-feature-card {
          padding: 30px 28px;
          background: #fffdf8;
          border: 1px solid #eadfc8;
          border-radius: 16px;
          transition: all 0.25s ease;
        }

        .home-feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 44px rgba(59, 42, 24, 0.08);
        }

        .feature-icon {
          width: 46px;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: #f7ead6;
          color: #b45309;
          margin-bottom: 20px;
        }

        .home-feature-card strong {
          display: block;
          font-size: 16px;
          color: #2b2118;
          margin-bottom: 9px;
        }

        .home-feature-card p {
          margin: 0;
          color: #7d6f5c;
          font-size: 13px;
          line-height: 1.65;
        }

        /* STEPS */
        .home-steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
        }

        .home-step {
          background: #fffdf8;
          border: 1px solid #e4d5b8;
          border-radius: 16px;
          padding: 34px 28px;
          text-align: left;
        }

        .step-number {
          font-size: 13px;
          font-weight: 800;
          color: #b45309;
          letter-spacing: 1.5px;
          margin-bottom: 16px;
        }

        .home-step strong {
          display: block;
          font-size: 17px;
          color: #2b2118;
          margin-bottom: 9px;
        }

        .home-step p {
          margin: 0;
          color: #7d6f5c;
          font-size: 13px;
          line-height: 1.65;
        }

        .home-step-cta {
          display: flex;
          justify-content: center;
          margin-top: 44px;
        }

        /* CTA */
        .home-cta {
          padding: 80px 24px;
          background: #1f2937;
        }

        .home-cta-inner {
          max-width: 640px;
          margin: 0 auto;
          text-align: center;
        }

        .home-cta h2 {
          margin: 0;
          color: #fff;
          font-size: clamp(28px, 4vw, 40px);
          letter-spacing: -1.2px;
        }

        .home-cta p {
          margin: 16px 0 30px;
          color: #aeb8c4;
          font-size: 15px;
          line-height: 1.7;
        }

        /* FOOTER */
        .home-footer {
          padding: 30px 24px;
          background: #171e2b;
        }

        .home-footer-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          flex-wrap: wrap;
        }

        .home-footer-brand {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #fff;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .home-footer-brand em {
          font-style: normal;
          color: #d97706;
          margin-left: 4px;
          font-size: 11px;
          letter-spacing: 1.2px;
        }

        .home-footer-links {
          display: flex;
          gap: 22px;
        }

        .home-footer-links a {
          color: #98a2b3;
          font-size: 12px;
          text-decoration: none;
          transition: color 0.2s;
        }

        .home-footer-links a:hover {
          color: #d97706;
        }

        .home-footer-copy {
          color: #6b7686;
          font-size: 11px;
        }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .home-features-grid { grid-template-columns: repeat(2, 1fr); }
          .home-steps { grid-template-columns: 1fr; max-width: 480px; margin: 0 auto; }
        }

        @media (max-width: 640px) {
          .home-nav-inner { padding: 13px 16px; }
          .home-nav-links a:not(.nav-login):not(.nav-register) { display: none; }
          .home-hero { padding: 60px 18px 70px; }
          .home-hero-actions { flex-direction: column; align-items: stretch; max-width: 340px; margin-left: auto; margin-right: auto; }
          .home-features-grid { grid-template-columns: 1fr; }
          .home-section { padding: 60px 18px; }
          .home-hero-proof { gap: 28px; }
          .home-footer-inner { flex-direction: column; text-align: center; justify-content: center; }
        }
      `}</style>
    </main>
  );
}
