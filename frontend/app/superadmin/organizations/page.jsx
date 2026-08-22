'use client';
import AppIcon from '@/components/AppIcon';
import { confirmAction, notify } from '@/lib/alerts';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import {
  getAllOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  suspendOrganization,
  reactivateOrganization,
} from '@/lib/organizations';

export default function OrganizationsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    timezone: 'UTC',
    maxVenues: 1,
  });

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

  // Handle Add Click
  const handleAddClick = () => {
    setFormMode('add');
    setSelectedOrg(null);
    setFormData({
      name: '',
      slug: '',
      timezone: 'UTC',
      maxVenues: 1,
    });
    setFormError('');
    setShowForm(true);
  };

  // Handle Edit Click
  const handleEditClick = (org) => {
    setFormMode('edit');
    setSelectedOrg(org);
    setFormData({
      name: org.name,
      slug: org.slug,
      timezone: org.timezone,
      maxVenues: org.maxVenues,
    });
    setFormError('');
    setShowForm(true);
  };

  // Handle Close Form
  const handleCloseForm = () => {
    setShowForm(false);
    setFormError('');
  };

  // Handle Form Change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'maxVenues' ? parseInt(value) : value,
    });
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      if (!formData.name.trim()) {
        setFormError('Organization name is required');
        setFormLoading(false);
        return;
      }

      if (!formData.slug.trim()) {
        setFormError('Slug is required');
        setFormLoading(false);
        return;
      }

      let response;

      if (formMode === 'add') {
        response = await createOrganization(formData, token);
      } else {
        response = await updateOrganization(selectedOrg.id, formData, token);
      }

      if (response.success) {
        notify(
          formMode === 'add'
            ? 'Organization created successfully'
            : 'Organization updated successfully'
        );
        handleCloseForm();
        await loadOrganizations();
      } else {
        setFormError(response.error || 'Something went wrong');
      }
    } catch (error) {
      setFormError(error.message);
    } finally {
      setFormLoading(false);
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
              <button className="add-btn" onClick={handleAddClick}>
                <AppIcon name="add" /> Add Organization
              </button>
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
                  <button
                    className="empty-action-btn"
                    onClick={handleAddClick}
                  >
                    <AppIcon name="add" /> Create First Organization
                  </button>
                </div>
              ) : (
                <div className="table-container">
                  <table className="organizations-table">
                    <thead>
                      <tr>
                        <th>Organization</th>
                        {/* <th>Slug</th> */}
                        <th>Timezone</th>
                        <th>Plan</th>
                        <th>Status</th>
                        <th>Monthly Fee</th>
                        <th>Max Venues</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {organizations.map((org) => (
                        <tr key={org.id}>
                          <td>
                            <div
                              className="org-cell"
                              onClick={() => handleEditClick(org)}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="org-avatar">
                                {getInitial(org.name)}
                              </div>
                              <div>
                                <div className="org-name">{org.name}</div>
                                <div className="org-id">
                                  {org.id.substring(0, 8)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          {/* <td>
                            <code className="slug-badge">{org.slug}</code>
                          </td> */}
                          <td>{org.timezone}</td>
                          <td>{org.Subscription?.plan || 'No Plan'}</td>
                          <td>
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
                          <td>
                            <strong>
                              {formatCurrency(
                                org.Subscription?.monthlyPrice || 0
                              )}
                            </strong>
                          </td>
                          <td>{org.maxVenues}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="action-btn edit-btn"
                                onClick={() => handleEditClick(org)}
                                title="Edit"
                              >
                                <AppIcon name="edit" />
                              </button>
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

      {/* FORM MODAL */}
      {showForm && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                {formMode === 'add'
                  ? 'Add Organization'
                  : 'Edit Organization'}
              </h2>
              <button className="close-btn" onClick={handleCloseForm}>
                <AppIcon name="close" />
              </button>
            </div>

            {formError && (
              <div className="form-error"><AppIcon name="cancel" /> {formError}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Organization Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="e.g., Pizza Palace"
                  required
                  disabled={formLoading}
                />
              </div>

              <div className="form-group">
                <label>Slug *</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleFormChange}
                  placeholder="e.g., pizza-palace"
                  required
                  disabled={formLoading}
                />
                <small>Unique identifier for the organization</small>
              </div>

              <div className="form-group">
                <label>Timezone</label>
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleFormChange}
                  disabled={formLoading}
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="Asia/Tokyo">Asia/Tokyo</option>
                  <option value="Asia/Kolkata">Asia/Kolkata</option>
                  <option value="Australia/Sydney">Australia/Sydney</option>
                </select>
              </div>

              <div className="form-group">
                <label>Max Venues</label>
                <input
                  type="number"
                  name="maxVenues"
                  value={formData.maxVenues}
                  onChange={handleFormChange}
                  min="1"
                  disabled={formLoading}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCloseForm}
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={formLoading}
                >
                  {formLoading
                    ? 'Processing...'
                    : formMode === 'add'
                    ? 'Create'
                    : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
