'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import TenantHeader from '@/components/TenantHeader';
import Footer from '@/components/Footer';
import TenantSidebar from '@/components/TenantSidebar';
import VerifyEmailScreen from '@/components/VerifyEmailScreen';
import { storage } from '@/lib/storage';
import { buildLoginUrl } from '@/lib/redirect';

const TENANT_ROLES = ['owner', 'manager', 'staff'];

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
};

export default function TenantLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [authState, setAuthState] = useState('checking'); // checking | ok | unverified

  const isStandalone = STANDALONE_PATHS.some(p => pathname?.startsWith(p));

  // Route guard: re-checked on every mount (including back/forward navigation,
  // since these are client components that re-run their effects) so logging
  // out and hitting Back can't leave a protected tenant page visible.
  useEffect(() => {
    if (isStandalone) {
      setAuthState('ok');
      return;
    }

    const token = storage.getToken();
    const user = storage.getUser();

    if (!token || !user) {
      router.replace(buildLoginUrl(pathname));
      return;
    }

    if (!TENANT_ROLES.includes(user.role)) {
      // Wrong role for this area (e.g. a customer or super_admin token) — not
      // a redirect-preserving case, just bounce to the login gate.
      router.replace('/login');
      return;
    }

    if (user.isEmailVerified === false) {
      setAuthState('unverified');
      return;
    }

    setAuthState('ok');
  }, [pathname, isStandalone, router]);

  // Since the sidebar/header no longer remount per page (single persistent
  // layout), the browser doesn't naturally reset scroll position between
  // tenant pages the way full page loads used to — force it here.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (isStandalone) {
    return (
      <div className="min-h-screen bg-[var(--tenant-bg)] text-[var(--tenant-text)] transition-colors duration-200">
        {children}
      </div>
    );
  }

  if (authState === 'checking') {
    return <div className="min-h-screen bg-[var(--tenant-bg)]" />;
  }

  if (authState === 'unverified') {
    const user = storage.getUser();
    return <VerifyEmailScreen email={user?.email || ''} />;
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
