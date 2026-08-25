'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Building2,
  Search,
  Sun,
  Moon,
  Bell,
  User,
  Settings,
  CreditCard,
  LogOut,
  CalendarPlus,
  CalendarCheck,
  LogIn,
  UserX,
  XCircle,
  CheckCircle2,
} from 'lucide-react';
import { storage } from '@/lib/storage';

export default function TenantHeader({
  title = 'Tenant Dashboard',
  onMenuClick,
}) {
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);

  // ONLY: Set user/organization/theme after mount
  useEffect(() => {
    const loadProfile = () => {
      setUser(storage.getUser());
      setOrganization(storage.getOrganization?.());

      const token = storage.getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      if (token) {
        fetch(`${apiUrl}/api/v1/profile/me`, { headers: { Authorization: `Bearer ${token}` } })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) setAvatarUrl(data.data.avatarUrl ? `${apiUrl}${data.data.avatarUrl}` : null);
          })
          .catch(() => {});
      }
    };

    loadProfile();

    // This header lives in the persistent tenant layout, so it never
    // remounts when navigating to/from the profile page — without this it
    // would keep showing the stale name/photo until a full page reload.
    window.addEventListener('tenant-profile-updated', loadProfile);

    const savedTheme = localStorage.getItem('tenant-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      setTheme('light');
      document.documentElement.setAttribute('data-theme', 'light');
    }

    setMounted(true);

    return () => window.removeEventListener('tenant-profile-updated', loadProfile);
  }, []);

  // Live booking-activity feed for the bell — polled (no websocket infra
  // yet), read from the same audit trail the booking page's Activity
  // History uses. Unread count is derived from a per-user "last seen"
  // timestamp kept in localStorage, so it survives refresh but never
  // touches the backend.
  useEffect(() => {
    const token = storage.getToken();
    if (!token) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const fetchFeed = () => {
      fetch(`${apiUrl}/api/v1/notifications/feed`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) return;
          setNotifications(data.data || []);
          const lastSeen = localStorage.getItem('tenant-notif-last-seen');
          const lastSeenTime = lastSeen ? new Date(lastSeen).getTime() : 0;
          const unread = (data.data || []).filter((n) => new Date(n.createdAt).getTime() > lastSeenTime).length;
          setUnreadCount(unread);
        })
        .catch(() => {});
    };

    fetchFeed();
    const interval = setInterval(fetchFeed, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close the profile / notification dropdowns when clicking anywhere outside them.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBellClick = () => {
    setShowNotif((prev) => !prev);
    if (!showNotif) {
      localStorage.setItem('tenant-notif-last-seen', new Date().toISOString());
      setUnreadCount(0);
    }
  };

  const NOTIF_META = {
    'booking.created': { label: 'New booking created', icon: CalendarPlus, color: 'var(--tenant-primary)' },
    'booking.confirmed': { label: 'Booking confirmed', icon: CheckCircle2, color: '#16a34a' },
    'booking.checked_in': { label: 'Guest checked in', icon: LogIn, color: '#0891b2' },
    'booking.no_show': { label: 'Guest marked no-show', icon: UserX, color: 'var(--tenant-danger)' },
    'booking.cancelled': { label: 'Booking cancelled', icon: XCircle, color: 'var(--tenant-danger)' },
    'booking.completed': { label: 'Booking completed', icon: CalendarCheck, color: '#16a34a' }
  };

  const formatRelativeTime = (dateStr) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('tenant-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLogout = () => {
    storage.clear();
    router.push('/login');
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
        <button
          type="button"
          className={`${iconBtnClasses} hover:-translate-y-px active:scale-95`}
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        <div className="relative" ref={notifRef}>
          <button
            type="button"
            className={`${iconBtnClasses} relative text-[var(--tenant-text-secondary)]`}
            title="Notifications"
            onClick={handleBellClick}
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute right-[5px] top-[5px] flex h-[16px] min-w-[16px] items-center justify-center rounded-full border-2 border-[var(--tenant-header-bg)] bg-[var(--tenant-danger)] px-[3px] text-[9px] font-bold leading-none text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 max-[600px]:right-[-40px] top-[calc(100%+9px)] z-[300] w-[330px] max-[600px]:w-[min(330px,calc(100vw-24px))] rounded-[var(--tenant-radius-md)] border border-[var(--tenant-border)] bg-[var(--tenant-surface)] shadow-[var(--tenant-shadow-lg)] animate-[tenant-dropdown-in_0.15s_ease]">
              <div className="flex items-center justify-between border-b border-[var(--tenant-border)] px-4 py-3">
                <strong className="text-[13px] font-bold text-[var(--tenant-text)]">Booking Activity</strong>
                {notifications.length > 0 && (
                  <span className="text-[10px] text-[var(--tenant-text-muted)]">{notifications.length} recent</span>
                )}
              </div>

              <div className="max-h-[340px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                    <Bell size={22} className="text-[var(--tenant-text-muted)]" />
                    <span className="text-xs text-[var(--tenant-text-muted)]">No booking activity yet</span>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const meta = NOTIF_META[n.action] || { label: n.action, icon: Bell, color: 'var(--tenant-text-secondary)' };
                    const Icon = meta.icon;
                    return (
                      <div
                        key={n.id}
                        className="flex items-start gap-3 border-b border-[var(--tenant-border-light)] px-4 py-3 transition-colors duration-150 last:border-b-0 hover:bg-[var(--tenant-surface-hover)]"
                      >
                        <span
                          className="mt-[1px] flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                          style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}
                        >
                          <Icon size={15} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="m-0 text-xs font-semibold text-[var(--tenant-text)]">{meta.label}</p>
                          <p className="m-0 mt-[3px] text-[11px] text-[var(--tenant-text-secondary)]">
                            by {n.performedBy}{n.performedByRole ? ` (${n.performedByRole})` : ''}
                          </p>
                        </div>
                        <span className="shrink-0 whitespace-nowrap text-[10px] text-[var(--tenant-text-muted)]">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              <button
                type="button"
                className="w-full border-t border-[var(--tenant-border)] px-4 py-[10px] text-center text-[11px] font-semibold text-[var(--tenant-primary)] transition-colors duration-150 hover:bg-[var(--tenant-surface-hover)]"
                onClick={() => { setShowNotif(false); router.push('/tenant/bookings'); }}
              >
                View all bookings
              </button>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            className="flex min-h-[44px] max-[768px]:min-h-[38px] items-center gap-[9px] rounded-[var(--tenant-radius-md)] border border-[var(--tenant-border)] max-[768px]:border-0 bg-[var(--tenant-surface)] max-[768px]:bg-transparent px-[9px] py-[5px] max-[768px]:p-[2px] text-[var(--tenant-text)] cursor-pointer transition-all duration-200 hover:bg-[var(--tenant-surface-hover)] hover:border-[var(--tenant-primary)] max-[768px]:hover:border-transparent"
            onClick={() => setShowProfile(!showProfile)}
          >
            <div className="flex h-[34px] w-[34px] max-[480px]:h-[31px] max-[480px]:w-[31px] max-[360px]:h-[29px] max-[360px]:w-[29px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[var(--tenant-primary)] to-[#764ba2] text-[13px] font-bold text-white">
              {mounted && avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                mounted ? (user?.firstName?.charAt(0)?.toUpperCase() || 'T') : 'T'
              )}
            </div>

            <div className="flex min-w-[90px] max-[768px]:hidden flex-col items-start leading-[1.2]">
              <strong className="max-w-[130px] overflow-hidden text-ellipsis whitespace-nowrap text-xs font-bold text-[var(--tenant-text)]">
                {mounted ? (user?.firstName || 'Tenant') : 'Tenant'}
              </strong>
              <span className="mt-[3px] text-[10px] text-[var(--tenant-text-muted)]">
                {mounted ? (user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Team Member') : 'Team Member'}
              </span>
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 max-[600px]:right-[-3px] top-[calc(100%+9px)] z-[300] w-[270px] max-[600px]:w-[min(270px,calc(100vw-24px))] rounded-[var(--tenant-radius-md)] border border-[var(--tenant-border)] bg-[var(--tenant-surface)] p-2 shadow-[var(--tenant-shadow-lg)] animate-[tenant-dropdown-in_0.15s_ease]">
              <div className="flex items-center gap-[10px] p-[10px]">
                <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[var(--tenant-primary)] to-[#764ba2] text-[15px] font-bold text-white">
                  {mounted && avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    mounted ? (user?.firstName?.charAt(0)?.toUpperCase() || 'T') : 'T'
                  )}
                </div>

                <div className="flex min-w-0 flex-col">
                  <strong className="text-[13px] font-bold text-[var(--tenant-text)]">
                    {mounted ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() : 'User'}
                  </strong>
                  <span className="mt-[3px] overflow-hidden text-ellipsis whitespace-nowrap text-[10px] text-[var(--tenant-text-muted)]">
                    {mounted ? user?.email : 'email@example.com'}
                  </span>
                  <span className="mt-[3px] text-[10px] font-semibold text-[var(--tenant-primary)]">
                    {mounted ? organization?.name : 'Organization'}
                  </span>
                </div>
              </div>

              <div className="my-[6px] h-px bg-[var(--tenant-border)]" />

              <button
                className="flex min-h-10 w-full items-center gap-[10px] rounded-[var(--tenant-radius-sm)] border-0 bg-transparent px-[11px] text-left text-xs text-[var(--tenant-text-secondary)] cursor-pointer transition-all duration-200 hover:bg-[var(--tenant-surface-hover)] hover:text-[var(--tenant-text)]"
                onClick={() => router.push('/tenant/profile')}
              >
                <span className="flex w-5 items-center justify-center">
                  <User size={15} />
                </span>
                My Profile
              </button>

              {user?.role === 'owner' && (
                <>
                  <button
                    className="flex min-h-10 w-full items-center gap-[10px] rounded-[var(--tenant-radius-sm)] border-0 bg-transparent px-[11px] text-left text-xs text-[var(--tenant-text-secondary)] cursor-pointer transition-all duration-200 hover:bg-[var(--tenant-surface-hover)] hover:text-[var(--tenant-text)]"
                    onClick={() => router.push('/tenant/settings')}
                  >
                    <span className="flex w-5 items-center justify-center">
                      <Settings size={15} />
                    </span>
                    Settings
                  </button>

                  <button
                    className="flex min-h-10 w-full items-center gap-[10px] rounded-[var(--tenant-radius-sm)] border-0 bg-transparent px-[11px] text-left text-xs text-[var(--tenant-text-secondary)] cursor-pointer transition-all duration-200 hover:bg-[var(--tenant-surface-hover)] hover:text-[var(--tenant-text)]"
                    onClick={() => router.push('/tenant/billing')}
                  >
                    <span className="flex w-5 items-center justify-center">
                      <CreditCard size={15} />
                    </span>
                    Billing
                  </button>
                </>
              )}

              <div className="my-[6px] h-px bg-[var(--tenant-border)]" />

              <button
                className="flex min-h-10 w-full items-center gap-[10px] rounded-[var(--tenant-radius-sm)] border-0 bg-transparent px-[11px] text-left text-xs text-[var(--tenant-danger)] cursor-pointer transition-all duration-200 hover:bg-[var(--tenant-danger-bg)] hover:text-[var(--tenant-danger)]"
                onClick={handleLogout}
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
