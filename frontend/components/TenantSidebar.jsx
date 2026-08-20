'use client';

import { usePathname, useRouter } from 'next/navigation';

const menuSections = [
  {
    title: 'MAIN',
    items: [
      {
        label: 'Dashboard',
        icon: '📊',
        path: '/tenant/dashboard',
      },
      {
        label: 'Bookings',
        icon: '📋',
        path: '/tenant/bookings',
      },
      {
        label: 'Venues',
        icon: '🏢',
        path: '/tenant/venues',
      },
      {
        label: 'Tables',
        icon: '🪑',
        path: '/tenant/tables',
      },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      {
        label: 'Customers',
        icon: '👥',
        path: '/tenant/customers',
      },
      {
        label: 'Staff',
        icon: '👤',
        path: '/tenant/staff',
      },
      {
        label: 'Reports',
        icon: '📈',
        path: '/tenant/reports',
      },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      {
        label: 'Settings',
        icon: '⚙️',
        path: '/tenant/settings',
      },
      {
        label: 'Billing',
        icon: '💳',
        path: '/tenant/billing',
      },
    ],
  },
];

export default function TenantSidebar({
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

      <aside className={`tenant-sidebar ${open ? 'sidebar-open' : ''}`}>
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
          <div className="sidebar-version">
            <span>CQA Booking</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}