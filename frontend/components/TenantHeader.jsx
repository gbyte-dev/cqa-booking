'use client';

import { useEffect, useState } from 'react';
import {
  Menu,
  Building2,
  Search,
  Sun,
  Moon,
  Bell,
} from 'lucide-react';
import { storage } from '@/lib/storage';
import ProfileMenu from '@/components/ProfileMenu';

export default function TenantHeader({
  title = 'Tenant Dashboard',
  onMenuClick,
}) {
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [mounted, setMounted] = useState(false);

  // ONLY: Set user/organization/theme after mount
  useEffect(() => {
    setUser(storage.getUser());
    setOrganization(storage.getOrganization?.());

    const savedTheme = localStorage.getItem('tenant-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      setTheme('light');
      document.documentElement.setAttribute('data-theme', 'light');
    }

    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('tenant-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const iconBtnClasses =
    'flex w-10 h-10 max-[768px]:w-[38px] max-[768px]:h-[38px] max-[480px]:w-9 max-[480px]:h-9 max-[360px]:w-[34px] max-[360px]:h-[34px] shrink-0 items-center justify-center rounded-[var(--tenant-radius-sm)] border border-[var(--tenant-border)] bg-[var(--tenant-surface)] p-0 text-[var(--tenant-text)] cursor-pointer transition-all duration-200 hover:bg-[var(--tenant-surface-hover)] hover:border-[var(--tenant-primary)] hover:text-[var(--tenant-primary)]';

  return (
    <header className="sticky top-0 z-[90] flex h-[76px] max-[768px]:h-16 max-[480px]:h-[60px] w-full items-center justify-between gap-5 max-[768px]:gap-[10px] border-b border-[var(--tenant-border)] bg-[var(--tenant-header-bg)] px-[30px] max-[1100px]:px-[22px] max-[768px]:px-[15px] max-[600px]:px-3 max-[480px]:px-[10px] transition-colors duration-200">
      <div className="flex min-w-0 items-center gap-[15px] max-[768px]:gap-[10px]">
        <button
          className={`hidden max-[768px]:flex ${iconBtnClasses}`}
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="flex min-w-0 items-center gap-3 max-[768px]:gap-[9px]">
          <div className="flex h-10 w-10 max-[768px]:h-9 max-[768px]:w-9 max-[600px]:hidden shrink-0 items-center justify-center rounded-[10px] max-[768px]:rounded-[9px] bg-gradient-to-br from-[var(--tenant-primary)] to-[#764ba2] text-white shadow-[0_5px_15px_rgba(102,126,234,0.25)]">
            <Building2 size={18} />
          </div>

          <div className="flex min-w-0 flex-col leading-[1.2]">
            <h1 className="m-0 max-w-[190px] max-[600px]:max-w-[145px] max-[480px]:max-w-[120px] max-[360px]:max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap text-[17px] max-[768px]:text-[15px] max-[480px]:text-[14px] font-bold text-[var(--tenant-text)]">
              {title}
            </h1>
            <span className="mt-1 max-[600px]:hidden overflow-hidden text-ellipsis whitespace-nowrap text-[11px] max-[768px]:text-[9px] text-[var(--tenant-text-secondary)]">
              {mounted ? (organization?.name || 'Organization') : 'Organization'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-[10px] max-[768px]:gap-[6px] max-[480px]:gap-[3px]">
        <div className="relative flex h-10 w-[270px] max-[1100px]:w-[220px] max-[900px]:w-[190px] max-[768px]:hidden items-center">
          <input
            type="text"
            placeholder="Search bookings, customers..."
            className="h-10 w-full rounded-[var(--tenant-radius-sm)] border border-[var(--tenant-border)] bg-[var(--tenant-surface)] pl-[13px] pr-[38px] text-xs text-[var(--tenant-text)] outline-none transition-all duration-200 placeholder:text-[var(--tenant-text-muted)] focus:border-[var(--tenant-primary)] focus:shadow-[0_0_0_3px_var(--tenant-primary-light)]"
          />
          <span className="pointer-events-none absolute right-3 flex items-center text-[var(--tenant-text-muted)]">
            <Search size={14} />
          </span>
        </div>

        <button
          type="button"
          className={`${iconBtnClasses} hover:-translate-y-px active:scale-95`}
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        <button
          className={`${iconBtnClasses} relative text-[var(--tenant-text-secondary)]`}
          title="Notifications"
        >
          <Bell size={17} />
          <span className="absolute right-[7px] top-[7px] h-[7px] w-[7px] rounded-full border-2 border-[var(--tenant-header-bg)] bg-[var(--tenant-danger)]" />
        </button>

        <ProfileMenu user={user} size={34} />
      </div>
    </header>
  );
}
