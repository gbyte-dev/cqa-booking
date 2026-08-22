'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  Building2,
  Armchair,
  Users,
  User,
  TrendingUp,
  Settings,
  CreditCard,
  X,
} from 'lucide-react';

const menuSections = [
  {
    title: 'MAIN',
    items: [
      {
        label: 'Dashboard',
        icon: LayoutDashboard,
        path: '/tenant/dashboard',
      },
      {
        label: 'Bookings',
        icon: ClipboardList,
        path: '/tenant/bookings',
      },
      {
        label: 'Venues',
        icon: Building2,
        path: '/tenant/venues',
      },
      {
        label: 'Tables',
        icon: Armchair,
        path: '/tenant/tables',
      },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      {
        label: 'Customers',
        icon: Users,
        path: '/tenant/customers',
      },
      {
        label: 'Staff',
        icon: User,
        path: '/tenant/staff',
      },
      {
        label: 'Reports',
        icon: TrendingUp,
        path: '/tenant/reports',
      },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      {
        label: 'Settings',
        icon: Settings,
        path: '/tenant/settings',
      },
      {
        label: 'Billing',
        icon: CreditCard,
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
          className="fixed inset-0 z-[140] bg-black/55"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-[150] flex w-[260px] max-[1100px]:w-[235px] max-[900px]:w-[220px] max-[768px]:w-[260px] max-[360px]:w-[min(260px,88vw)] flex-col overflow-hidden bg-[var(--tenant-sidebar-bg)] text-[var(--tenant-sidebar-text)] transition-transform duration-200 ease-in-out translate-x-0 ${
          open
            ? 'max-[768px]:translate-x-0 max-[768px]:shadow-[10px_0_30px_rgba(0,0,0,0.20)]'
            : 'max-[768px]:-translate-x-full'
        }`}
      >
        <div className="relative flex h-[76px] max-[768px]:h-16 shrink-0 items-center gap-[11px] border-b border-white/[0.07] px-5 max-[900px]:px-[15px]">
          <div className="flex h-[39px] w-[39px] shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-[var(--tenant-primary)] to-[#764ba2] text-sm font-extrabold text-white">
            CQ
          </div>

          <div className="flex min-w-0 flex-col leading-[1.05]">
            <strong className="text-base max-[900px]:text-sm font-extrabold tracking-[0.4px] text-white">
              CQA
            </strong>
            <span className="mt-1 text-[9px] font-semibold tracking-[1.3px] text-[#7f8aa5]">
              BOOKING
            </span>
          </div>

          <button
            className="absolute right-[14px] top-5 hidden max-[768px]:flex h-8 w-8 items-center justify-center rounded-[7px] border border-white/10 bg-white/5 p-0 text-white cursor-pointer hover:bg-white/10"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-[13px] max-[900px]:px-[10px] py-5 [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-[10px] [&::-webkit-scrollbar-thumb]:bg-white/10">
          {menuSections.map((section) => (
            <div
              className="mb-[23px]"
              key={section.title}
            >
              <div className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[1.2px] text-[#6f7b96]">
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
                    className={`relative mb-1 flex min-h-[43px] w-full items-center gap-[11px] rounded-[9px] border-0 px-3 max-[900px]:px-[10px] text-left text-[13px] font-medium cursor-pointer transition-all duration-200 ${
                      active
                        ? 'bg-[var(--tenant-sidebar-active)] text-[var(--tenant-sidebar-active-text)] shadow-[0_5px_15px_rgba(0,0,0,0.16)]'
                        : 'bg-transparent text-[var(--tenant-sidebar-text)] hover:bg-[var(--tenant-sidebar-hover)] hover:text-white hover:translate-x-[2px]'
                    }`}
                    onClick={() => navigate(item.path)}
                  >
                    <span className="flex w-[21px] shrink-0 items-center justify-center">
                      <Icon size={16} />
                    </span>

                    <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                      {item.label}
                    </span>

                    {active && (
                      <span className="absolute right-0 h-[22px] w-[3px] rounded-l-[5px] bg-[var(--tenant-primary)]" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-white/[0.07] p-[14px]">
          <div className="flex items-center justify-between px-[3px] py-1 text-[9px] text-[#66718b]">
            <span>CQA Booking</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
