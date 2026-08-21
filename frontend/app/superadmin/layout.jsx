'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SuperAdminSidebar from '@/components/SuperAdminSidebar';

import './superadmin.css';

const titles = {
  '/superadmin/dashboard': 'Super Admin',
  '/superadmin/organizations': 'Organizations',
  '/superadmin/bookings': 'Bookings',
  '/superadmin/subscriptions': 'Subscriptions',
  '/superadmin/users': 'Users',
};

export default function SuperAdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Login page has no authenticated session yet — render it standalone,
  // without the Sidebar/Header/Footer that only make sense post-login.
  if (pathname === '/superadmin/login') {
    return <div className="superadmin-page">{children}</div>;
  }

  return (
    <div className="superadmin-page">
      <div className="dashboard-layout">
        <SuperAdminSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="dashboard-main-wrapper">
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
