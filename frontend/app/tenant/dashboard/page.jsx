'use client';
import AppIcon from '@/components/AppIcon';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { storage } from '@/lib/storage';


const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function TenantDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);

  const token = storage.getToken();
  const currentUser = storage.getUser();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!token || !currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setBookings(data.data || []);
    } catch (error) {    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const dateOnly = (d) => (d ? new Date(d).toISOString().slice(0, 10) : null);

  const todaysBookings = bookings.filter(b => dateOnly(b.bookingDate) === todayStr);
  const totalGuestsToday = todaysBookings.reduce((sum, b) => sum + Number(b.numGuests || 0), 0);
  const confirmedToday = todaysBookings.filter(b => b.bookingStatus === 'confirmed').length;
  const pendingToday = todaysBookings.filter(b => b.bookingStatus === 'pending').length;

  const upcomingBookings = bookings
    .filter(b => b.bookingStatus !== 'cancelled' && dateOnly(b.bookingDate) >= todayStr)
    .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate) || (a.bookingStartTime || '').localeCompare(b.bookingStartTime || ''))
    .slice(0, 5);

  const cancelledCount = bookings.filter(b => b.bookingStatus === 'cancelled').length;
  const noShowCount = bookings.filter(b => b.bookingStatus === 'no_show').length;
  const cancellationRate = bookings.length > 0 ? ((cancelledCount / bookings.length) * 100).toFixed(1) : '0.0';
  const avgPartySize = bookings.length > 0
    ? (bookings.reduce((sum, b) => sum + Number(b.numGuests || 0), 0) / bookings.length).toFixed(1)
    : '0.0';

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const weeklyCounts = last7Days.map(dateStr => ({
    label: WEEKDAY_LABELS[new Date(dateStr).getDay()],
    count: bookings.filter(b => dateOnly(b.bookingDate) === dateStr).length
  }));
  const maxWeeklyCount = Math.max(1, ...weeklyCounts.map(d => d.count));

  const formatTime = (t) => {
    if (!t) return 'N/A';
    const [h, m] = t.split(':');
    const hour = Number(h);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${suffix}`;
  };

  const statusIcon = (status) => ({
    confirmed: 'Confirmed',
    pending: 'Pending',
    checked_in: 'Checked In',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_show: 'No Show'
  }[status] || status);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        <span>Loading Dashboard...</span>
      </div>
    );
  }

  return (
    <>
      <main className="tenant-content">
            {/* Stats Section */}
            <div className="dashboard-header">
              <div className="welcome-section">
                <h2 className="flex items-center gap-2"><AppIcon name="hand" /> Welcome back, {user?.firstName}!</h2>
                <p>Here's what's happening with your bookings today.</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-top">
                  <span className="stat-label">Today's Bookings</span>
                  <span className="stat-icon"><AppIcon name="bookings" /></span>
                </div>
                <div className="stat-value">{todaysBookings.length}</div>
                <div className="stat-footer">
                  <span className="stat-description">{pendingToday} pending confirmation</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <span className="stat-label">Total Guests Today</span>
                  <span className="stat-icon"><AppIcon name="users" /></span>
                </div>
                <div className="stat-value">{totalGuestsToday}</div>
                <div className="stat-footer">
                  <span className="stat-description">Across all bookings</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <span className="stat-label">Confirmed Today</span>
                  <span className="stat-icon"><AppIcon name="checkCircle" /></span>
                </div>
                <div className="stat-value">{confirmedToday}</div>
                <div className="stat-footer">
                  <span className="stat-description">Ready to seat</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <span className="stat-label">Total Bookings</span>
                  <span className="stat-icon"><AppIcon name="chart" /></span>
                </div>
                <div className="stat-value">{bookings.length}</div>
                <div className="stat-footer">
                  <span className="stat-description">All time</span>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="dashboard-grid">
              {/* Upcoming Bookings */}
              <div className="panel">
                <div className="panel-header">
                  <h3><AppIcon name="calendar" /> Upcoming Bookings</h3>
                  <Link href="/tenant/bookings" className="view-all">View All</Link>
                </div>

                <div className="bookings-list">
                  {upcomingBookings.length === 0 ? (
                    <div className="empty-bookings"><span>No upcoming bookings.</span></div>
                  ) : (
                    upcomingBookings.map(b => (
                      <div className="booking-item" key={b.id}>
                        <div className="booking-time">
                          <div className="time">{formatTime(b.bookingStartTime)}</div>
                          <div className="date">{dateOnly(b.bookingDate) === todayStr ? 'Today' : dateOnly(b.bookingDate)}</div>
                        </div>
                        <div className="booking-info">
                          <div className="customer-name">{b.customerName || 'N/A'}</div>
                          <div className="booking-details">
                            {b.Table?.name || 'No table'} â€¢ {b.numGuests} Guests â€¢ {b.Venue?.name || 'Venue'}
                          </div>
                        </div>
                        <div className={`booking-status ${b.bookingStatus}`}>
                          {statusIcon(b.bookingStatus)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions-panel">
                <div className="panel-header">
                  <h3><AppIcon name="zap" /> Quick Actions</h3>
                </div>

                <div className="actions-grid">
                  <Link href="/tenant/bookings" className="action-card">
                    <div className="action-icon"><AppIcon name="add" /></div>
                    <div className="action-label">New Booking</div>
                  </Link>

                  <Link href="/tenant/customers" className="action-card">
                    <div className="action-icon"><AppIcon name="users" /></div>
                    <div className="action-label">View Customer</div>
                  </Link>

                  {['owner', 'manager'].includes(currentUser?.role) && (
                    <Link href="/tenant/reports" className="action-card">
                      <div className="action-icon"><AppIcon name="chart" /></div>
                      <div className="action-label">View Reports</div>
                    </Link>
                  )}

                  {currentUser?.role === 'owner' && (
                  <Link href="/tenant/settings" className="action-card">
                    <div className="action-icon"><AppIcon name="settings" /></div>
                    <div className="action-label">Settings</div>
                  </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Analytics Section */}
            <div className="analytics-section">
              <div className="panel">
                <div className="panel-header">
                  <h3><AppIcon name="chart" /> Weekly Analytics</h3>
                  <select className="period-select">
                    <option>This Week</option>
                    <option>Last Week</option>
                    <option>This Month</option>
                  </select>
                </div>

                <div className="analytics-chart">
                  <div className="chart-placeholder">
                    {weeklyCounts.map((d, i) => (
                      <div className="chart-bar" key={i} style={{ height: `${Math.max(6, (d.count / maxWeeklyCount) * 100)}%` }} title={`${d.count} bookings`}>
                        {d.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="metrics-section">
              <div className="metric-card">
                <div className="metric-label">Avg. Party Size</div>
                <div className="metric-value">{avgPartySize}</div>
              </div>

              <div className="metric-card">
                <div className="metric-label">No-Show Count</div>
                <div className="metric-value">{noShowCount}</div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Cancellation Rate</div>
                <div className="metric-value">{cancellationRate}%</div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Total Bookings</div>
                <div className="metric-value">{bookings.length}</div>
              </div>
            </div>
      </main>
    </>
  );
}
