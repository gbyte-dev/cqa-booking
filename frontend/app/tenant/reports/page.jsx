'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';

export default function TenantReportsPage() {
  const router = useRouter();
  const mountedRef = useRef(false);

  const [stats, setStats] = useState(null);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = storage.getToken();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    if (!token) {
      router.replace('/tenant/login');
      return;
    }

    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, venuesRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/bookings/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/v1/venues`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const statsData = await statsRes.json();
      const venuesData = await venuesRes.json();

      if (statsData.success) setStats(statsData.data);
      if (venuesData.success) setVenues(venuesData.data || []);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        <span>Loading Reports...</span>
      </div>
    );
  }

  return (
    <>
      <main className="reports-content">
            <div className="page-header">
              <div>
                <h2>📈 Reports</h2>
                <p>Booking performance across your venues.</p>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Bookings</div>
                <div className="stat-value">{stats?.totalBookings || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Confirmed</div>
                <div className="stat-value">{stats?.confirmedBookings || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Completed</div>
                <div className="stat-value">{stats?.completedBookings || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Cancelled</div>
                <div className="stat-value">{stats?.cancelledBookings || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Guests</div>
                <div className="stat-value">{stats?.totalGuests || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Venues</div>
                <div className="stat-value">{venues.length}</div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h3>Your Venues</h3>
                <span>{venues.length} total</span>
              </div>

              {venues.length === 0 ? (
                <div className="empty-state">
                  <p>No venues yet — add one to start seeing performance data.</p>
                </div>
              ) : (
                <div className="venue-list">
                  {venues.map(venue => (
                    <div className="venue-item" key={venue.id}>
                      <strong>{venue.name}</strong>
                      <span>{venue.city || 'No city set'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
      </main>

      <style jsx>{`
        .reports-page { min-height: 100vh; background: var(--tenant-bg, #f5f7fb); color: var(--tenant-text, #171c2d); }
        .reports-layout { display: flex; min-height: 100vh; }
        .reports-main-wrapper { flex: 1; min-width: 0; margin-left: var(--tenant-sidebar-width, 260px); display: flex; flex-direction: column; }
        .reports-content { flex: 1; padding: 28px; overflow-y: auto; }
        .loading-state { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; color: var(--tenant-text-secondary, #667085); }
        .loading-spinner { width: 36px; height: 36px; border: 4px solid var(--tenant-border, #e5e7eb); border-top-color: var(--tenant-primary, #667eea); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .page-header { margin-bottom: 24px; }
        .page-header h2 { margin: 0; font-size: 26px; color: var(--tenant-text, #171c2d); }
        .page-header p { margin: 6px 0 0; color: var(--tenant-text-secondary, #667085); font-size: 13px; }
        .stats-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; margin-bottom: 24px; }
        .stat-card { padding: 18px; background: var(--tenant-surface, #fff); border: 1px solid var(--tenant-border-light, #edf0f4); border-radius: 12px; box-shadow: var(--tenant-shadow-sm, 0 2px 8px rgba(15,23,42,0.05)); transition: all 0.2s ease; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: var(--tenant-shadow-md, 0 8px 24px rgba(15,23,42,0.08)); }
        .stat-label { color: var(--tenant-text-secondary, #667085); font-size: 11px; font-weight: 600; }
        .stat-value { margin-top: 8px; font-size: 24px; font-weight: 800; color: var(--tenant-text, #171c2d); }
        .panel { background: var(--tenant-surface, #fff); border: 1px solid var(--tenant-border-light, #edf0f4); border-radius: 12px; overflow: hidden; box-shadow: var(--tenant-shadow-sm, 0 2px 8px rgba(15,23,42,0.05)); }
        .panel-header { padding: 0 22px; min-height: 60px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--tenant-border, #e5e7eb); }
        .panel-header h3 { margin: 0; font-size: 15px; font-weight: 600; color: var(--tenant-text, #171c2d); }
        .panel-header span { color: var(--tenant-text-muted, #98a2b3); font-size: 11px; }
        .venue-list { padding: 6px 0; }
        .venue-item { display: flex; justify-content: space-between; padding: 14px 22px; border-bottom: 1px solid var(--tenant-border-light, #edf0f4); color: var(--tenant-text, #171c2d); transition: background 0.2s ease; }
        .venue-item:hover { background: var(--tenant-surface-hover, #f1f4f9); }
        .venue-item:last-child { border-bottom: none; }
        .venue-item span { color: var(--tenant-text-muted, #98a2b3); font-size: 12px; }
        .empty-state { padding: 40px 20px; text-align: center; color: var(--tenant-text-muted, #98a2b3); font-size: 13px; }
        @media (max-width: 900px) {
          .reports-main-wrapper { margin-left: 0; }
          .reports-content { padding: 18px 14px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </>
  );
}
