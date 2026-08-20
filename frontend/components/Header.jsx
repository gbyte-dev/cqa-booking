'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import {  getTheme,  toggleTheme,  initializeTheme,} from '@/lib/theme';

export default function Header({
  title = 'CQA Booking',
  onMenuClick,
}) {
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);
  
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    initializeTheme();
    setTheme(getTheme());
  }, []);

  const handleThemeToggle = () => {
    const newTheme = toggleTheme();
    setTheme(newTheme);
  };
  const user = storage.getUser();

  const handleLogout = () => {
    storage.clear();
    router.push('/superadmin/login');
  };

  return (
    <header className="admin-header">
      <div className="header-left">
        <button
          className="mobile-menu-btn"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          ☰
        </button>

        <div className="header-title">
          <div className="header-title-icon">CQ</div>

          <div>
            <h1>{title}</h1>
            <span>Management Console</span>
          </div>
        </div>
      </div>

      <div className="header-right">
        <button
          className="theme-toggle-btn"
          onClick={handleThemeToggle}
          aria-label="Toggle theme"
          title={
            theme === 'dark'
              ? 'Switch to light mode'
              : 'Switch to dark mode'
          }
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button className="notification-btn" title="Notifications">
          <span>🔔</span>
          <i />
        </button>

        <div className="profile-wrapper">
          <button
            className="profile-btn"
            onClick={() => setShowProfile(!showProfile)}
          >
            <div className="profile-avatar">
              {user?.firstName?.charAt(0)?.toUpperCase() || 'A'}
            </div>

            <div className="profile-info">
              <strong>
                {user?.firstName || 'Super Admin'}
              </strong>
              <span>Super Administrator</span>
            </div>

            <span className="profile-arrow">⌄</span>
          </button>

          {showProfile && (
            <div className="profile-dropdown">
              <div className="dropdown-user">
                <div className="profile-avatar large">
                  {user?.firstName?.charAt(0)?.toUpperCase() || 'A'}
                </div>

                <div>
                  <strong>
                    {user?.firstName || 'Super Admin'}
                  </strong>
                  <span>{user?.email || 'admin@cqabooking.com'}</span>
                </div>
              </div>

              <div className="dropdown-divider" />

              <button
                onClick={() => router.push('/superadmin/profile')}
              >
                <span>👤</span>
                My Profile
              </button>

              <button
                onClick={() => router.push('/superadmin/settings')}
              >
                <span>⚙</span>
                Settings
              </button>

              <div className="dropdown-divider" />

              <button
                className="logout-dropdown"
                onClick={handleLogout}
              >
                <span>↪</span>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}