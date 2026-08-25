'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import TenantHeader from '@/components/TenantHeader';
import Footer from '@/components/Footer';
import TenantSidebar from '@/components/TenantSidebar';
import { storage } from '@/lib/storage';

const STANDALONE_PATHS = ['/tenant/register', '/tenant/forgot-password'];

const titles = {
  '/tenant/dashboard': 'Dashboard',
  '/tenant/bookings': 'Bookings',
  '/tenant/venues': 'Venues',
  '/tenant/tables': 'Tables',
  '/tenant/customers': 'Customers',
  '/tenant/staff': 'Staff',
  '/tenant/reports': 'Reports',
  '/tenant/settings': 'Settings',
  '/tenant/billing': 'Billing',
  '/tenant/profile': 'My Profile',
};

export default function TenantLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Since the sidebar/header no longer remount per page (single persistent
  // layout), the browser doesn't naturally reset scroll position between
  // tenant pages the way full page loads used to — force it here.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // The backend rejects every request from a session whose account/tenant
  // is no longer valid, but a plain fetch() never surfaces that as a logout
  // on its own. Patch fetch once, for the whole tenant app, so any of these
  // session-invalidation responses forces an immediate sign-out instead of
  // leaving a broken session silently half-working:
  //  - 403 "organization has been suspended" (tenant suspended)
  //  - 403 "User account is inactive or suspended" (user suspended, OR the
  //    user row itself no longer exists — e.g. after a DB truncate/reset)
  //  - 401 "Invalid token" (expired/corrupt JWT, or JWT secret rotated)
  // Deliberately NOT matching on status code alone — 403 is also used for
  // ordinary in-app role checks ("You are not authorized..."), which must
  // show an error, not force a logout.
  useEffect(() => {
    if (window.__suspendGuardInstalled) return;
    window.__suspendGuardInstalled = true;

    const SESSION_INVALID_MESSAGES = [
      'organization has been suspended',
      'User account is inactive or suspended',
      'Invalid token'
    ];

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 403 || response.status === 401) {
        const clone = response.clone();
        clone.json().then((data) => {
          if (SESSION_INVALID_MESSAGES.some((msg) => data?.error?.includes(msg))) {
            storage.clear();
            window.location.href = '/login';
          }
        }).catch(() => {});
      }
      return response;
    };
  }, []);

  if (STANDALONE_PATHS.some(p => pathname?.startsWith(p))) {
    return (
      <div className="min-h-screen bg-[var(--tenant-bg)] text-[var(--tenant-text)] transition-colors duration-200">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--tenant-bg)] text-[var(--tenant-text)] transition-colors duration-200">
      <div className="flex w-full min-h-screen bg-[var(--tenant-bg)]">
        <TenantSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col bg-[var(--tenant-bg)] ml-[260px] max-[1100px]:ml-[235px] max-[900px]:ml-[220px] max-[768px]:ml-0 max-[768px]:w-full transition-[margin-left,background-color] duration-200 ease-in-out">
          <TenantHeader
            title={titles[pathname] || 'Dashboard'}
            onMenuClick={() => setSidebarOpen(true)}
          />

          {children}

          <Footer />
        </div>
      </div>
    </div>
  );
}
