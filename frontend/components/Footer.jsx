'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="admin-footer">
      <div>
        © {currentYear} CQA Booking. All rights reserved.
      </div>

      <div className="admin-footer-links">
        <Link href="/privacy">
          Privacy
        </Link>

        <Link href="/terms">
          Terms
        </Link>

        <Link href="/support">
          Support
        </Link>
      </div>
    </footer>
  );
}