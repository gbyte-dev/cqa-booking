'use client';
import AppIcon from '@/components/AppIcon';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';

export default function TenantBillingPage() {
  const router = useRouter();
  const mountedRef = useRef(false);

  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = storage.getToken();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    if (!token) {
      router.replace('/login');
      return;
    }

    loadOrg();
  }, []);

  const loadOrg = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/organizations/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setOrg(data.data);
    } catch (error) {    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        <span>Loading Billing...</span>
      </div>
    );
  }

  const sub = org?.Subscription;

  return (
    <>
      <main className="billing-content">
            <div className="page-header">
              <h2><AppIcon name="creditCard" /> Billing</h2>
              <p>Your current subscription plan.</p>
            </div>

            {!sub ? (
              <div className="panel">
                <div className="empty-state">
                  <p>No active subscription found. Contact platform support for billing questions.</p>
                </div>
              </div>
            ) : (
              <div className="panel">
                <div className="panel-header">
                  <h3>Current Plan</h3>
                  <span className={`status-badge ${sub.status}`}>{sub.status}</span>
                </div>
                <div className="plan-body">
                  <div className="plan-row">
                    <span>Plan</span>
                    <strong>{sub.planName || sub.plan || 'N/A'}</strong>
                  </div>
                  <div className="plan-row">
                    <span>Monthly Price</span>
                    <strong>${sub.monthlyPrice}</strong>
                  </div>
                  <div className="plan-row">
                    <span>Max Venues</span>
                    <strong>{sub.maxOutlets ?? 'N/A'}</strong>
                  </div>
                  <div className="plan-row">
                    <span>Max Staff</span>
                    <strong>{sub.maxUsers ?? 'N/A'}</strong>
                  </div>
                  <div className="plan-row">
                    <span>Max Bookings/Day</span>
                    <strong>{sub.maxReservations ?? 'N/A'}</strong>
                  </div>
                  <div className="plan-row">
                    <span>Start Date</span>
                    <strong>{formatDate(sub.startDate)}</strong>
                  </div>
                  <div className="plan-row">
                    <span>Auto-Renew</span>
                    <strong>{sub.autoRenew ? 'Yes' : 'No'}</strong>
                  </div>
                </div>
                <div className="plan-footer">
                  <p>To upgrade or cancel your plan, please contact platform support.</p>
                </div>
              </div>
            )}
      </main>

      <style jsx>{`
        .billing-page { min-height: 100vh; background: var(--tenant-bg, #f5f7fb); color: var(--tenant-text, #171c2d); }
        .billing-layout { display: flex; min-height: 100vh; }
        .billing-main-wrapper { flex: 1; min-width: 0; margin-left: var(--tenant-sidebar-width, 260px); display: flex; flex-direction: column; }
        .billing-content { flex: 1; padding: 28px; max-width: 700px; overflow-y: auto; }
        .loading-state { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; color: var(--tenant-text-secondary, #667085); }
        .loading-spinner { width: 36px; height: 36px; border: 4px solid var(--tenant-border, #e5e7eb); border-top-color: var(--tenant-primary, #667eea); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .page-header { margin-bottom: 24px; }
        .page-header h2 { margin: 0; font-size: 26px; color: var(--tenant-text, #171c2d); }
        .page-header p { margin: 6px 0 0; color: var(--tenant-text-secondary, #667085); font-size: 13px; }
        .panel { background: var(--tenant-surface, #fff); border: 1px solid var(--tenant-border-light, #edf0f4); border-radius: 12px; overflow: hidden; box-shadow: var(--tenant-shadow-sm, 0 2px 8px rgba(15,23,42,0.05)); transition: box-shadow 0.2s ease; }
        .panel:hover { box-shadow: var(--tenant-shadow-md, 0 8px 24px rgba(15,23,42,0.08)); }
        .panel-header { padding: 0 22px; min-height: 60px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--tenant-border, #e5e7eb); }
        .panel-header h3 { margin: 0; font-size: 15px; font-weight: 600; color: var(--tenant-text, #171c2d); }
        .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: capitalize; background: var(--tenant-success-bg, #dcfce7); color: var(--tenant-success, #16a34a); }
        .status-badge.cancelled { background: var(--tenant-danger-bg, #fee2e2); color: var(--tenant-danger, #dc3545); }
        .plan-body { padding: 22px; }
        .plan-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--tenant-border-light, #edf0f4); font-size: 13px; color: var(--tenant-text, #171c2d); }
        .plan-row:last-child { border-bottom: none; }
        .plan-row span { color: var(--tenant-text-secondary, #667085); }
        .plan-footer { padding: 16px 22px; border-top: 1px solid var(--tenant-border-light, #edf0f4); }
        .plan-footer p { margin: 0; color: var(--tenant-text-muted, #98a2b3); font-size: 12px; }
        .empty-state { padding: 40px 20px; text-align: center; color: var(--tenant-text-muted, #98a2b3); font-size: 13px; }
        @media (max-width: 900px) {
          .billing-main-wrapper { margin-left: 0; }
          .billing-content { padding: 18px 14px; }
        }
      `}</style>
    </>
  );
}
