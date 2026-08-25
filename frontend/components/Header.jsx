'use client';

import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import {  getTheme,  toggleTheme,  initializeTheme,} from '@/lib/theme';
import { Menu, Sun, Moon, Bell } from 'lucide-react';
import ProfileMenu from '@/components/ProfileMenu';

export default function Header({
  title = 'CQA Booking',
  onMenuClick,
}) {
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // localStorage is unavailable during SSR. Reading it after hydration keeps
    // the initial server and client markup identical.
    setUser(storage.getUser());
    initializeTheme();
    setTheme(getTheme());

    // React immediately to avatar/profile changes or logout, without a reload.
    const onUserUpdated = (e) => setUser(e.detail ?? null);
    window.addEventListener('cqa-user-updated', onUserUpdated);
    return () => window.removeEventListener('cqa-user-updated', onUserUpdated);
  }, []);

  const handleThemeToggle = () => {
    const newTheme = toggleTheme();
    setTheme(newTheme);
  };
  return (
    <header className="sticky top-0 z-[90] flex h-[76px] w-full items-center justify-between border-b border-[var(--sa-border)] bg-[var(--sa-header-bg)] px-[30px] transition-[background,border-color] duration-200 max-[1100px]:px-[22px] max-[768px]:h-16 max-[768px]:px-[15px] max-[600px]:px-3 max-[480px]:h-[60px] max-[480px]:px-[10px]">
      <div className="flex min-w-0 items-center gap-[15px] max-[768px]:gap-[10px]">
        <button
          className="hidden h-10 w-10 items-center justify-center rounded-[var(--sa-radius-sm)] border border-[var(--sa-border)] bg-[var(--sa-surface)] p-0 text-[20px] leading-none text-[var(--sa-text)] cursor-pointer transition-all duration-200 hover:border-[var(--sa-primary)] hover:bg-[var(--sa-surface-hover)] hover:text-[var(--sa-primary)] max-[768px]:flex max-[480px]:h-9 max-[480px]:w-9"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="flex min-w-0 items-center gap-3 max-[768px]:gap-[9px]">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,var(--sa-primary),#764ba2)] text-[13px] font-extrabold text-white shadow-[0_5px_15px_rgba(102,126,234,0.25)] max-[900px]:h-9 max-[900px]:w-9 max-[768px]:h-9 max-[768px]:w-9 max-[768px]:rounded-[9px] max-[768px]:text-[11px] max-[600px]:hidden">
            CQ
          </div>

          <div className="flex min-w-0 flex-col leading-[1.2]">
            <h1 className="m-0 overflow-hidden text-ellipsis whitespace-nowrap text-[17px] font-bold text-[var(--sa-text)] max-[768px]:max-w-[190px] max-[768px]:text-[15px] max-[600px]:max-w-[145px] max-[480px]:max-w-[120px] max-[480px]:text-[14px] max-[360px]:max-w-[100px]">
              {title}
            </h1>
            <span className="mt-[3px] whitespace-nowrap text-[11px] text-[var(--sa-text-secondary)] max-[768px]:text-[9px] max-[600px]:hidden">
              Management Console
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-[10px] max-[768px]:gap-[6px] max-[480px]:gap-[3px]">
        <button
          className="flex h-10 w-10 items-center justify-center rounded-[var(--sa-radius-sm)] border border-[var(--sa-border)] bg-[var(--sa-surface)] text-[16px] text-[var(--sa-text)] cursor-pointer transition-all duration-200 hover:border-[var(--sa-primary)] hover:bg-[var(--sa-surface-hover)] hover:text-[var(--sa-primary)] max-[480px]:h-9 max-[480px]:w-9"
          onClick={handleThemeToggle}
          aria-label="Toggle theme"
          title={
            theme === 'dark'
              ? 'Switch to light mode'
              : 'Switch to dark mode'
          }
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button className="relative flex h-10 w-10 items-center justify-center rounded-[var(--sa-radius-sm)] border border-[var(--sa-border)] bg-[var(--sa-surface)] p-0 text-[17px] text-[var(--sa-text-secondary)] cursor-pointer transition-all duration-200 hover:border-[var(--sa-primary)] hover:bg-[var(--sa-surface-hover)] hover:text-[var(--sa-primary)] max-[768px]:h-[38px] max-[768px]:w-[38px] max-[480px]:h-9 max-[480px]:w-9 max-[360px]:h-[34px] max-[360px]:w-[34px]" title="Notifications">
          <Bell size={17} />
          <span className="absolute top-[7px] right-[7px] h-[7px] w-[7px] rounded-full border-2 border-[var(--sa-header-bg)] bg-[var(--sa-danger)]" />
        </button>

        <ProfileMenu user={user} size={34} />
      </div>
    </header>
  );
}
