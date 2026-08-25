'use client';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import Link from 'next/link';
import {
  usePathname,
  useRouter,
} from 'next/navigation';

import {
  User,
  Settings,
  CreditCard,
  LogOut,
  ChevronDown,
} from 'lucide-react';

import { storage } from '@/lib/storage';
import UserAvatar from '@/components/UserAvatar';

function getMenuItems(user) {
  const role = user?.role;

  switch (role) {
    case 'customer':
      return [
        {
          label: 'My Profile',
          href: '/account/profile',
          icon: User,
        },
      ];

    case 'superadmin':
    case 'super_admin':
      return [
        {
          label: 'My Profile',
          href: '/superadmin/profile',
          icon: User,
        },
        {
          label: 'Settings',
          href: '/superadmin/settings',
          icon: Settings,
        },
      ];

    case 'owner':
      return [
        {
          label: 'Settings',
          href: '/tenant/settings',
          icon: Settings,
        },
        {
          label: 'Billing',
          href: '/tenant/billing',
          icon: CreditCard,
        },
      ];

    case 'manager':
    case 'staff':
      return [
        {
          label: 'Settings',
          href: '/tenant/settings',
          icon: Settings,
        },
      ];

    default:
      return [];
  }
}

export default function ProfileMenu({
  user,
  size = 34,
  align = 'right',
  dark = false,
}) {
  const [open, setOpen] = useState(false);

  const rootRef = useRef(null);
  const triggerRef = useRef(null);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;

    const onClickOutside = (event) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleLogout = () => {
    storage.clear();
    setOpen(false);
    router.push('/login');
  };

  const items = getMenuItems(user);

  const textMain = dark
    ? 'text-white'
    : 'text-[var(--sa-text,#101828)]';

  const textMuted = dark
    ? 'text-[#98a2b3]'
    : 'text-[var(--sa-text-muted,#667085)]';

  const panelBg = dark
    ? 'border-white/10 bg-[#111827]'
    : 'border-[var(--sa-border,#e5e7eb)] bg-[var(--sa-surface,#fff)]';

  const itemHover = dark
    ? 'hover:bg-white/[0.06]'
    : 'hover:bg-[var(--sa-surface-hover,#f3f4f6)]';

  return (
    <div
      ref={rootRef}
      className="relative"
    >
      <button
        ref={triggerRef}
        type="button"
        className={`flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors ${itemHover}`}
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open account menu"
      >
        <UserAvatar
          user={user}
          size={size}
        />

        <ChevronDown
          size={14}
          className={`${textMuted} transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute top-[calc(100%+8px)] ${
            align === 'right'
              ? 'right-0'
              : 'left-0'
          } z-[300] w-[min(250px,calc(100vw-24px))] overflow-hidden rounded-2xl border ${panelBg} p-1.5 shadow-[0_20px_55px_rgba(0,0,0,0.28)]`}
        >
          <div className="flex items-center gap-2.5 px-2.5 py-2.5">
            <UserAvatar
              user={user}
              size={38}
            />

            <div className="min-w-0">
              <strong
                className={`block truncate text-[13px] font-bold ${textMain}`}
              >
                {user?.fullName ||
                  user?.firstName ||
                  'Account'}
              </strong>

              <span
                className={`block truncate text-[11px] ${textMuted}`}
              >
                {user?.email}
              </span>
            </div>
          </div>

          {items.length > 0 && (
            <div
              className={`my-1 h-px ${
                dark
                  ? 'bg-white/10'
                  : 'bg-[var(--sa-border,#e5e7eb)]'
              }`}
            />
          )}

          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              className={`flex min-h-10 items-center gap-2.5 rounded-xl px-2.5 text-[12.5px] font-medium ${textMain} ${itemHover}`}
              onClick={() => setOpen(false)}
            >
              <item.icon
                size={15}
                className={textMuted}
              />

              {item.label}
            </Link>
          ))}

          <div
            className={`my-1 h-px ${
              dark
                ? 'bg-white/10'
                : 'bg-[var(--sa-border,#e5e7eb)]'
            }`}
          />

          <button
            type="button"
            role="menuitem"
            className="flex min-h-10 w-full items-center gap-2.5 rounded-xl px-2.5 text-left text-[12.5px] font-medium text-[#ef4444] transition-colors hover:bg-[#ef4444]/10"
            onClick={handleLogout}
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}