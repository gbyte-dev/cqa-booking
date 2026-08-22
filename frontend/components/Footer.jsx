'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex w-full min-h-[62px] flex-col items-start gap-2.5 border-t border-[#e5e7eb] bg-white px-4 py-[15px] text-[10px] text-[#98a2b3] dark:border-[#263044] dark:bg-[#111827] dark:text-[#7d8799] sm:flex-row sm:min-h-0 sm:items-center sm:justify-between sm:gap-[15px] sm:px-[30px] sm:py-[17px] sm:text-[11px]">
      <div>
        © {currentYear} CQA Booking. All rights reserved.
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <Link href="/privacy" className="text-[#667085] transition-colors hover:text-[#667eea] dark:text-[#aeb7c8] dark:hover:text-[#818cf8]">
          Privacy
        </Link>

        <Link href="/terms" className="text-[#667085] transition-colors hover:text-[#667eea] dark:text-[#aeb7c8] dark:hover:text-[#818cf8]">
          Terms
        </Link>

        <Link href="/support" className="text-[#667085] transition-colors hover:text-[#667eea] dark:text-[#aeb7c8] dark:hover:text-[#818cf8]">
          Support
        </Link>
      </div>
    </footer>
  );
}
