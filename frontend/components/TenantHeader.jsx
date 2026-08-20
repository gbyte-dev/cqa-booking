'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';

export default function TenantHeader({
  title = 'Tenant Dashboard',
  onMenuClick,
}) {
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);
  const [theme, setTheme] = useState('light');

  const user = storage.getUser();
  const organization = storage.getOrganization?.();
  
  /* =========================================================
     THEME
  ========================================================= */

  useEffect(() => {
    const savedTheme = localStorage.getItem('tenant-theme');

    if (savedTheme === 'dark' || savedTheme === 'light') {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      setTheme('light');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';

    setTheme(newTheme);

    localStorage.setItem('tenant-theme', newTheme);

    document.documentElement.setAttribute(
      'data-theme',
      newTheme
    );
  };

  const handleLogout = () => {
    storage.clear();
    router.push('/tenant/login');
  };

  return (
    <header className="tenant-header">
      <div className="header-left">
        <button
          className="mobile-menu-btn"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          ☰
        </button>

        <div className="header-title">
          <div className="header-title-icon">
            🏢
          </div>

          <div>
            <h1>{title}</h1>
            <span>{organization?.name || 'Organization'}</span>
          </div>
        </div>
      </div>

      <div className="header-right">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search bookings, customers..."
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        <button type="button" className="theme-toggle-btn"
          onClick={toggleTheme} title={ theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          aria-label={ theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
          {theme === 'light' ? '🌙' : '☀️'}
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
              {user?.firstName?.charAt(0)?.toUpperCase() || 'T'}
            </div>

            <div className="profile-info">
              <strong>
                {user?.firstName || 'Tenant'}
              </strong>
              <span>Manager</span>
            </div>

            <span className="profile-arrow">⌄</span>
          </button>

          {showProfile && (
            <div className="profile-dropdown">
              <div className="dropdown-user">
                <div className="profile-avatar large">
                  {user?.firstName?.charAt(0)?.toUpperCase() || 'T'}
                </div>

                <div>
                  <strong>
                    {user?.firstName} {user?.lastName}
                  </strong>
                  <span>{user?.email}</span>
                  <span className="org-badge">
                    {organization?.name}
                  </span>
                </div>
              </div>

              <div className="dropdown-divider" />

              <button
                onClick={() => router.push('/tenant/profile')}
              >
                <span>👤</span>
                My Profile
              </button>

              <button
                onClick={() => router.push('/tenant/settings')}
              >
                <span>⚙️</span>
                Settings
              </button>

              <button
                onClick={() => router.push('/tenant/billing')}
              >
                <span>💳</span>
                Billing
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