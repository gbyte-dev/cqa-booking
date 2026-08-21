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
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [mounted, setMounted] = useState(false);

  // ✅ ONLY: Set user/organization/theme after mount
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
            <span>{mounted ? (organization?.name || 'Organization') : 'Organization'}</span>
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
              {mounted ? (user?.firstName?.charAt(0)?.toUpperCase() || 'T') : 'T'}
            </div>

            <div className="profile-info">
              <strong>
                {mounted ? (user?.firstName || 'Tenant') : 'Tenant'}
              </strong>
              <span>Manager</span>
            </div>

            <span className="profile-arrow">⌄</span>
          </button>

          {showProfile && (
            <div className="profile-dropdown">
              <div className="dropdown-user">
                <div className="profile-avatar large">
                  {mounted ? (user?.firstName?.charAt(0)?.toUpperCase() || 'T') : 'T'}
                </div>

                <div>
                  <strong>
                    {mounted ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() : 'User'}
                  </strong>
                  <span>{mounted ? user?.email : 'email@example.com'}</span>
                  <span className="org-badge">
                    {mounted ? organization?.name : 'Organization'}
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