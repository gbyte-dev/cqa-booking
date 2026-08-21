'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SuperAdminSidebar from '@/components/SuperAdminSidebar';

import { storage } from '@/lib/storage';

import {
  getDashboardStats,
  getOrganizations,
  suspendOrganization,
  reactivateOrganization,
} from '@/lib/superadmin-dashboard';

import './dashboard.css';

export default function SuperAdminDashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [selectedOrg, setSelectedOrg] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const token = storage.getToken();
  const currentUser = storage.getUser();

  useEffect(() => {
    if (
      !token ||
      !currentUser ||
      currentUser.role !== 'superadmin'
    ) {
      router.push('/superadmin/login');
      return;
    }

    setUser(currentUser);
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsResponse, organizationsResponse] =
        await Promise.all([
          getDashboardStats(token),
          getOrganizations(token),
        ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (organizationsResponse.success) {
        setOrganizations(
          organizationsResponse.data || []
        );
      }
    } catch (error) {
      console.error(
        'Dashboard loading error:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const openActionModal = (org) => {
    setSelectedOrg(org);

    setActionType(
      org.subscriptionStatus === 'active'
        ? 'suspend'
        : 'reactivate'
    );
  };

  const closeActionModal = () => {
    if (actionLoading) return;

    setSelectedOrg(null);
    setActionType(null);
  };

  const handleOrganizationAction = async () => {
    if (!selectedOrg || !actionType) {
      return;
    }

    setActionLoading(true);

    try {
      let response;

      if (actionType === 'suspend') {
        response = await suspendOrganization(
          selectedOrg.id,
          token
        );
      } else {
        response = await reactivateOrganization(
          selectedOrg.id,
          token
        );
      }

      if (response.success) {
        closeActionModal();
        await loadDashboard();
      } else {
        alert(
          response.error ||
          'Unable to complete action.'
        );
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (value) => {
    const amount = Number(value || 0);

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getInitial = (name = '') => {
    return (
      name
        ?.trim()
        ?.charAt(0)
        ?.toUpperCase() || 'O'
    );
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-box">
          <div className="loading-spinner" />
          <span>
            Loading Super Admin Dashboard...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-layout">

        {/* SIDEBAR */}
        <SuperAdminSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* MAIN */}
        <div className="dashboard-main-wrapper">

          {/* HEADER */}
          <Header
            title="Super Admin"
            onMenuClick={() =>
              setSidebarOpen(true)
            }
          />

          <main className="dashboard-content">

            {/* PAGE HEADER */}
            <div className="page-heading">
              <div>
                <h2>Dashboard Overview</h2>

                <p>
                  Welcome back,{' '}
                  <strong>
                    {user?.firstName ||
                      'Super Admin'}
                  </strong>
                  . Here's what's happening
                  across your platform.
                </p>
              </div>

              <div className="date-box">
                {new Date().toLocaleDateString(
                  'en-US',
                  {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  }
                )}
              </div>
            </div>

            {/* STAT CARDS */}
            <div className="stats-grid">

              <div className="stat-card">
                <div className="stat-top">
                  <div className="stat-label">
                    Organizations
                  </div>

                  <div className="stat-icon">
                    ▥
                  </div>
                </div>

                <div className="stat-value">
                  {stats?.totalOrganizations ?? 0}
                </div>

                <div className="stat-footer">
                  <span className="stat-description">
                    Registered organizations
                  </span>

                  <span className="stat-positive">
                    Active platform
                  </span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <div className="stat-label">
                    Subscriptions
                  </div>

                  <div className="stat-icon">
                    ◈
                  </div>
                </div>

                <div className="stat-value">
                  {stats?.activeSubscriptions ?? 0}
                </div>

                <div className="stat-footer">
                  <span className="stat-description">
                    Active plans
                  </span>

                  <span className="stat-positive">
                    Live
                  </span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <div className="stat-label">
                    Revenue
                  </div>

                  <div className="stat-icon">
                    $
                  </div>
                </div>

                <div className="stat-value">
                  {formatCurrency(
                    stats?.totalRevenue
                  )}
                </div>

                <div className="stat-footer">
                  <span className="stat-description">
                    Completed payments
                  </span>

                  <span className="stat-positive">
                    Revenue
                  </span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <div className="stat-label">
                    Users
                  </div>

                  <div className="stat-icon">
                    ♙
                  </div>
                </div>

                <div className="stat-value">
                  {stats?.totalUsers ?? 0}
                </div>

                <div className="stat-footer">
                  <span className="stat-description">
                    Platform users
                  </span>

                  <span className="stat-positive">
                    Growing
                  </span>
                </div>
              </div>

            </div>

            {/* DASHBOARD GRID */}
            <div className="dashboard-grid">

              {/* PLATFORM SUMMARY */}
              <section className="panel">
                <div className="panel-header">
                  <h3>
                    Platform Summary
                  </h3>

                  <span>
                    Current overview
                  </span>
                </div>

                <div className="panel-body">
                  <div className="overview-list">

                    <div className="overview-item">
                      <div className="overview-item-left">
                        <div className="overview-item-icon">
                          ▥
                        </div>

                        <div>
                          <strong>
                            Total Organizations
                          </strong>

                          <span>
                            All registered businesses
                          </span>
                        </div>
                      </div>

                      <div className="overview-number">
                        {stats?.totalOrganizations ?? 0}
                      </div>
                    </div>

                    <div className="overview-item">
                      <div className="overview-item-left">
                        <div className="overview-item-icon">
                          ◈
                        </div>

                        <div>
                          <strong>
                            Active Subscriptions
                          </strong>

                          <span>
                            Currently subscribed
                            organizations
                          </span>
                        </div>
                      </div>

                      <div className="overview-number">
                        {stats?.activeSubscriptions ?? 0}
                      </div>
                    </div>

                    <div className="overview-item">
                      <div className="overview-item-left">
                        <div className="overview-item-icon">
                          $
                        </div>

                        <div>
                          <strong>
                            Total Revenue
                          </strong>

                          <span>
                            From completed payments
                          </span>
                        </div>
                      </div>

                      <div className="overview-number">
                        {formatCurrency(
                          stats?.totalRevenue
                        )}
                      </div>
                    </div>

                    <div className="overview-item">
                      <div className="overview-item-left">
                        <div className="overview-item-icon">
                          ♙
                        </div>

                        <div>
                          <strong>
                            Total Users
                          </strong>

                          <span>
                            Across all organizations
                          </span>
                        </div>
                      </div>

                      <div className="overview-number">
                        {stats?.totalUsers ?? 0}
                      </div>
                    </div>

                  </div>
                </div>
              </section>

              {/* QUICK ACTIONS */}
              <section className="panel">
                <div className="panel-header">
                  <h3>
                    Quick Actions
                  </h3>

                  <span>
                    Manage platform
                  </span>
                </div>

                <div className="panel-body">
                  <div className="quick-actions">

                    <button
                      className="quick-action"
                      onClick={() =>
                        router.push(
                          '/superadmin/organizations'
                        )
                      }
                    >
                      <div className="quick-action-icon">
                        ▥
                      </div>

                      <strong>
                        Organizations
                      </strong>

                      <span>
                        Manage tenants
                      </span>
                    </button>

                    <button
                      className="quick-action"
                      onClick={() =>
                        router.push(
                          '/superadmin/subscriptions'
                        )
                      }
                    >
                      <div className="quick-action-icon">
                        ◈
                      </div>

                      <strong>
                        Subscriptions
                      </strong>

                      <span>
                        Manage plans
                      </span>
                    </button>

                    <button
                      className="quick-action"
                      onClick={() =>
                        router.push(
                          '/superadmin/users'
                        )
                      }
                    >
                      <div className="quick-action-icon">
                        ♙
                      </div>

                      <strong>
                        Users
                      </strong>

                      <span>
                        View users
                      </span>
                    </button>

                    <button
                      className="quick-action"
                      onClick={() =>
                        router.push(
                          '/superadmin/reports'
                        )
                      }
                    >
                      <div className="quick-action-icon">
                        ◫
                      </div>

                      <strong>
                        Reports
                      </strong>

                      <span>
                        Platform analytics
                      </span>
                    </button>

                  </div>
                </div>
              </section>

            </div>

            {/* ORGANIZATIONS */}
            <section className="panel table-panel">

              <div className="panel-header">
                <h3>
                  Recent Organizations
                </h3>

                <span>
                  {organizations.length} total
                </span>
              </div>

              {organizations.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    ▥
                  </div>

                  <p>
                    No organizations registered
                    yet.
                  </p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>
                          Organization
                        </th>

                        <th>
                          Plan
                        </th>

                        <th>
                          Status
                        </th>

                        <th>
                          Monthly Fee
                        </th>

                        <th>
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {organizations
                        .slice(0, 8)
                        .map((org) => (
                          <tr key={org.id}>

                            <td>
                              <div className="org-cell">

                                <div className="org-avatar">
                                  {getInitial(
                                    org.name
                                  )}
                                </div>

                                <div>
                                  <div className="org-name">
                                    {org.name}
                                  </div>

                                  <div className="org-slug">
                                    {org.slug}
                                  </div>
                                </div>

                              </div>
                            </td>

                            <td>
                              {org.Subscription
                                ?.plan ||
                                'No Plan'}
                            </td>

                            <td>
                              <span
                                className={`status ${
                                  org.subscriptionStatus ===
                                  'active'
                                    ? 'active'
                                    : 'inactive'
                                }`}
                              >
                                <span>
                                  {org.subscriptionStatus ===
                                  'active'
                                    ? '●'
                                    : '●'}
                                </span>

                                {org.subscriptionStatus ||
                                  'inactive'}
                              </span>
                            </td>

                            <td>
                              <strong>
                                {formatCurrency(
                                  org
                                    .Subscription
                                    ?.monthlyPrice ||
                                    0
                                )}
                              </strong>
                            </td>

                            <td>
                              <button
                                className={`action-btn ${
                                  org.subscriptionStatus ===
                                  'active'
                                    ? 'suspend'
                                    : 'reactivate'
                                }`}
                                onClick={() =>
                                  openActionModal(
                                    org
                                  )
                                }
                              >
                                {org.subscriptionStatus ===
                                'active'
                                  ? 'Suspend'
                                  : 'Reactivate'}
                              </button>
                            </td>

                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

            </section>

          </main>

          <Footer />

        </div>
      </div>

      {/* ACTION MODAL */}
      {selectedOrg && actionType && (
        <div
          className="modal-overlay"
          onClick={closeActionModal}
        >
          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-icon">
              {actionType === 'suspend'
                ? '⚠'
                : '✓'}
            </div>

            <h3>
              {actionType === 'suspend'
                ? 'Suspend Organization'
                : 'Reactivate Organization'}
            </h3>

            <p>
              {actionType === 'suspend'
                ? `Are you sure you want to suspend "${selectedOrg.name}"? Users belonging to this organization may lose access to the platform.`
                : `Are you sure you want to reactivate "${selectedOrg.name}"? Users will regain access to the platform.`}
            </p>

            <div className="modal-actions">

              <button
                className="modal-btn modal-cancel"
                onClick={closeActionModal}
                disabled={actionLoading}
              >
                Cancel
              </button>

              <button
                className={`modal-btn modal-confirm ${
                  actionType === 'reactivate'
                    ? 'reactivate'
                    : ''
                }`}
                onClick={handleOrganizationAction}
                disabled={actionLoading}
              >
                {actionLoading
                  ? 'Processing...'
                  : actionType === 'suspend'
                  ? 'Suspend Organization'
                  : 'Reactivate'}
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}