'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SuperAdminSidebar from '@/components/SuperAdminSidebar';
import { storage } from '@/lib/storage';
import {
  getAllSubscriptions,
  getSubscriptionDetails,
  changePlan,
  cancelSubscription,
  updateAutoRenew,
  getPayments,
  getSubscriptionStats,
} from '@/lib/subscriptions';
import './subscriptions.css';

export default function SubscriptionsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [payments, setPayments] = useState([]);

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [planLoading, setPlanLoading] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  const token = storage.getToken();
  const currentUser = storage.getUser();

  // Check auth
  useEffect(() => {
    if (!token || !currentUser || currentUser.role !== 'superadmin') {
      router.push('/superadmin/login');
      return;
    }
    setUser(currentUser);
    loadData();
  }, []);

  // Load subscriptions and stats
  const loadData = async () => {
    try {
      const [subResponse, statsResponse] = await Promise.all([
        getAllSubscriptions(token),
        getSubscriptionStats(token),
      ]);

      if (subResponse.success) {
        setSubscriptions(subResponse.data || []);
      }

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Load error:', error);
      alert('❌ Error loading subscriptions: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // View details
  const handleViewDetails = async (subscription) => {
    setSelectedSubscription(subscription);
    setShowDetails(true);
    setDetailsLoading(true);

    try {
      const response = await getPayments(subscription.id, token);
      if (response.success) {
        setPayments(response.data || []);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Close details
  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedSubscription(null);
    setPayments([]);
  };

  // Show plan modal
  const handleUpgradePlan = (subscription) => {
    setSelectedSubscription(subscription);
    setSelectedPlan(subscription.plan);
    setShowPlanModal(true);
  };

  // Change plan
  const handleChangePlan = async () => {
    if (selectedPlan === selectedSubscription.plan) {
      alert('⚠️ Please select a different plan');
      return;
    }

    setPlanLoading(true);
    try {
      const response = await changePlan(selectedSubscription.id, selectedPlan, token);
      if (response.success) {
        alert('✅ ' + response.message);
        setShowPlanModal(false);
        await loadData();
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
    } finally {
      setPlanLoading(false);
    }
  };

  // Show cancel modal
  const handleCancelClick = (subscription) => {
    setSelectedSubscription(subscription);
    setCancelReason('');
    setShowCancelModal(true);
  };

  // Cancel subscription
  const handleCancelSubscription = async () => {
    if (!cancelReason.trim()) {
      alert('⚠️ Please provide a reason for cancellation');
      return;
    }

    setCancelLoading(true);
    try {
      const response = await cancelSubscription(selectedSubscription.id, cancelReason, token);
      if (response.success) {
        alert('✅ Subscription cancelled successfully');
        setShowCancelModal(false);
        await loadData();
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
    } finally {
      setCancelLoading(false);
    }
  };

  // Toggle auto-renew
  const handleToggleAutoRenew = async (subscription) => {
    try {
      const response = await updateAutoRenew(subscription.id, !subscription.autoRenew, token);
      if (response.success) {
        alert(`✅ Auto-renew ${!subscription.autoRenew ? 'enabled' : 'disabled'}`);
        await loadData();
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    const amount = Number(value || 0);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="subscriptions-page">
        <div className="loading-state">
          <div className="loading-spinner" />
          <span>Loading Subscriptions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="subscriptions-page">
      <div className="subscriptions-layout">
        <SuperAdminSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="subscriptions-main-wrapper">
          <Header
            title="Subscriptions"
            onMenuClick={() => setSidebarOpen(true)}
          />

          <main className="subscriptions-content">
            {/* Stats Cards */}
            {stats && (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Total Subscriptions</div>
                  <div className="stat-value">{stats.totalSubscriptions}</div>
                  <div className="stat-footer">All active & cancelled</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">Active Subscriptions</div>
                  <div className="stat-value">{stats.activeSubscriptions}</div>
                  <div className="stat-footer">Currently active</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">MRR</div>
                  <div className="stat-value">{formatCurrency(stats.mrr)}</div>
                  <div className="stat-footer">Monthly Recurring Revenue</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">ARR</div>
                  <div className="stat-value">{formatCurrency(stats.arr)}</div>
                  <div className="stat-footer">Annual Recurring Revenue</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">Total Revenue</div>
                  <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
                  <div className="stat-footer">All time collected</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">Churn Rate</div>
                  <div className="stat-value">{stats.churnRate}</div>
                  <div className="stat-footer">Last 30 days</div>
                </div>
              </div>
            )}

            {/* Plan Distribution */}
            {stats && stats.byPlan && (
              <div className="plan-distribution">
                <h3>📊 Plan Distribution</h3>
                <div className="distribution-chart">
                  {stats.byPlan.map((planData) => (
                    <div key={planData.plan} className="plan-bar">
                      <div className="plan-name">
                        {planData.plan.charAt(0).toUpperCase() + planData.plan.slice(1)}
                      </div>
                      <div className="plan-count">{planData.count} subscriptions</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subscriptions Table */}
            <div className="panel">
              <div className="panel-header">
                <h3>All Subscriptions</h3>
                <span>{subscriptions.length} total</span>
              </div>

              {subscriptions.length === 0 ? (
                <div className="empty-state">
                  <p>No subscriptions found</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="subscriptions-table">
                    <thead>
                      <tr>
                        <th>Organization</th>
                        <th>Plan</th>
                        <th>Status</th>
                        <th>Monthly Fee</th>
                        <th>Auto-Renew</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscriptions.map((subscription) => (
                        <tr key={subscription.id}>
                          <td>
                            <strong>{subscription.Organization?.name || 'N/A'}</strong>
                            <div className="org-info">
                              {subscription.Organization?.slug}
                            </div>
                          </td>
                          <td>
                            <span className={`plan-badge ${subscription.plan}`}>
                              {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
                            </span>
                          </td>
                          <td>
                            <span className={`status ${subscription.status}`}>
                              {subscription.status === 'active' ? '✅ Active' : '❌ Cancelled'}
                            </span>
                          </td>
                          <td>{formatCurrency(subscription.monthlyPrice)}</td>
                          <td>
                            <button
                              className={`toggle-btn ${subscription.autoRenew ? 'enabled' : 'disabled'}`}
                              onClick={() => handleToggleAutoRenew(subscription)}
                              title="Toggle auto-renew"
                            >
                              {subscription.autoRenew ? '🔄' : '⏸️'}
                            </button>
                          </td>
                          <td>{formatDate(subscription.startDate)}</td>
                          <td>{formatDate(subscription.endDate)}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="action-btn details-btn"
                                onClick={() => handleViewDetails(subscription)}
                                title="View Details"
                              >
                                📋
                              </button>
                              {subscription.status === 'active' && (
                                <>
                                  <button
                                    className="action-btn upgrade-btn"
                                    onClick={() => handleUpgradePlan(subscription)}
                                    title="Change Plan"
                                  >
                                    📈
                                  </button>
                                  <button
                                    className="action-btn cancel-btn"
                                    onClick={() => handleCancelClick(subscription)}
                                    title="Cancel"
                                  >
                                    ❌
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
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

      {/* DETAILS MODAL */}
      {showDetails && selectedSubscription && (
        <div className="modal-overlay" onClick={handleCloseDetails}>
          <div className="modal details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Subscription Details</h2>
              <button className="close-btn" onClick={handleCloseDetails}>✕</button>
            </div>

            {detailsLoading ? (
              <div className="loading-state">
                <div className="loading-spinner" />
                <span>Loading...</span>
              </div>
            ) : (
              <>
                {/* Subscription Info */}
                <div className="subscription-info">
                  <div className="info-row">
                    <span className="label">Organization:</span>
                    <span className="value">{selectedSubscription.Organization?.name}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Plan:</span>
                    <span className="value">{selectedSubscription.plan}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Monthly Price:</span>
                    <span className="value">{formatCurrency(selectedSubscription.monthlyPrice)}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Max Venues:</span>
                    <span className="value">{selectedSubscription.maxVenues}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Max Staff:</span>
                    <span className="value">{selectedSubscription.maxStaff}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Max Bookings/Day:</span>
                    <span className="value">{selectedSubscription.maxBookingsPerDay}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Start Date:</span>
                    <span className="value">{formatDate(selectedSubscription.startDate)}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">End Date:</span>
                    <span className="value">{formatDate(selectedSubscription.endDate)}</span>
                  </div>
                </div>

                {/* Payment History */}
                <div className="payment-history">
                  <h3>💰 Payment History</h3>
                  {payments.length === 0 ? (
                    <p>No payments found</p>
                  ) : (
                    <div className="payments-list">
                      {payments.map((payment) => (
                        <div key={payment.id} className="payment-item">
                          <div className="payment-info">
                            <div className="payment-amount">{formatCurrency(payment.amount)}</div>
                            <div className="payment-date">{formatDate(payment.createdAt)}</div>
                          </div>
                          <div className="payment-status">
                            <span className={`status-badge ${payment.paymentStatus}`}>
                              {payment.paymentStatus === 'completed' ? '✅' : '⏳'} {payment.paymentStatus}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* PLAN MODAL */}
      {showPlanModal && selectedSubscription && (
        <div className="modal-overlay" onClick={() => setShowPlanModal(false)}>
          <div className="modal plan-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📈 Change Plan</h2>
              <button className="close-btn" onClick={() => setShowPlanModal(false)}>✕</button>
            </div>

            <div className="plan-options">
              {['starter', 'professional', 'enterprise'].map((plan) => {
                const prices = {
                  starter: 200,
                  professional: 500,
                  enterprise: 2000
                };
                const features = {
                  starter: { venues: 1, staff: 5, bookings: 50 },
                  professional: { venues: 5, staff: 20, bookings: 200 },
                  enterprise: { venues: 999, staff: 999, bookings: 9999 }
                };

                return (
                  <div
                    key={plan}
                    className={`plan-option ${selectedPlan === plan ? 'selected' : ''}`}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <div className="plan-name">
                      {plan.charAt(0).toUpperCase() + plan.slice(1)}
                    </div>
                    <div className="plan-price">{formatCurrency(prices[plan])}/month</div>
                    <div className="plan-features">
                      <div>🏢 {features[plan].venues} venues</div>
                      <div>👥 {features[plan].staff} staff</div>
                      <div>📋 {features[plan].bookings} bookings/day</div>
                    </div>
                    <div className="plan-radio">
                      <input
                        type="radio"
                        name="plan"
                        value={plan}
                        checked={selectedPlan === plan}
                        onChange={() => setSelectedPlan(plan)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowPlanModal(false)}
                disabled={planLoading}
              >
                Cancel
              </button>
              <button
                className="btn-submit"
                onClick={handleChangePlan}
                disabled={planLoading}
              >
                {planLoading ? 'Processing...' : '✅ Change Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL MODAL */}
      {showCancelModal && selectedSubscription && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal cancel-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>❌ Cancel Subscription</h2>
              <button className="close-btn" onClick={() => setShowCancelModal(false)}>✕</button>
            </div>

            <div className="cancel-content">
              <p>
                Are you sure you want to cancel the subscription for{' '}
                <strong>{selectedSubscription.Organization?.name}</strong>?
              </p>
              <p className="warning">⚠️ This will suspend the organization immediately.</p>

              <div className="form-group">
                <label>Reason for Cancellation *</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please provide a reason for cancelling this subscription..."
                  rows="4"
                  disabled={cancelLoading}
                />
              </div>

              <div className="modal-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelLoading}
                >
                  Keep Subscription
                </button>
                <button
                  className="btn-cancel-confirm"
                  onClick={handleCancelSubscription}
                  disabled={cancelLoading}
                >
                  {cancelLoading ? 'Cancelling...' : '❌ Cancel Subscription'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}