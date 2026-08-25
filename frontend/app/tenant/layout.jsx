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
  '/tenant/profile': 'My Profile',
};

export default function TenantLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const [authState, setAuthState] = useState('checking');

  const isStandalone = STANDALONE_PATHS.some((path) =>
    pathname?.startsWith(path)
  );

  // Route guard.
  // Re-check authentication on every pathname change so protected
  // tenant pages cannot remain accessible after logout or session changes.
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
      router.replace('/login');
      return;
    }

    if (user.isEmailVerified === false) {
      setAuthState('unverified');
      return;
    }

    setAuthState('ok');
  }, [pathname, isStandalone, router]);

  // Reset scroll position whenever the tenant page changes.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Session-invalidation guard.
  // Handles cases where an already logged-in user's account or tenant
  // becomes invalid after the page has already loaded.
  useEffect(() => {
    if (window.__tenantSuspendGuardInstalled) return;

    window.__tenantSuspendGuardInstalled = true;

    const SESSION_INVALID_MESSAGES = [
      'organization has been suspended',
      'User account is inactive or suspended',
      'Invalid token',
    ];

    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const response = await originalFetch(...args);

      if (response.status === 403 || response.status === 401) {
        const clone = response.clone();

        clone
          .json()
          .then((data) => {
            const errorMessage =
              typeof data?.error === 'string' ? data.error : '';

            if (
              SESSION_INVALID_MESSAGES.some((message) =>
                errorMessage.includes(message)
              )
            ) {
              storage.clear();
              window.location.href = '/login';
            }
          })
          .catch(() => {});
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
      window.__tenantSuspendGuardInstalled = false;
    };
  }, []);

  // Standalone tenant pages do not require authentication,
  // sidebar, or header.
  if (isStandalone) {
    return (
      <div className="min-h-screen bg-[var(--tenant-bg)] text-[var(--tenant-text)] transition-colors duration-200">
        {children}
      </div>
    );
  }

  // Wait until authentication has been checked.
  if (authState === 'checking') {
    return <div className="min-h-screen bg-[var(--tenant-bg)]" />;
  }

  // Block the tenant dashboard until email verification is completed.
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