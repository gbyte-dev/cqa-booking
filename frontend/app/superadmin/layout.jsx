'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SuperAdminSidebar from '@/components/SuperAdminSidebar';
import { storage } from '@/lib/storage';
import { buildLoginUrl } from '@/lib/redirect';

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
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  // Route guard, re-run on every mount (including via browser Back after
  // logout) so a stale page can never remain visible without a valid session.
  useEffect(() => {
    const token = storage.getToken();
    const user = storage.getUser();

    if (!token || !user) {
      router.replace(buildLoginUrl(pathname));
      return;
    }
    if (user.role !== 'superadmin') {
      router.replace('/login');
      return;
    }
    setAuthChecked(true);
  }, [pathname, router]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (!authChecked) {
    return <div className="min-h-screen bg-[var(--sa-bg)]" />;
  }

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
