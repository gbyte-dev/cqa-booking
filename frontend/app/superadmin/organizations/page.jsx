'use client';
import AppIcon from '@/components/AppIcon';
import { confirmAction, notify } from '@/lib/alerts';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import {
  getAllOrganizations,
  deleteOrganization,
  suspendOrganization,
  reactivateOrganization,
} from '@/lib/organizations';

export default function OrganizationsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = storage.getToken();
  const currentUser = storage.getUser();

  // Check authentication
  useEffect(() => {
    // Check auth once on mount
    if (!token || !currentUser || currentUser.role !== 'superadmin') {
        router.push('/login');
        return;
    }
    
    setUser(currentUser);
    loadOrganizations();
    }, []);

  // Load organizations
  const loadOrganizations = async () => {
    try {
      const response = await getAllOrganizations(token);
      if (response.success) {
        setOrganizations(response.data || []);
      }
    } catch (error) {
      notify('Error loading organizations: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Suspend
  const handleSuspend = async (org) => {
    if (!(await confirmAction({ title: `Suspend ${org.name}?`, text: 'The organization will no longer be active.', confirmText: 'Suspend' }))) return;

    try {
      const response = await suspendOrganization(org.id, token);
      if (response.success) {
        notify('Organization suspended');
        await loadOrganizations();
      }
    } catch (error) {
      notify('Error: ' + error.message);
    }
  };

  // Handle Reactivate
  const handleReactivate = async (org) => {
    if (!(await confirmAction({ title: `Reactivate ${org.name}?`, text: 'The organization will regain access.', confirmText: 'Reactivate' }))) return;

    try {
      const response = await reactivateOrganization(org.id, token);
      if (response.success) {
        notify('Organization reactivated');
        await loadOrganizations();
      }
    } catch (error) {
      notify('Error: ' + error.message);
    }
  };

  // Handle Delete
  const handleDelete = async (org) => {
    if (!(await confirmAction({ title: `Delete ${org.name}?`, text: 'This action cannot be undone.', confirmText: 'Delete organization', danger: true }))) return;

    try {
      const response = await deleteOrganization(org.id, token);
      if (response.success) {
        notify('Organization deleted');
        await loadOrganizations();
      }
    } catch (error) {
      notify('Error: ' + error.message);
    }
  };

  // Format Currency
  const formatCurrency = (value) => {
    const amount = Number(value || 0);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get Initial
  const getInitial = (name = '') => {
    return name?.trim()?.charAt(0)?.toUpperCase() || 'O';
  };

  // Loading State
  if (loading) {
    return (
      <div className="organizations-page">
        <div className="loading-state">
          <div className="loading-spinner" />
          <span>Loading Organizations...</span>
        </div>
      </div>
    );
  }

  // Main Render
  return (
    <>
      <main className="organizations-content">
            <div className="page-header">
              <div>
                <h2>Manage Organizations</h2>
                <p>
                  View and manage all registered organizations on the platform.
                </p>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h3>All Organizations</h3>
                <span>{organizations.length} total</span>
              </div>

              {organizations.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><AppIcon name="building" /></div>
                  <p>No organizations found</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="organizations-table" style={{ tableLayout: 'fixed' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '16.66%' }}>Organization</th>
                        <th className="text-center" style={{ width: '16.66%' }}>Email</th>
                        {/* <th>Slug</th> */}
                        {/* <th>Timezone</th> */}
                        <th className="text-center" style={{ width: '16.66%' }}>Plan</th>
                        <th className="text-center" style={{ width: '16.66%' }}>Status</th>
                        <th className="text-center" style={{ width: '16.66%' }}>Monthly Fee</th>
                        {/* <th>Max Venues</th> */}
                        <th className="text-center" style={{ width: '16.66%' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {organizations.map((org) => (
                        <tr key={org.id}>
                          <td>
                            <div className="org-cell">
                              <div className="org-avatar">
                                {getInitial(org.name)}
                              </div>
                              <div>
                                <div className="org-name">{org.name}</div>
                                <div className="org-id">
                                  {org.ownerName || `${org.id.substring(0, 8)}...`}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="text-center">{org.ownerEmail || '—'}</td>
                          {/* <td>
                            <code className="slug-badge">{org.slug}</code>
                          </td> */}
                          {/* <td>{org.timezone}</td> */}
                          <td className="text-center">{org.Subscription?.plan || 'No Plan'}</td>
                          <td className="text-center">
                            <span
                              className={`status ${
                                org.subscriptionStatus === 'active'
                                  ? 'active'
                                  : 'suspended'
                              }`}
                            >
                              {org.subscriptionStatus === 'active'
                                ? 'Active'
                                : 'Suspended'}
                            </span>
                          </td>
                          <td className="text-center">
                            <strong>
                              {formatCurrency(
                                org.Subscription?.monthlyPrice || 0
                              )}
                            </strong>
                          </td>
                          {/* <td>{org.maxVenues}</td> */}
                          <td className="text-center">
                            <div className="action-buttons" style={{ justifyContent: 'center' }}>
                              {org.subscriptionStatus === 'active' ? (
                                <button
                                  className="action-btn suspend-btn"
                                  onClick={() => handleSuspend(org)}
                                  title="Suspend"
                                >
                                  <AppIcon name="lock" />
                                </button>
                              ) : (
                                <button
                                  className="action-btn reactivate-btn"
                                  onClick={() => handleReactivate(org)}
                                  title="Reactivate"
                                >
                                  <AppIcon name="checkCircle" />
                                </button>
                              )}
                              <button
                                className="action-btn delete-btn"
                                onClick={() => handleDelete(org)}
                                title="Delete"
                              >
                                <AppIcon name="trash" />
                              </button>
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
    </>
  );
}
