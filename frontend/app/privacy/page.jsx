'use client';

import Link from 'next/link';
import './privacy.css';

export default function PrivacyPage() {
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
                  d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6l-7-3Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            </span>

            PRIVACY POLICY
          </div>

          <h1>
            Your privacy
            <span> matters to us.</span>
          </h1>

          <p className="hero-description">
            We believe your information should be handled responsibly,
            transparently, and securely.
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

            {/* SIDEBAR */}
            <aside className="legal-sidebar">
              <div className="sidebar-title">
                On this page
              </div>

              <a href="#information">
                <span>01</span>
                Information we collect
              </a>

              <a href="#usage">
                <span>02</span>
                How we use information
              </a>

              <a href="#sharing">
                <span>03</span>
                Data sharing
              </a>

              <a href="#security">
                <span>04</span>
                Data security
              </a>

              <a href="#rights">
                <span>05</span>
                Your rights
              </a>

              <a href="#contact">
                <span>06</span>
                Contact
              </a>
            </aside>

            {/* POLICY */}
            <article className="legal-document">

              {/* 01 */}
              <section className="legal-section" id="information">
                <div className="section-number">01</div>

                <div>
                  <h2>Information we collect</h2>

                  <p>
                    When you use CQA Booking, we collect information you
                    provide directly, such as your name, email address,
                    phone number, organization details, and booking
                    information.
                  </p>

                  <p>
                    We may also collect usage and technical information
                    about how you interact with our platform to help us
                    maintain, secure, and improve our services.
                  </p>
                </div>
              </section>

              {/* 02 */}
              <section className="legal-section" id="usage">
                <div className="section-number">02</div>

                <div>
                  <h2>How we use your information</h2>

                  <p>
                    We use your information to provide and maintain the
                    booking platform, process reservations, manage your
                    account, and deliver the services you request.
                  </p>

                  <p>
                    Your information may also be used to send important
                    service notifications, improve our product, prevent
                    misuse, and maintain the reliability of the platform.
                  </p>

                  <div className="privacy-note">
                    <div className="note-icon">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6l-7-3Z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinejoin="round"
                        />
                        <path
                          d="m9 12 2 2 4-4"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    <div>
                      <strong>We don't sell your personal data.</strong>
                      <span>
                        Your information is used to operate and improve
                        CQA Booking.
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 03 */}
              <section className="legal-section" id="sharing">
                <div className="section-number">03</div>

                <div>
                  <h2>Data sharing</h2>

                  <p>
                    Your data is shared only with parties necessary to
                    operate the platform, such as hosting and infrastructure
                    providers, and only to the extent required to provide
                    the service.
                  </p>

                  <p>
                    Organizations using CQA Booking may access booking
                    information belonging to their own venues and
                    authorized users.
                  </p>
                </div>
              </section>

              {/* 04 */}
              <section className="legal-section" id="security">
                <div className="section-number">04</div>

                <div>
                  <h2>Data security</h2>

                  <p>
                    We use industry-standard security practices designed
                    to protect your information against unauthorized
                    access, alteration, disclosure, or destruction.
                  </p>

                  <p>
                    Administrative functions are protected through
                    authentication and role-based permissions, helping
                    ensure that users can access only the information
                    appropriate to their role.
                  </p>

                  <div className="security-grid">

                    <div className="security-item">
                      <div className="security-icon">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                          <rect
                            x="5"
                            y="10"
                            width="14"
                            height="10"
                            rx="2"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          />
                          <path
                            d="M8 10V7a4 4 0 0 1 8 0v3"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>

                      <div>
                        <strong>Protected access</strong>
                        <span>Role-based permissions</span>
                      </div>
                    </div>

                    <div className="security-item">
                      <div className="security-icon">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6l-7-3Z"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>

                      <div>
                        <strong>Secure systems</strong>
                        <span>Industry-standard practices</span>
                      </div>
                    </div>

                  </div>
                </div>
              </section>

              {/* 05 */}
              <section className="legal-section" id="rights">
                <div className="section-number">05</div>

                <div>
                  <h2>Your rights</h2>

                  <p>
                    You may request access to, correction of, or deletion
                    of your personal information by contacting our support
                    team.
                  </p>

                  <p>
                    Depending on your account and applicable requirements,
                    you may also request to export your information or
                    close your account.
                  </p>
                </div>
              </section>

              {/* 06 */}
              <section className="legal-section last-section" id="contact">
                <div className="section-number">06</div>

                <div>
                  <h2>Contact us</h2>

                  <p>
                    If you have questions, concerns, or requests regarding
                    this Privacy Policy or the way we handle your
                    information, please contact our support team.
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
              BOTTOM CTA
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
              <h3>Have questions about your privacy?</h3>

              <p>
                Our support team is available to help with privacy-related
                questions and requests.
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
            <Link href="/support">Support</Link>
            <Link href="/tenant/login">Login</Link>
            <Link href="/tenant/register">Register</Link>
          </div>

        </div>
      </footer>

    </main>
  );
}
