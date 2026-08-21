'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SuperAdminSidebar from '@/components/SuperAdminSidebar';
import { storage } from '@/lib/storage';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function SuperAdminPaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const token = storage.getToken();
  const currentUser = storage.getUser();

  useEffect(() => {
    if (!token || !currentUser || currentUser.role !== 'superadmin') {
      router.push('/superadmin/login');
      return;
    }
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/superadmin/payments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        setPayments(data.data || []);
        const total = (data.data || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);
        const completed = (data.data || []).filter(p => p.paymentStatus === 'completed').length;
        setStats({
          totalPayments: (data.data || []).length,
          completedPayments: completed,
          pendingPayments: (data.data || []).filter(p => p.paymentStatus !== 'completed').length,
          totalAmount: total
        });
      }
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(Number(value || 0));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredPayments = payments.filter(p => {
    const matchesStatus = filterStatus === 'all' || p.paymentStatus === filterStatus;
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      p.Booking?.customerName?.toLowerCase().includes(search) ||
      p.Booking?.customerEmail?.toLowerCase().includes(search) ||
      p.Organization?.name?.toLowerCase().includes(search) ||
      p.paymentReference?.toLowerCase().includes(search);
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="payments-page">
        <div className="loading-state">
          <div className="loading-spinner" />
          <span>Loading Payments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="payments-page">
      <div className="payments-layout">
        <SuperAdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="payments-main-wrapper">
          <Header title="Payments" onMenuClick={() => setSidebarOpen(true)} />

          <main className="payments-content">
            {/* Stats */}
            {stats && (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Total Payments</div>
                  <div className="stat-value">{stats.totalPayments}</div>
                  <div className="stat-footer">All transactions</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Completed</div>
                  <div className="stat-value">{stats.completedPayments}</div>
                  <div className="stat-footer">Successful payments</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Pending / Failed</div>
                  <div className="stat-value">{stats.pendingPayments}</div>
                  <div className="stat-footer">Awaiting completion</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Total Revenue</div>
                  <div className="stat-value">{formatCurrency(stats.totalAmount)}</div>
                  <div className="stat-footer">Collected amount</div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="filters-section">
              <input
                type="text"
                placeholder="Search by customer, organization, or reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="status-filter"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            {/* Table */}
            <div className="panel">
              <div className="panel-header">
                <h3>All Payments</h3>
                <span>{filteredPayments.length} results</span>
              </div>

              {filteredPayments.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">💳</div>
                  <p>No payments found</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="payments-table">
                    <thead>
                      <tr>
                        <th>Reference</th>
                        <th>Customer</th>
                        <th>Organization</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.map(payment => (
                        <tr key={payment.id}>
                          <td>
                            <code className="ref-badge">{payment.paymentReference || payment.id?.substring(0, 10)}</code>
                          </td>
                          <td>
                            <strong>{payment.Booking?.customerName || 'N/A'}</strong>
                            <div className="sub-text">{payment.Booking?.customerEmail}</div>
                          </td>
                          <td>{payment.Organization?.name || 'N/A'}</td>
                          <td><strong>{formatCurrency(payment.amount)}</strong></td>
                          <td>{payment.paymentMethod || 'N/A'}</td>
                          <td>
                            <span className={`status-badge ${payment.paymentStatus === 'completed' ? 'completed' : payment.paymentStatus === 'failed' ? 'failed' : 'pending'}`}>
                              {payment.paymentStatus === 'completed' ? '✅ Completed' : payment.paymentStatus === 'failed' ? '❌ Failed' : payment.paymentStatus === 'refunded' ? '↩ Refunded' : '⏳ Pending'}
                            </span>
                          </td>
                          <td>{formatDate(payment.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>

          <Footer />
        </div>
      </div>

      <style jsx>{`
        * { box-sizing: border-box; }

        .payments-page {
          min-height: 100vh;
          background: var(--sa-bg, #f5f7fb);
          color: var(--sa-text, #171c2d);
          font-family: Inter, sans-serif;
        }

        .payments-layout {
          display: flex;
          min-height: 100vh;
        }

        .payments-main-wrapper {
          flex: 1;
          min-width: 0;
          margin-left: var(--sa-sidebar-width, 260px);
          display: flex;
          flex-direction: column;
        }

        .payments-content {
          flex: 1;
          padding: 28px;
        }

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

        .status-filter {
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

        .panel-header h3 {
          margin: 0;
          font-size: 15px;
        }

        .panel-header span {
          color: var(--sa-text-muted, #98a2b3);
          font-size: 11px;
        }

        .table-container {
          overflow-x: auto;
        }

        .payments-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        .payments-table th {
          padding: 13px 18px;
          text-align: left;
          color: var(--sa-text-muted, #98a2b3);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid var(--sa-border, #e5e7eb);
          background: var(--sa-surface-2, #f8f9fc);
          white-space: nowrap;
        }

        .payments-table td {
          padding: 14px 18px;
          border-bottom: 1px solid var(--sa-border-light, #edf0f4);
          vertical-align: middle;
        }

        .payments-table tr:last-child td {
          border-bottom: none;
        }

        .payments-table tr:hover td {
          background: var(--sa-surface-hover, #f1f4f9);
        }

        .ref-badge {
          background: var(--sa-surface-2, #f8f9fc);
          border: 1px solid var(--sa-border, #e5e7eb);
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 11px;
          color: var(--sa-text-secondary, #667085);
        }

        .sub-text {
          margin-top: 3px;
          color: var(--sa-text-muted, #98a2b3);
          font-size: 11px;
        }

        .status-badge {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        .status-badge.completed {
          background: #dcfce7;
          color: #16a34a;
        }

        .status-badge.pending {
          background: #fef3c7;
          color: #d97706;
        }

        .status-badge.failed {
          background: #fee2e2;
          color: #dc3545;
        }

        .empty-state {
          padding: 60px 20px;
          text-align: center;
          color: var(--sa-text-muted, #98a2b3);
        }

        .empty-icon {
          font-size: 34px;
          margin-bottom: 12px;
        }

        .empty-state p {
          margin: 0;
          font-size: 14px;
        }

        @media (max-width: 1200px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 900px) {
          .payments-main-wrapper { margin-left: 220px; }
        }

        @media (max-width: 768px) {
          .payments-main-wrapper { margin-left: 0; }
          .payments-content { padding: 18px 14px; }
          .filters-section { flex-direction: column; }
          .status-filter { width: 100%; }
        }

        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
