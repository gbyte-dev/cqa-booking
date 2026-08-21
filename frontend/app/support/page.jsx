'use client';

import Link from 'next/link';
import './support.css';

export default function SupportPage() {
  return (
    <main className="support-page">
      {/* =====================================================
          TOP NAV
      ===================================================== */}
      <nav className="support-nav">
        <div className="support-nav-inner">
          <Link href="/" className="support-logo">
            <span className="logo-mark">C</span>
            <span className="logo-text">
              CQA<span>BOOKING</span>
            </span>
          </Link>

          <Link href="/tenant/login" className="back-login">
            Back to login
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </nav>

      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="support-hero">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />

        <div className="support-container hero-content">
          <div className="support-badge">
            <span className="badge-dot" />
            SUPPORT CENTER
          </div>

          <h1>
            How can we
            <span> help you?</span>
          </h1>

          <p className="support-subtitle">
            Find answers, explore helpful resources, or connect with our
            support team whenever you need assistance.
          </p>
        </div>
      </section>

      {/* =====================================================
          SUPPORT OPTIONS
      ===================================================== */}
      <section className="support-content">
        <div className="support-container">

          <div className="support-grid">

            {/* Contact Support */}
            <div className="support-card">
              <div className="card-top">
                <div className="support-icon">
                  <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <span className="card-arrow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>

              <h3>Contact support</h3>

              <p>
                Have a question or facing an issue? Our support team is ready
                to help.
              </p>

              <a
                href="mailto:support@cqabooking.com"
                className="support-link"
              >
                support@cqabooking.com
              </a>

              <div className="card-meta">
                <span className="status-dot" />
                Usually responds within 24 hours
              </div>
            </div>

            {/* Phone Support */}
            <div className="support-card">
              <div className="card-top">
                <div className="support-icon">
                  <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <span className="card-arrow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>

              <h3>Phone support</h3>

              <p>
                Speak directly with our team during regular business hours.
              </p>

              <a href="tel:+919999999999" className="support-link">
                +91 99999 99999
              </a>

              <div className="card-meta">
                <span className="clock-icon">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M12 7v5l3 2"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                Mon–Fri · 9:00 AM–6:00 PM IST
              </div>
            </div>

            {/* Guides */}
            <div className="support-card">
              <div className="card-top">
                <div className="support-icon">
                  <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <span className="card-arrow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>

              <h3>Self-help guides</h3>

              <p>
                Explore helpful guides and learn how to get the most out of
                CQA Booking.
              </p>

              <a
                href="mailto:support@cqabooking.com?subject=Documentation%20request"
                className="support-link"
              >
                Request guides
              </a>

              <div className="card-meta">
                <span className="guide-icon">●</span>
                Helpful resources available
              </div>
            </div>
          </div>

          {/* =====================================================
              FAQ
          ===================================================== */}
          <section className="faq-section">
            <div className="section-heading">
              <div>
                <span className="section-label">HELP CENTER</span>
                <h2>Frequently asked questions</h2>
              </div>

              <p>
                Quick answers to some of the most common questions about
                CQA Booking.
              </p>
            </div>

            <div className="faq-list">

              <div className="faq-item">
                <div className="faq-number">01</div>

                <div className="faq-content">
                  <h3>How do I create an organization account?</h3>

                  <p>
                    Visit the{' '}
                    <Link href="/tenant/register">
                      registration page
                    </Link>{' '}
                    and enter your organization details. Once registration is
                    completed, you can access your organization dashboard.
                  </p>
                </div>

                <div className="faq-plus">+</div>
              </div>

              <div className="faq-item">
                <div className="faq-number">02</div>

                <div className="faq-content">
                  <h3>How do I add a venue and tables?</h3>

                  <p>
                    After signing in, open <strong>Venues</strong> from your
                    sidebar to create a venue. You can then manage your tables
                    from the <strong>Tables</strong> section.
                  </p>
                </div>

                <div className="faq-plus">+</div>
              </div>

              <div className="faq-item">
                <div className="faq-number">03</div>

                <div className="faq-content">
                  <h3>How do guests make bookings?</h3>

                  <p>
                    Each venue can have a public booking page such as{' '}
                    <code>/book/your-venue-slug</code>. Share this link with
                    your guests so they can view availability and make
                    reservations.
                  </p>
                </div>

                <div className="faq-plus">+</div>
              </div>

              <div className="faq-item">
                <div className="faq-number">04</div>

                <div className="faq-content">
                  <h3>How do I upgrade my plan?</h3>

                  <p>
                    Contact your platform administrator to change your
                    subscription plan, or reach out to our support team for
                    assistance with your account.
                  </p>
                </div>

                <div className="faq-plus">+</div>
              </div>

            </div>
          </section>

          {/* =====================================================
              BOTTOM CTA
          ===================================================== */}
          <section className="support-cta">
            <div className="cta-glow" />

            <div className="cta-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.3 9.3 0 0 1-4-.9L3 21l1.9-4.2A8.3 8.3 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="cta-content">
              <h2>Still need help?</h2>
              <p>
                Our support team is happy to help you with your account,
                bookings, venues, or any other questions.
              </p>
            </div>

            <a
              href="mailto:support@cqabooking.com"
              className="cta-button"
            >
              Contact support
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </section>

        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="support-footer">
        <div className="support-container footer-inner">
          <span>
            © {new Date().getFullYear()} CQA Booking
          </span>

          <div className="footer-links">
            <Link href="/">Home</Link>
            <Link href="/tenant/login">Login</Link>
            <Link href="/tenant/register">Register</Link>
          </div>
        </div>
      </footer>

    </main>
  );
}
