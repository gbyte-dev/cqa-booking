'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/TenantHeader';
import Footer from '@/components/Footer';
import TenantSidebar from '@/components/TenantSidebar';
import { storage } from '@/lib/storage';

import './dashboard.css';

export default function TenantDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = storage.getToken();
  const currentUser = storage.getUser();

  useEffect(() => {
    if (!token || !currentUser) {
      router.push('/tenant/login');
      return;
    }
    setUser(currentUser);
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="tenant-dashboard">
        <div className="loading-state">
          <div className="loading-spinner" />
          <span>Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="tenant-dashboard">
      <div className="tenant-layout">
        <TenantSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="tenant-main-wrapper">
          <Header
            title="Dashboard"
            onMenuClick={() => setSidebarOpen(true)}
          />

          <main className="tenant-content">
            {/* Stats Section */}
            <div className="dashboard-header">
              <div className="welcome-section">
                <h2>👋 Welcome back, {user?.firstName}!</h2>
                <p>Here's what's happening with your bookings today.</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-top">
                  <span className="stat-label">Today's Bookings</span>
                  <span className="stat-icon">📋</span>
                </div>
                <div className="stat-value">12</div>
                <div className="stat-footer">
                  <span className="stat-description">2 pending confirmation</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <span className="stat-label">Total Guests Today</span>
                  <span className="stat-icon">👥</span>
                </div>
                <div className="stat-value">48</div>
                <div className="stat-footer">
                  <span className="stat-description">Across all bookings</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <span className="stat-label">Revenue Today</span>
                  <span className="stat-icon">💰</span>
                </div>
                <div className="stat-value">$2,400</div>
                <div className="stat-footer">
                  <span className="stat-description">From confirmed bookings</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <span className="stat-label">Occupancy Rate</span>
                  <span className="stat-icon">📊</span>
                </div>
                <div className="stat-value">85%</div>
                <div className="stat-footer">
                  <span className="stat-positive">↑ 12% from yesterday</span>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="dashboard-grid">
              {/* Upcoming Bookings */}
              <div className="panel">
                <div className="panel-header">
                  <h3>📅 Upcoming Bookings</h3>
                  <a href="/tenant/bookings" className="view-all">View All</a>
                </div>

                <div className="bookings-list">
                  <div className="booking-item">
                    <div className="booking-time">
                      <div className="time">6:30 PM</div>
                      <div className="date">Today</div>
                    </div>
                    <div className="booking-info">
                      <div className="customer-name">John Doe</div>
                      <div className="booking-details">
                        Table 5 • 4 Guests • Premium Package
                      </div>
                    </div>
                    <div className="booking-status confirmed">
                      ✅ Confirmed
                    </div>
                  </div>

                  <div className="booking-item">
                    <div className="booking-time">
                      <div className="time">7:00 PM</div>
                      <div className="date">Today</div>
                    </div>
                    <div className="booking-info">
                      <div className="customer-name">Jane Smith</div>
                      <div className="booking-details">
                        Table 2 • 2 Guests • Standard Package
                      </div>
                    </div>
                    <div className="booking-status pending">
                      ⏳ Pending
                    </div>
                  </div>

                  <div className="booking-item">
                    <div className="booking-time">
                      <div className="time">8:00 PM</div>
                      <div className="date">Today</div>
                    </div>
                    <div className="booking-info">
                      <div className="customer-name">Alex Johnson</div>
                      <div className="booking-details">
                        Table 7 • 6 Guests • Premium Package
                      </div>
                    </div>
                    <div className="booking-status confirmed">
                      ✅ Confirmed
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions-panel">
                <div className="panel-header">
                  <h3>⚡ Quick Actions</h3>
                </div>

                <div className="actions-grid">
                  <button className="action-card">
                    <div className="action-icon">➕</div>
                    <div className="action-label">New Booking</div>
                  </button>

                  <button className="action-card">
                    <div className="action-icon">👥</div>
                    <div className="action-label">Add Customer</div>
                  </button>

                  <button className="action-card">
                    <div className="action-icon">📊</div>
                    <div className="action-label">View Reports</div>
                  </button>

                  <button className="action-card">
                    <div className="action-icon">⚙️</div>
                    <div className="action-label">Settings</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Analytics Section */}
            <div className="analytics-section">
              <div className="panel">
                <div className="panel-header">
                  <h3>📈 Weekly Analytics</h3>
                  <select className="period-select">
                    <option>This Week</option>
                    <option>Last Week</option>
                    <option>This Month</option>
                  </select>
                </div>

                <div className="analytics-chart">
                  <div className="chart-placeholder">
                    <div className="chart-bar" style={{ height: '60%' }}>Mon</div>
                    <div className="chart-bar" style={{ height: '75%' }}>Tue</div>
                    <div className="chart-bar" style={{ height: '85%' }}>Wed</div>
                    <div className="chart-bar" style={{ height: '70%' }}>Thu</div>
                    <div className="chart-bar" style={{ height: '90%' }}>Fri</div>
                    <div className="chart-bar" style={{ height: '95%' }}>Sat</div>
                    <div className="chart-bar" style={{ height: '80%' }}>Sun</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="metrics-section">
              <div className="metric-card">
                <div className="metric-label">Avg. Party Size</div>
                <div className="metric-value">4.2</div>
                <div className="metric-change positive">↑ 0.3 from last week</div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Booking Lead Time</div>
                <div className="metric-value">3.5 days</div>
                <div className="metric-change">→ Same as last week</div>
              </div>

              <div className="metric-card">
                <div className="metric-label">No-Show Rate</div>
                <div className="metric-value">2.1%</div>
                <div className="metric-change positive">↓ 0.5% from last week</div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Customer Rating</div>
                <div className="metric-value">4.8/5</div>
                <div className="metric-stars">⭐⭐⭐⭐⭐</div>
              </div>
            </div>
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
}