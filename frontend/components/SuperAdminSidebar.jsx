'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  Layers,
  Users,
  Wallet,
  BarChart3,
  Settings,
  History,
  X,
} from 'lucide-react';

const menuSections = [
  {
    title: 'MAIN',
    items: [
      {
        label: 'Dashboard',
        icon: LayoutDashboard,
        path: '/superadmin/dashboard',
      },
      {
        label: 'Organizations',
        icon: Building2,
        path: '/superadmin/organizations',
      },
      {
        label: 'Bookings',
        icon: CalendarCheck,
        path: '/superadmin/bookings',
      },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      {
        label: 'Subscriptions',
        icon: Layers,
        path: '/superadmin/subscriptions',
      },
      {
        label: 'Users',
        icon: Users,
        path: '/superadmin/users',
      },
      {
        label: 'Payments',
        icon: Wallet,
        path: '/superadmin/payments',
      },
      {
        label: 'Reports',
        icon: BarChart3,
        path: '/superadmin/reports',
      },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      {
        label: 'Settings',
        icon: Settings,
        path: '/superadmin/settings',
      },
      {
        label: 'Activity Logs',
        icon: History,
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
          className="fixed inset-0 z-[140] bg-black/55"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-[150] flex w-[260px] flex-col overflow-hidden bg-[var(--sa-sidebar-bg)] text-[var(--sa-sidebar-text)] transition-transform duration-[250ms] ease-in-out max-[1100px]:w-[235px] max-[900px]:w-[220px] max-[768px]:w-[260px] max-[768px]:shadow-[10px_0_30px_rgba(0,0,0,0.20)] max-[360px]:w-[min(260px,88vw)] ${
          open ? 'max-[768px]:translate-x-0' : 'max-[768px]:-translate-x-full'
        }`}
      >
        <div className="flex h-[76px] flex-shrink-0 items-center gap-[11px] border-b border-white/[0.07] px-5 max-[900px]:px-[15px] max-[768px]:h-16">
          <div className="flex h-[39px] w-[39px] flex-shrink-0 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,var(--sa-primary),#764ba2)] text-[14px] font-extrabold text-white shadow-[0_5px_15px_rgba(102,126,234,0.20)]">
            CQ
          </div>

          <div className="flex min-w-0 flex-col leading-[1.05]">
            <strong className="text-[16px] font-extrabold tracking-[0.4px] text-white max-[900px]:text-[14px]">CQA</strong>
            <span className="mt-1 text-[9px] font-semibold tracking-[1.3px] text-[#7f8aa5]">BOOKING</span>
          </div>

          <button
            className="absolute top-5 right-[14px] hidden h-8 w-8 items-center justify-center rounded-[7px] border border-white/[0.12] bg-white/5 p-0 text-white cursor-pointer hover:bg-white/[0.12] max-[768px]:flex"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="hidden" />

        <nav className="flex-1 min-h-0 overflow-x-hidden overflow-y-auto px-[13px] py-5 max-[900px]:px-[10px] [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-[10px] [&::-webkit-scrollbar-thumb]:bg-white/[0.12]">
          {menuSections.map((section) => (
            <div
              className="mb-[23px]"
              key={section.title}
            >
              <div className="mb-2 px-3 text-[9px] font-bold tracking-[1.2px] text-[#6f7b96] uppercase">
                {section.title}
              </div>

              {section.items.map((item) => {
                const active =
                  pathname === item.path ||
                  pathname.startsWith(`${item.path}/`);

                const Icon = item.icon;

                return (
                  <button
                    key={item.path}
                    className={`relative mb-1 flex min-h-[43px] w-full items-center gap-[11px] rounded-[9px] border-0 px-3 text-left text-[13px] font-medium cursor-pointer transition-all duration-200 ease-in-out max-[900px]:px-[10px] ${
                      active
                        ? 'bg-[var(--sa-sidebar-active)] text-[var(--sa-sidebar-text-active)] shadow-[0_5px_15px_rgba(0,0,0,0.16)] hover:translate-x-0'
                        : 'bg-transparent text-[var(--sa-sidebar-text)] hover:translate-x-[2px] hover:bg-[var(--sa-sidebar-hover)] hover:text-white'
                    }`}
                    onClick={() => navigate(item.path)}
                  >
                    <span className="flex h-[21px] w-[21px] flex-shrink-0 items-center justify-center text-current">
                      <Icon size={15} />
                    </span>

                    <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                      {item.label}
                    </span>

                    {active && (
                      <span className="absolute right-0 h-[22px] w-[3px] rounded-tl-[5px] rounded-bl-[5px] bg-[var(--sa-primary)]" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="flex-shrink-0 border-t border-white/[0.07] p-[14px]">
          <div className="flex min-h-[70px] items-center rounded-[10px] border border-white/5 bg-[var(--sa-sidebar-surface)] p-[13px]">
            <div className="flex flex-col">
              <strong className="text-[11px] font-bold text-white">Need Help?</strong>
              <span className="mt-[5px] text-[9px] leading-[1.4] text-[#7f8aa5]">Contact platform support</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 px-[3px] text-[9px] text-[#66718b]">
            <span>CQA Booking</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
