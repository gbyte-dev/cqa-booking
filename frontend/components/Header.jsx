'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { storage } from '@/lib/storage';
import {
  getTheme,
  toggleTheme,
  initializeTheme,
} from '@/lib/theme';

import {
  Menu,
  Sun,
  Moon,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react';

export default function Header({
  title = 'CQA Booking',
  onMenuClick,
}) {
  const router = useRouter();

  const [showProfile, setShowProfile] = useState(false);
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);

  const profileRef = useRef(null);

  useEffect(() => {
    // localStorage is unavailable during SSR.
    // Read user/theme information after hydration.
    setUser(storage.getUser());

    initializeTheme();
    setTheme(getTheme());

    // React immediately to profile/avatar changes.
    const onUserUpdated = (event) => {
      if (event?.detail !== undefined) {
        setUser(event.detail);
      } else {
        setUser(storage.getUser());
      }
    };

    // Profile page update event.
    const onProfileUpdated = () => {
      setUser(storage.getUser());
    };

    window.addEventListener('cqa-user-updated', onUserUpdated);
    window.addEventListener('app-profile-updated', onProfileUpdated);

    return () => {
      window.removeEventListener('cqa-user-updated', onUserUpdated);
      window.removeEventListener('app-profile-updated', onProfileUpdated);
    };
  }, []);

  // Close the profile dropdown when clicking outside.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleThemeToggle = () => {
    const newTheme = toggleTheme();
    setTheme(newTheme);
  };

  const handleLogout = () => {
    setShowProfile(false);
    storage.clear();
    router.push('/login');
  };

  const handleProfileClick = () => {
    setShowProfile(false);
    router.push('/superadmin/profile');
  };

  const handleSettingsClick = () => {
    setShowProfile(false);
    router.push('/superadmin/settings');
  };

  return (
    <header className="sticky top-0 z-[90] flex h-[76px] w-full items-center justify-between border-b border-[var(--sa-border)] bg-[var(--sa-header-bg)] px-[30px] transition-[background,border-color] duration-200 max-[1100px]:px-[22px] max-[768px]:h-16 max-[768px]:px-[15px] max-[600px]:px-3 max-[480px]:h-[60px] max-[480px]:px-[10px]">
      {/* Left Section */}
      <div className="flex min-w-0 items-center gap-[15px] max-[768px]:gap-[10px]">
        <button
          type="button"
          className="hidden h-10 w-10 items-center justify-center rounded-[var(--sa-radius-sm)] border border-[var(--sa-border)] bg-[var(--sa-surface)] p-0 text-[20px] leading-none text-[var(--sa-text)] cursor-pointer transition-all duration-200 hover:border-[var(--sa-primary)] hover:bg-[var(--sa-surface-hover)] hover:text-[var(--sa-primary)] max-[768px]:flex max-[480px]:h-9 max-[480px]:w-9"
          onClick={onMenuClick}
          aria-label="Open menu"
          type="button"
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

      {/* Right Section */}
      <div className="flex flex-shrink-0 items-center gap-[10px] max-[768px]:gap-[6px] max-[480px]:gap-[3px]">
        {/* Theme Toggle */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-[var(--sa-radius-sm)] border border-[var(--sa-border)] bg-[var(--sa-surface)] text-[16px] text-[var(--sa-text)] cursor-pointer transition-all duration-200 hover:border-[var(--sa-primary)] hover:bg-[var(--sa-surface-hover)] hover:text-[var(--sa-primary)] max-[480px]:h-9 max-[480px]:w-9"
          onClick={handleThemeToggle}
          aria-label="Toggle theme"
          title={
            theme === 'dark'
              ? 'Switch to light mode'
              : 'Switch to dark mode'
          }
        >
          {theme === 'dark' ? (
            <Sun size={16} />
          ) : (
            <Moon size={16} />
          )}
        </button>

        {/* Notifications */}
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-[var(--sa-radius-sm)] border border-[var(--sa-border)] bg-[var(--sa-surface)] p-0 text-[17px] text-[var(--sa-text-secondary)] cursor-pointer transition-all duration-200 hover:border-[var(--sa-primary)] hover:bg-[var(--sa-surface-hover)] hover:text-[var(--sa-primary)] max-[768px]:h-[38px] max-[768px]:w-[38px] max-[480px]:h-9 max-[480px]:w-9 max-[360px]:h-[34px] max-[360px]:w-[34px]"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell size={17} />

          <span className="absolute top-[7px] right-[7px] h-[7px] w-[7px] rounded-full border-2 border-[var(--sa-header-bg)] bg-[var(--sa-danger)]" />
        </button>

        {/* Profile Menu */}
        <div
          className="relative"
          ref={profileRef}
        >
          <button
            type="button"
            className="flex min-h-[44px] items-center gap-[9px] rounded-[var(--sa-radius-md)] border border-[var(--sa-border)] bg-[var(--sa-surface)] px-[9px] py-[5px] text-[var(--sa-text)] cursor-pointer transition-all duration-200 hover:border-[var(--sa-primary)] hover:bg-[var(--sa-surface-hover)] max-[768px]:min-h-[38px] max-[768px]:border-none max-[768px]:bg-transparent max-[768px]:p-[2px] max-[768px]:hover:border-transparent max-[768px]:hover:bg-[var(--sa-surface-hover)]"
            onClick={() => setShowProfile((previous) => !previous)}
            aria-expanded={showProfile}
            aria-haspopup="menu"
          >
            {/* Avatar */}
            <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,var(--sa-primary),#764ba2)] text-[13px] font-bold text-white max-[480px]:h-[31px] max-[480px]:w-[31px] max-[360px]:h-[29px] max-[360px]:w-[29px]">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.firstName || 'Profile'}
                  className="h-full w-full object-cover"
                />
              ) : (
                user?.firstName?.charAt(0)?.toUpperCase() || 'A'
              )}
            </div>

            {/* User Information */}
            <div className="flex min-w-[90px] flex-col items-start leading-[1.2] max-[1100px]:min-w-[75px] max-[768px]:hidden">
              <strong className="max-w-[130px] overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-bold text-[var(--sa-text)] max-[1100px]:max-w-[90px]">
                {user?.firstName || 'Super Admin'}
              </strong>

              <span className="mt-[3px] whitespace-nowrap text-[10px] text-[var(--sa-text-muted)]">
                Super Administrator
              </span>
            </div>

            <span className="hidden text-[13px] text-[var(--sa-text-muted)]">
              <ChevronDown size={13} />
            </span>
          </button>

          {/* Dropdown */}
          {showProfile && (
            <div
              className="animate-[sa-dropdown-in_0.15s_ease] absolute top-[calc(100%+9px)] right-0 z-[300] w-[260px] rounded-[var(--sa-radius-md)] border border-[var(--sa-border)] bg-[var(--sa-surface)] p-2 shadow-[var(--sa-shadow-lg)] max-[600px]:right-[-3px] max-[600px]:w-[min(260px,calc(100vw-24px))]"
              role="menu"
            >
              {/* Profile Summary */}
              <div className="flex items-center gap-[10px] p-[10px]">
                <div className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,var(--sa-primary),#764ba2)] text-[15px] font-bold text-white">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user?.firstName || 'Profile'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    user?.firstName?.charAt(0)?.toUpperCase() || 'A'
                  )}
                </div>

                <div className="flex min-w-0 flex-col">
                  <strong className="text-[13px] font-bold text-[var(--sa-text)]">
                    {user?.firstName
                      ? `${user.firstName} ${user.lastName || ''}`.trim()
                      : 'Super Admin'}
                  </strong>

                  <span className="mt-[3px] overflow-hidden text-ellipsis whitespace-nowrap text-[10px] text-[var(--sa-text-muted)]">
                    {user?.email || 'admin@cqabooking.com'}
                  </span>
                </div>
              </div>

              <div className="my-[6px] h-px bg-[var(--sa-border)]" />

              {/* My Profile */}
              <button
                type="button"
                className="flex min-h-10 w-full items-center gap-[10px] rounded-[var(--sa-radius-sm)] border-0 bg-transparent px-[11px] text-left text-[12px] text-[var(--sa-text-secondary)] cursor-pointer transition-all duration-200 hover:bg-[var(--sa-surface-hover)] hover:text-[var(--sa-text)]"
                onClick={handleProfileClick}
                role="menuitem"
              >
                <span className="flex w-5 items-center justify-center">
                  <User size={15} />
                </span>

                My Profile
              </button>

              {/* Settings */}
              <button
                type="button"
                className="flex min-h-10 w-full items-center gap-[10px] rounded-[var(--sa-radius-sm)] border-0 bg-transparent px-[11px] text-left text-[12px] text-[var(--sa-text-secondary)] cursor-pointer transition-all duration-200 hover:bg-[var(--sa-surface-hover)] hover:text-[var(--sa-text)]"
                onClick={handleSettingsClick}
                role="menuitem"
              >
                <span className="flex w-5 items-center justify-center">
                  <Settings size={15} />
                </span>

                Settings
              </button>

              <div className="my-[6px] h-px bg-[var(--sa-border)]" />

              {/* Logout */}
              <button
                type="button"
                className="flex min-h-10 w-full items-center gap-[10px] rounded-[var(--sa-radius-sm)] border-0 bg-transparent px-[11px] text-left text-[12px] text-[var(--sa-danger)] cursor-pointer transition-all duration-200 hover:bg-[var(--sa-danger-bg)] hover:text-[var(--sa-danger)]"
                onClick={handleLogout}
                role="menuitem"
              >
                <span className="flex w-5 items-center justify-center">
                  <LogOut size={15} />
                </span>

                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}