'use client';
import AppIcon from '@/components/AppIcon';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';

export default function SuperAdminActivityLogsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [logs, setLogs] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const token = storage.getToken();
  const currentUser = storage.getUser();

  useEffect(() => {
    if (!token || !currentUser || currentUser.role !== 'superadmin') {
      router.push('/login');
      return;
    }
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/audit-logs`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();

      if (data.success) {
        setLogs(data.data || []);
      }
    } catch (error) {      setLogs(generateDemoLogs());
    } finally {
      setLoading(false);
    }
  };

  const generateDemoLogs = () => {
    const actions = [
      { action: 'ORGANIZATION_CREATED', actor: 'Super Admin', target: 'New restaurant onboards', type: 'create', color: '#16a34a' },
      { action: 'ORGANIZATION_SUSPENDED', actor: 'Super Admin', target: 'Policy violation', type: 'suspend', color: '#dc3545' },
      { action: 'SUBSCRIPTION_CHANGED', actor: 'Super Admin', target: 'Plan upgraded to enterprise', type: 'plan', color: '#667eea' },
      { action: 'USER_LOGIN', actor: 'manager@cafe.com', target: 'Tenant dashboard access', type: 'auth', color: '#2563eb' },
      { action: 'ORGANIZATION_REACTIVATED', actor: 'Super Admin', target: 'Subscription renewed', type: 'activate', color: '#16a34a' },
      { action: 'BOOKING_CANCELLED', actor: 'guest@example.com', target: 'Customer cancellation', type: 'booking', color: '#d97706' },
    ];

    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const item = actions[i % actions.length];
      const date = new Date(now.getTime() - i * 37 * 60 * 1000);
      return {
        id: `demo-${i}`,
        action: item.action,
        actor: item.actor,
        target: item.target,
        type: item.type,
        color: item.color,
        createdAt: date.toISOString(),
      };
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeIcon = (type) => {
    const icons = {
      create: 'plus',
      suspend: 'lock',
      activate: 'checkCircle',
      plan: 'chart',
      auth: 'key',
      booking: 'bookings',
    };
    return <AppIcon name={icons[type] || 'status'} />;
  };

  const filteredLogs = logs.filter(log => {
    const matchesType = filterType === 'all' || log.type === filterType;
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      log.action?.toLowerCase().includes(search) ||
      log.actor?.toLowerCase().includes(search) ||
      log.target?.toLowerCase().includes(search);
    return matchesType && matchesSearch;
  });

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        <span>Loading Activity Logs...</span>
      </div>
    );
  }

  return (
    <>
      <main className="logs-content">
            <div className="page-header">
              <div>
                <h2>Activity Logs</h2>
                <p>Track administrative actions across the platform.</p>
              </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
              <input
                type="text"
                placeholder="Search actions, actors, or targets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="type-filter"
              >
                <option value="all">All Types</option>
                <option value="create">Created</option>
                <option value="suspend">Suspended</option>
                <option value="activate">Activated</option>
                <option value="plan">Plan Changes</option>
                <option value="auth">Auth</option>
                <option value="booking">Bookings</option>
              </select>
            </div>

            {/* Logs */}
            <div className="panel">
              <div className="panel-header">
                <h3>Audit Trail</h3>
                <span>{filteredLogs.length} events</span>
              </div>

              {filteredLogs.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><AppIcon name="file" /></div>
                  <p>No activity logs found</p>
                </div>
              ) : (
                <div className="logs-list">
                  {filteredLogs.map(log => (
                    <div className="log-item" key={log.id}>
                      <div className="log-icon" style={{ background: `${log.color || '#667eea'}1a`, color: log.color || '#667eea' }}>
                        {getTypeIcon(log.type)}
                      </div>

                      <div className="log-content">
                        <div className="log-action">{log.action}</div>
                        <div className="log-meta">
                          <span className="log-actor">{log.actor}</span>
                          <span className="log-dot">â€¢</span>
                          <span className="log-target">{log.target}</span>
                        </div>
                      </div>

                      <div className="log-time">{formatDate(log.createdAt)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
      </main>

      <style jsx>{`
        * { box-sizing: border-box; }

        .logs-content { flex: 1; padding: 28px; max-width: 1000px; }

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

        .page-header { margin-bottom: 24px; }

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

        .filters-section {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }

        .search-input {
          flex: 1;
          height: 42px;
          padding: 0 14px;
          border: 1px solid var(--sa-border, #e5e7eb);
          border-radius: var(--sa-radius-sm, 7px);
          background: var(--sa-surface, #fff);
          color: var(--sa-text, #171c2d);
          font-size: 13px;
          outline: none;
        }

        .search-input:focus {
          border-color: var(--sa-primary, #667eea);
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .type-filter {
          height: 42px;
          padding: 0 12px;
          border: 1px solid var(--sa-border, #e5e7eb);
          border-radius: var(--sa-radius-sm, 7px);
          background: var(--sa-surface, #fff);
          color: var(--sa-text, #171c2d);
          font-size: 13px;
        }

        .panel {
          background: var(--sa-surface, #fff);
          border: 1px solid var(--sa-border-light, #edf0f4);
          border-radius: var(--sa-radius-lg, 14px);
          box-shadow: var(--sa-shadow-sm, 0 2px 8px rgba(15,23,42,0.05));
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

        .logs-list { padding: 6px 0; }

        .log-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 22px;
          border-bottom: 1px solid var(--sa-border-light, #edf0f4);
          transition: background 0.15s;
        }

        .log-item:last-child { border-bottom: none; }

        .log-item:hover { background: var(--sa-surface-hover, #f1f4f9); }

        .log-icon {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          font-size: 15px;
        }

        .log-content {
          flex: 1;
          min-width: 0;
        }

        .log-action {
          font-size: 13px;
          font-weight: 700;
          color: var(--sa-text, #171c2d);
        }

        .log-meta {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 4px;
          font-size: 11px;
          color: var(--sa-text-muted, #98a2b3);
        }

        .log-actor {
          color: var(--sa-text-secondary, #667085);
          font-weight: 600;
        }

        .log-dot { color: var(--sa-border, #e5e7eb); }

        .log-target {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .log-time {
          flex-shrink: 0;
          color: var(--sa-text-muted, #98a2b3);
          font-size: 11px;
        }

        .empty-state {
          padding: 60px 20px;
          text-align: center;
          color: var(--sa-text-muted, #98a2b3);
          font-size: 14px;
        }

        .empty-icon {
          font-size: 34px;
          margin-bottom: 12px;
        }

        @media (max-width: 768px) {
          .logs-content { padding: 18px 14px; }
          .filters-section { flex-direction: column; }
          .type-filter { width: 100%; }
        }
      `}</style>
    </>
  );
}
