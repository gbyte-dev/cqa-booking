'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function ReportsPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  const token = storage.getToken();
  const currentUser = storage.getUser();

  useEffect(() => {
    if (!token || !currentUser || currentUser.role !== "superadmin") {
      router.push("/superadmin/login");
      return;
    }
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadReports = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/reports/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data || {});
      }
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
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
                <h2>Platform Reports</h2>
                <p>Revenue, adoption, and platform health analytics.</p>
              </div>

              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="period-select"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Revenue</div>
                <div className="stat-value">{formatCurrency(stats?.totalRevenue)}</div>
                <div className="stat-footer">All time collection</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Organizations</div>
                <div className="stat-value">{stats?.totalOrganizations || 0}</div>
                <div className="stat-footer">Registered tenants</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Total Bookings</div>
                <div className="stat-value">{stats?.totalBookings || 0}</div>
                <div className="stat-footer">Across all venues</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Active Subscriptions</div>
                <div className="stat-value">{stats?.activeSubscriptions || 0}</div>
                <div className="stat-footer">Currently active plans</div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h3>Export Data</h3>
                <span>CSV exports</span>
              </div>

              <div className="export-grid">
                <a className="export-card" href={`${API_URL}/api/v1/reports/bookings.csv`} target="_blank" rel="noreferrer">
                  <div className="export-icon">⬇</div>
                  <div>
                    <strong>Bookings Report</strong>
                    <span>Download all bookings as CSV</span>
                  </div>
                </a>

                <a className="export-card" href={`${API_URL}/api/v1/reports/customers.csv`} target="_blank" rel="noreferrer">
                  <div className="export-icon">⬇</div>
                  <div>
                    <strong>Customers Report</strong>
                    <span>Download all customers as CSV</span>
                  </div>
                </a>

                <a className="export-card" href={`${API_URL}/api/v1/reports/payments.csv`} target="_blank" rel="noreferrer">
                  <div className="export-icon">⬇</div>
                  <div>
                    <strong>Payments Report</strong>
                    <span>Download all payments as CSV</span>
                  </div>
                </a>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h3>Top Performing Venues</h3>
                <span>{period} overview</span>
              </div>

              {stats?.topVenues?.length ? (
                <div className="venue-list">
                  {stats.topVenues.map((venue, index) => (
                    <div className="venue-item" key={venue.id || index}>
                      <div className="venue-rank">{index + 1}</div>
                      <div className="venue-info">
                        <strong>{venue.name || "Venue"}</strong>
                        <span>{venue.bookings || 0} bookings</span>
                      </div>
                      <div className="venue-bar">
                        <div
                          className="venue-bar-fill"
                          style={{ width: `${Math.min(100, ((venue.bookings || 0) / (stats.topVenues[0]?.bookings || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No venue performance data available yet.</p>
                </div>
              )}
            </div>
      </main>

      <style jsx>{`
        * { box-sizing: border-box; }

        .reports-content { flex: 1; padding: 28px; }

        .loading-state {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          color: var(--sa-text-secondary, #667085);
          font-size: 13px;
        }

        .loading-spinner {
          width: 36px;
          height: 36px;
          border: 4px solid var(--sa-border, #e5e7eb);
          border-top-color: var(--sa-primary, #667eea);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .page-header h2 {
          margin: 0;
          font-size: 26px;
          letter-spacing: -0.5px;
        }

        .page-header p {
          margin: 6px 0 0;
          color: var(--sa-text-secondary, #667085);
          font-size: 13px;
        }

        .period-select {
          height: 40px;
          padding: 0 12px;
          border: 1px solid var(--sa-border, #e5e7eb);
          border-radius: var(--sa-radius-sm, 7px);
          background: var(--sa-surface, #fff);
          color: var(--sa-text, #171c2d);
          font-size: 13px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin-bottom: 24px;
        }

        .stat-card {
          padding: 22px;
          background: var(--sa-surface, #fff);
          border: 1px solid var(--sa-border-light, #edf0f4);
          border-radius: var(--sa-radius-lg, 14px);
          box-shadow: var(--sa-shadow-sm, 0 2px 8px rgba(15,23,42,0.05));
        }

        .stat-label {
          color: var(--sa-text-secondary, #667085);
          font-size: 12px;
          font-weight: 600;
        }

        .stat-value {
          margin-top: 10px;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .stat-footer {
          margin-top: 8px;
          color: var(--sa-text-muted, #98a2b3);
          font-size: 11px;
        }

        .panel {
          background: var(--sa-surface, #fff);
          border: 1px solid var(--sa-border-light, #edf0f4);
          border-radius: var(--sa-radius-lg, 14px);
          box-shadow: var(--sa-shadow-sm, 0 2px 8px rgba(15,23,42,0.05));
          margin-bottom: 24px;
          overflow: hidden;
        }

        .panel-header {
          min-height: 60px;
          padding: 0 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--sa-border, #e5e7eb);
        }

        .panel-header h3 { margin: 0; font-size: 15px; }
        .panel-header span { color: var(--sa-text-muted, #98a2b3); font-size: 11px; }

        .export-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          padding: 22px;
        }

        .export-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px;
          border: 1px solid var(--sa-border, #e5e7eb);
          border-radius: var(--sa-radius-md, 10px);
          text-decoration: none;
          color: var(--sa-text, #171c2d);
          transition: all 0.2s ease;
        }

        .export-card:hover {
          border-color: var(--sa-primary, #667eea);
          box-shadow: 0 8px 24px rgba(15,23,42,0.08);
          transform: translateY(-2px);
        }

        .export-icon {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: var(--sa-primary-light, #eef1ff);
          color: var(--sa-primary, #667eea);
          font-size: 18px;
        }

        .export-card strong {
          display: block;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .export-card span {
          color: var(--sa-text-muted, #98a2b3);
          font-size: 11px;
        }

        .venue-list { padding: 0; }

        .venue-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 22px;
          border-bottom: 1px solid var(--sa-border-light, #edf0f4);
        }

        .venue-item:last-child { border-bottom: none; }

        .venue-rank {
          width: 30px;
          height: 30px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: var(--sa-surface-2, #f8f9fc);
          color: var(--sa-text-secondary, #667085);
          font-size: 12px;
          font-weight: 800;
        }

        .venue-info { min-width: 200px; }

        .venue-info strong {
          display: block;
          font-size: 14px;
        }

        .venue-info span {
          color: var(--sa-text-muted, #98a2b3);
          font-size: 11px;
        }

        .venue-bar {
          flex: 1;
          height: 8px;
          border-radius: 999px;
          background: var(--sa-surface-2, #f8f9fc);
          overflow: hidden;
        }

        .venue-bar-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, var(--sa-primary, #667eea), #764ba2);
        }

        .empty-state {
          padding: 50px 20px;
          text-align: center;
          color: var(--sa-text-muted, #98a2b3);
          font-size: 14px;
        }

        @media (max-width: 1200px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .export-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .reports-content { padding: 18px 14px; }
          .page-header { flex-direction: column; align-items: flex-start; }
          .venue-info { min-width: 140px; }
        }

        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}

export default ReportsPage;
