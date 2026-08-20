'use client';

import { usePathname, useRouter } from 'next/navigation';

const menuSections = [
  {
    title: 'MAIN',
    items: [
      {
        label: 'Dashboard',
        icon: '▦',
        path: '/superadmin/dashboard',
      },
      {
        label: 'Organizations',
        icon: '▥',
        path: '/superadmin/organizations',
      },
      {
        label: 'Bookings',
        icon: '▣',
        path: '/superadmin/bookings',
      },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      {
        label: 'Subscriptions',
        icon: '◈',
        path: '/superadmin/subscriptions',
      },
      {
        label: 'Users',
        icon: '♙',
        path: '/superadmin/users',
      },
      {
        label: 'Payments',
        icon: '◇',
        path: '/superadmin/payments',
      },
      {
        label: 'Reports',
        icon: '◫',
        path: '/superadmin/reports',
      },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      {
        label: 'Settings',
        icon: '⚙',
        path: '/superadmin/settings',
      },
      {
        label: 'Activity Logs',
        icon: '◴',
        path: '/superadmin/activity-logs',
      },
    ],
  },
];

export default function SuperAdminSidebar({
  open = true,
  onClose,
}) {
  const router = useRouter();
  const pathname = usePathname();

  const navigate = (path) => {
    router.push(path);

    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {open && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside className={`admin-sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">
            CQ
          </div>

          <div className="brand-content">
            <strong>CQA</strong>
            <span>BOOKING</span>
          </div>

          <button
            className="sidebar-close-btn"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="sidebar-divider" />

        <nav className="sidebar-nav">
          {menuSections.map((section) => (
            <div
              className="sidebar-section"
              key={section.title}
            >
              <div className="sidebar-section-title">
                {section.title}
              </div>

              {section.items.map((item) => {
                const active =
                  pathname === item.path ||
                  pathname.startsWith(`${item.path}/`);

                return (
                  <button
                    key={item.path}
                    className={`sidebar-item ${
                      active ? 'active' : ''
                    }`}
                    onClick={() => navigate(item.path)}
                  >
                    <span className="sidebar-icon">
                      {item.icon}
                    </span>

                    <span className="sidebar-label">
                      {item.label}
                    </span>

                    {active && (
                      <span className="active-indicator" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help-card">

            <div>
              <strong>Need Help?</strong>
              <span>Contact platform support</span>
            </div>
          </div>

          <div className="sidebar-version">
            <span>CQA Booking</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}