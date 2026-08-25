'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SuperAdminSidebar from '@/components/SuperAdminSidebar';
import { storage } from '@/lib/storage';

const titles = {
  '/superadmin/dashboard': 'Super Admin',
  '/superadmin/organizations': 'Organizations',
  '/superadmin/bookings': 'Bookings',
  '/superadmin/subscriptions': 'Subscriptions',
  '/superadmin/users': 'Users',
  '/superadmin/payments': 'Payments',
  '/superadmin/reports': 'Reports',
  '/superadmin/settings': 'Settings',
  '/superadmin/activity-logs': 'Activity Logs',
  '/superadmin/profile': 'My Profile',
};

export default function SuperAdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Same session-invalidation guard as the tenant layout — forces an
  // immediate sign-out if this account is suspended or no longer exists
  // (e.g. after a DB truncate/reset), instead of leaving a broken session
  // silently half-working until the admin happens to notice.
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

  return (
    <div className="min-h-screen bg-[var(--sa-bg)] text-[var(--sa-text)]">
      <div className="dashboard-layout flex w-full min-h-screen">
        <SuperAdminSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="dashboard-main-wrapper flex flex-1 min-w-0 min-h-screen flex-col bg-[var(--sa-bg)] ml-[260px] transition-[margin-left,background] duration-200 ease-in-out max-[1100px]:ml-[235px] max-[900px]:ml-[220px] max-[768px]:ml-0 max-[768px]:w-full">
          <Header
            title={titles[pathname] || 'Super Admin'}
            onMenuClick={() => setSidebarOpen(true)}
          />

          {children}

          <Footer />
        </div>
      </div>
    </div>
  );
}
