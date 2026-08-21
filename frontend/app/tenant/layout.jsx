'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import TenantHeader from '@/components/TenantHeader';
import Footer from '@/components/Footer';
import TenantSidebar from '@/components/TenantSidebar';

import './tenantGlobal.css';

const STANDALONE_PATHS = ['/tenant/login', '/tenant/register', '/tenant/forgot-password'];

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

  // Since the sidebar/header no longer remount per page (single persistent
  // layout), the browser doesn't naturally reset scroll position between
  // tenant pages the way full page loads used to — force it here.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (STANDALONE_PATHS.some(p => pathname?.startsWith(p))) {
    return <div className="tenant-page">{children}</div>;
  }

  return (
    <div className="tenant-page">
      <div className="tenant-layout">
        <TenantSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="tenant-main-wrapper">
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
