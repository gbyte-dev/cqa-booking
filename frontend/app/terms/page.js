'use client';

import Link from 'next/link';
import './terms.css';

export default function TermsPage() {
  return (
    <main className="legal-page">

      {/* =====================================================
          NAVIGATION
      ===================================================== */}
      <nav className="legal-nav">
        <div className="legal-nav-inner">
          <Link href="/" className="legal-logo">
            <span className="logo-mark">C</span>

            <span className="logo-text">
              CQA<span>BOOKING</span>
            </span>
          </Link>

          <Link href="/support" className="back-support">
            Support Center

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
      <section className="legal-hero">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />

        <div className="legal-container hero-content">

          <div className="legal-badge">
            <span className="badge-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M8 8h8M8 12h8M8 16h5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </span>

            TERMS OF SERVICE
          </div>

          <h1>
            Terms that keep
            <span> CQA Booking clear.</span>
          </h1>

          <p className="hero-description">
            Please review these terms carefully before creating an account
            or using the CQA Booking platform.
          </p>

          <div className="last-updated">
            <span className="update-dot" />
            Last updated: August 2026
          </div>

        </div>
      </section>

      {/* =====================================================
          CONTENT
      ===================================================== */}
      <section className="legal-content">
        <div className="legal-container">

          <div className="legal-layout">

            {/* =================================================
                SIDEBAR
            ================================================= */}
            <aside className="legal-sidebar">

              <div className="sidebar-title">
                On this page
              </div>

              <a href="#acceptance">
                <span>01</span>
                Acceptance of terms
              </a>

              <a href="#accounts">
                <span>02</span>
                Accounts
              </a>

              <a href="#subscriptions">
                <span>03</span>
                Subscriptions & plans
              </a>

              <a href="#acceptable-use">
                <span>04</span>
                Acceptable use
              </a>

              <a href="#termination">
                <span>05</span>
                Termination
              </a>

              <a href="#liability">
                <span>06</span>
                Limitation of liability
              </a>

              <a href="#contact">
                <span>07</span>
                Contact
              </a>

            </aside>

            {/* =================================================
                DOCUMENT
            ================================================= */}
            <article className="legal-document">

              {/* 01 */}
              <section className="legal-section" id="acceptance">
                <div className="section-number">01</div>

                <div>
                  <h2>Acceptance of terms</h2>

                  <p>
                    By creating an account or using CQA Booking, you agree
                    to these Terms of Service and any applicable policies
                    referenced by the platform.
                  </p>

                  <p>
                    If you do not agree with these terms, please do not
                    create an account or use the CQA Booking platform.
                  </p>
                </div>
              </section>

              {/* 02 */}
              <section className="legal-section" id="accounts">
                <div className="section-number">02</div>

                <div>
                  <h2>Accounts</h2>

                  <p>
                    You are responsible for maintaining the confidentiality
                    of your account credentials and for activity performed
                    through your account.
                  </p>

                  <p>
                    You must provide accurate and current information when
                    registering and keep your account information up to date.
                  </p>

                  <div className="terms-note">
                    <div className="note-icon">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6l-7-3Z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinejoin="round"
                        />

                        <path
                          d="M9 12h6"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>

                    <div>
                      <strong>Keep your account secure.</strong>

                      <span>
                        Do not share your login credentials or allow
                        unauthorized users to access your account.
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 03 */}
              <section className="legal-section" id="subscriptions">
                <div className="section-number">03</div>

                <div>
                  <h2>Subscriptions & plans</h2>

                  <p>
                    Paid plans renew automatically unless cancelled before
                    the applicable renewal date. Fees are charged in advance
                    according to the selected plan.
                  </p>

                  <p>
                    Subscription fees are generally non-refundable except
                    where a refund is required by applicable law or expressly
                    provided by the applicable plan terms.
                  </p>

                  <p>
                    We may modify plan features or pricing from time to time.
                    Where appropriate, we will provide reasonable notice
                    before material changes take effect.
                  </p>

                  <div className="plan-grid">

                    <div className="plan-item">
                      <div className="plan-icon">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                          <circle
                            cx="12"
                            cy="12"
                            r="9"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          />

                          <path
                            d="M12 7v10M9 10h4a2 2 0 0 1 0 4H9"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>

                      <div>
                        <strong>Automatic renewal</strong>
                        <span>Plans renew unless cancelled</span>
                      </div>
                    </div>

                    <div className="plan-item">
                      <div className="plan-icon">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M4 7h16M4 12h16M4 17h10"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>

                      <div>
                        <strong>Plan changes</strong>
                        <span>Features may change over time</span>
                      </div>
                    </div>

                  </div>
                </div>
              </section>

              {/* 04 */}
              <section className="legal-section" id="acceptable-use">
                <div className="section-number">04</div>

                <div>
                  <h2>Acceptable use</h2>

                  <p>
                    You agree to use CQA Booking responsibly and only for
                    lawful purposes.
                  </p>

                  <div className="use-list">

                    <div className="use-item">
                      <span className="check-icon">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                          <path
                            d="m5 12 4 4L19 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>

                      <span>Use the platform for legitimate business activities.</span>
                    </div>

                    <div className="use-item">
                      <span className="check-icon">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                          <path
                            d="m5 12 4 4L19 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>

                      <span>Protect your account and authorized access.</span>
                    </div>

                    <div className="use-item">
                      <span className="blocked-icon">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                          <path
                            d="m6 6 12 12M18 6 6 18"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>

                      <span>Do not attempt to access other users' accounts.</span>
                    </div>

                    <div className="use-item">
                      <span className="blocked-icon">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                          <path
                            d="m6 6 12 12M18 6 6 18"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>

                      <span>Do not interfere with or disrupt the service.</span>
                    </div>

                    <div className="use-item">
                      <span className="blocked-icon">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                          <path
                            d="m6 6 12 12M18 6 6 18"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>

                      <span>Do not use the platform for unlawful purposes.</span>
                    </div>

                  </div>
                </div>
              </section>

              {/* 05 */}
              <section className="legal-section" id="termination">
                <div className="section-number">05</div>

                <div>
                  <h2>Termination</h2>

                  <p>
                    We may suspend or terminate access to CQA Booking when
                    necessary to protect the platform, its users, or our
                    services.
                  </p>

                  <p>
                    This may include violations of these terms, non-payment,
                    unauthorized activity, or conduct that may harm the
                    service or other users.
                  </p>

                  <div className="warning-note">
                    <div className="warning-icon">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 3 2.8 20h18.4L12 3Z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinejoin="round"
                        />

                        <path
                          d="M12 9v4M12 16v.5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>

                    <div>
                      <strong>Account access may be restricted.</strong>

                      <span>
                        We may take action when continued access could
                        negatively affect the platform or other users.
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 06 */}
              <section className="legal-section" id="liability">
                <div className="section-number">06</div>

                <div>
                  <h2>Limitation of liability</h2>

                  <p>
                    CQA Booking is provided on an "as is" and "as available"
                    basis, to the extent permitted by applicable law.
                  </p>

                  <p>
                    To the maximum extent permitted by law, CQA Booking is
                    not liable for indirect, incidental, special, or
                    consequential damages arising from the use of or
                    inability to use the service.
                  </p>

                  <div className="liability-note">
                    <span>IMPORTANT</span>

                    <p>
                      Nothing in these terms is intended to exclude or limit
                      liability where such exclusion or limitation is not
                      permitted by applicable law.
                    </p>
                  </div>
                </div>
              </section>

              {/* 07 */}
              <section className="legal-section last-section" id="contact">
                <div className="section-number">07</div>

                <div>
                  <h2>Contact us</h2>

                  <p>
                    If you have questions about these Terms of Service or
                    need clarification about your account, subscriptions,
                    or use of the platform, please contact our support team.
                  </p>

                  <a
                    href="mailto:support@cqabooking.com"
                    className="contact-email"
                  >
                    support@cqabooking.com

                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 12h14M13 6l6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                </div>
              </section>

            </article>
          </div>

          {/* =====================================================
              CTA
          ===================================================== */}
          <section className="legal-cta">

            <div className="cta-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.3 9.3 0 0 1-4-.9L3 21l1.9-4.2A8.3 8.3 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="cta-content">
              <h3>Have questions about these terms?</h3>

              <p>
                Our support team can help clarify questions about your
                account, subscription, or use of CQA Booking.
              </p>
            </div>

            <Link href="/support" className="cta-button">
              Visit Support Center

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

          </section>

        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="legal-footer">
        <div className="legal-container footer-inner">

          <span>
            © {new Date().getFullYear()} CQA Booking
          </span>

          <div className="footer-links">
            <Link href="/">Home</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/support">Support</Link>
            <Link href="/tenant/login">Login</Link>
            <Link href="/tenant/register">Register</Link>
          </div>

        </div>
      </footer>

    </main>
  );
}