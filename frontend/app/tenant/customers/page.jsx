'use client';
import AppIcon from '@/components/AppIcon';
import { confirmAction, notify } from '@/lib/alerts';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import {
  getTenantCustomers,
  getTenantCustomerProfile,
  getTenantCustomerBookings,
  updateTenantCustomerProfile,
  suspendTenantCustomer,
  activateTenantCustomer,
  deleteTenantCustomer
} from '@/lib/tenant-customers';

export default function TenantCustomersPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showBookings, setShowBookings] = useState(false);
  const [customerBookings, setCustomerBookings] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  const token = storage.getToken();
  const currentUser = storage.getUser();

  // Helper function to check if customer is suspended
  const isSuspended = (customer) => customer.status === 'suspended';
  const getCustomerStatus = (customer) => isSuspended(customer) ? 'suspended' : 'active';

  useEffect(() => {
    if (!token || !currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await getTenantCustomers(token);
      if (response.success) {
        setCustomers(response.data || []);
      }
    } catch (error) {    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = async (customer) => {
    setSelectedCustomer(customer);
    setShowProfile(true);
    setEditMode(false);
  };

  const startEdit = () => {
    setEditForm({
      firstName: selectedCustomer.firstName || '',
      lastName: selectedCustomer.lastName || '',
      email: selectedCustomer.email || '',
      phone: selectedCustomer.phone || '',
      dateOfBirth: selectedCustomer.dateOfBirth
        ? selectedCustomer.dateOfBirth.substring(0, 10)
        : '',
      gender: selectedCustomer.gender || '',
      customerType: selectedCustomer.customerType || 'regular',
      preferredContactMethod: selectedCustomer.preferredContactMethod || '',
      marketingConsent: !!selectedCustomer.marketingConsent,
      notes: selectedCustomer.notes || '',
      isVip: !!selectedCustomer.isVip,
      tags: Array.isArray(selectedCustomer.tags) ? selectedCustomer.tags.join(', ') : '',
      anniversaryDate: selectedCustomer.anniversaryDate
        ? selectedCustomer.anniversaryDate.substring(0, 10)
        : ''
    });
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditForm(null);
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const saveEdit = async () => {
    setEditSaving(true);
    try {
      const payload = {
        ...editForm,
        tags: editForm.tags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean)
      };

      const response = await updateTenantCustomerProfile(selectedCustomer.id, payload, token);
      if (response.success) {
        setSelectedCustomer(response.data);
        setEditMode(false);
        setEditForm(null);
        await loadCustomers();
      }
    } catch (error) {
      notify('Error: ' + error.message);
    } finally {
      setEditSaving(false);
    }
  };

  const handleViewBookings = async (customer) => {
    try {
      const response = await getTenantCustomerBookings(customer.id, token);
      if (response.success) {
        setCustomerBookings(response);
        setSelectedCustomer(customer);
        setShowBookings(true);
      }
    } catch (error) {
      notify('Error: ' + error.message);
    }
  };

  const handleSuspend = async (customerId) => {
    if (!(await confirmAction({ title: 'Suspend customer?', text: 'The customer will no longer be able to use their account.', confirmText: 'Suspend' }))) return;

    setActionLoading(true);
    try {
      const response = await suspendTenantCustomer(customerId, token);
      if (response.success) {
        notify('Customer suspended');
        await loadCustomers();
      }
    } catch (error) {
      notify('Error: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async (customerId) => {
    if (!(await confirmAction({ title: 'Activate customer?', text: 'The customer will regain access to their account.', confirmText: 'Activate' }))) return;

    setActionLoading(true);
    try {
      const response = await activateTenantCustomer(customerId, token);
      if (response.success) {
        notify('Customer activated');
        await loadCustomers();
      }
    } catch (error) {
      notify('Error: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (customerId) => {
    if (!(await confirmAction({ title: 'Delete customer?', text: 'This action cannot be undone.', confirmText: 'Delete customer', danger: true }))) return;

    setActionLoading(true);
    try {
      const response = await deleteTenantCustomer(customerId, token);
      if (response.success) {
        notify('Customer deleted');
        await loadCustomers();
      }
    } catch (error) {
      notify('Error: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm);

    // Updated status filter logic
    const matchesStatus = 
      filterStatus === 'all' || 
      getCustomerStatus(customer) === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        <span>Loading Customers...</span>
      </div>
    );
  }

  return (
    <>
      <main className="customers-content">
            <div className="customers-header">
              <div>
                <h2><AppIcon name="users" /> Customers</h2>
                <p>Manage your restaurant customers and their profiles</p>
              </div>
              <div className="header-stats">
                <div className="stat">
                  <span className="label">Total</span>
                  <span className="value">{customers.length}</span>
                </div>
                <div className="stat">
                  <span className="label">Active</span>
                  <span className="value">
                    {customers.filter(c => !isSuspended(c)).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
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
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* Customers Table */}
            {filteredCustomers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><AppIcon name="users" /></div>
                <p>No customers found</p>
              </div>
            ) : (
              <div className="panel">
                <div className="panel-header">
                  <h3>All Customers ({filteredCustomers.length})</h3>
                </div>

                <div className="table-container">
                  <table className="customers-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Type</th>
                        <th>Bookings</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map(customer => (
                        <tr key={customer.id}>
                          <td>
                            <div className="customer-name">
                              <div className="avatar">
                                {customer.firstName?.charAt(0).toUpperCase() || 'C'}
                              </div>
                              <div>
                                <strong>
                                  {customer.firstName} {customer.lastName}
                                  {customer.isVip && (
                                    <span className="vip-badge"> <AppIcon name="star" /> VIP</span>
                                  )}
                                </strong>
                                {Array.isArray(customer.tags) && customer.tags.length > 0 && (
                                  <div className="tags-row">
                                    {customer.tags.map((tag, i) => (
                                      <span className="tag-pill" key={i}>{tag}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>{customer.email || 'N/A'}</td>
                          <td>{customer.phone || 'N/A'}</td>
                          <td>
                            <span className="customer-type">
                              {customer.customerType || 'Regular'}
                            </span>
                          </td>
                          <td>
                            <span className="bookings-count">
                              {customer.totalBookings || 0}
                            </span>
                          </td>
                          <td>
                            {/* Updated status badge logic */}
                            <span 
                              className={`status-badge ${getCustomerStatus(customer)}`}
                            >
                              {isSuspended(customer) ? 'Suspended' : 'Active'}
                            </span>
                          </td>
                          <td>
                            {customer.created_at 
                              ? new Date(customer.created_at).toLocaleDateString() 
                              : 'N/A'
                            }
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn-view"
                                onClick={() => handleViewProfile(customer)}
                                title="View Profile"
                              >
                                <AppIcon name="eye" />
                              </button>
                              <button
                                className="btn-bookings"
                                onClick={() => handleViewBookings(customer)}
                                title="View Bookings"
                              >
                                <AppIcon name="bookings" />
                              </button>
                              {/* Updated suspend/activate logic */}
                              {isSuspended(customer) ? (
                                <button
                                  className="btn-activate"
                                  onClick={() => handleActivate(customer.id)}
                                  disabled={actionLoading}
                                  title="Activate"
                                >
                                  <AppIcon name="checkCircle" />
                                </button>
                              ) : (
                                <button
                                  className="btn-suspend"
                                  onClick={() => handleSuspend(customer.id)}
                                  disabled={actionLoading}
                                  title="Suspend"
                                >
                                  <AppIcon name="ban" />
                                </button>
                              )}
                              <button
                                className="btn-delete"
                                onClick={() => handleDelete(customer.id)}
                                disabled={actionLoading}
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
              </div>
            )}
      </main>

      {/* ===== PROFILE MODAL ===== */}
      {showProfile && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="modal profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><AppIcon name="user" /> Customer Profile</h2>
              <button className="close-btn" onClick={() => setShowProfile(false)}><AppIcon name="close" /></button>
            </div>

            <div className="profile-content">
              <div className="profile-section">
                <div className="profile-avatar-large">
                  {selectedCustomer.firstName?.charAt(0).toUpperCase() || 'C'}
                </div>
                <div className="profile-name">
                  {selectedCustomer.firstName} {selectedCustomer.lastName}
                  {selectedCustomer.isVip && (
                    <span className="vip-badge"> <AppIcon name="star" /> VIP</span>
                  )}
                </div>
                <div className="profile-status">
                  <span className={`badge ${getCustomerStatus(selectedCustomer)}`}>
                    {isSuspended(selectedCustomer) ? 'Suspended' : 'Active'}
                  </span>
                </div>
                {Array.isArray(selectedCustomer.tags) && selectedCustomer.tags.length > 0 && (
                  <div className="tags-row">
                    {selectedCustomer.tags.map((tag, i) => (
                      <span className="tag-pill" key={i}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              {!editMode ? (
                <>
                  <div className="profile-details">
                    <div className="detail-row">
                      <span className="label">Email:</span>
                      <span className="value">{selectedCustomer.email || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Phone:</span>
                      <span className="value">{selectedCustomer.phone || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Gender:</span>
                      <span className="value">{selectedCustomer.gender || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Customer Type:</span>
                      <span className="value">{selectedCustomer.customerType || 'Regular'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Anniversary:</span>
                      <span className="value">
                        {selectedCustomer.anniversaryDate
                          ? new Date(selectedCustomer.anniversaryDate).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Total Bookings:</span>
                      <span className="value">{selectedCustomer.totalBookings || 0}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Total Spent:</span>
                      <span className="value">â‚¹{selectedCustomer.totalSpent || 0}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Joined:</span>
                      <span className="value">
                        {selectedCustomer.created_at
                          ? new Date(selectedCustomer.created_at).toLocaleDateString()
                          : 'N/A'
                        }
                      </span>
                    </div>
                    {selectedCustomer.notes && (
                      <div className="detail-row">
                        <span className="label">Notes:</span>
                        <span className="value">{selectedCustomer.notes}</span>
                      </div>
                    )}
                  </div>

                  <div className="profile-actions">
                    <button className="btn-primary" onClick={startEdit}>
                      <AppIcon name="edit" /> Edit Profile
                    </button>
                    <button
                      className="btn-primary"
                      onClick={() => {
                        setShowProfile(false);
                        handleViewBookings(selectedCustomer);
                      }}
                    >
                      <AppIcon name="bookings" /> View Bookings
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => setShowProfile(false)}
                    >
                      Close
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="profile-details edit-form">
                    <div className="detail-row">
                      <span className="label">First Name:</span>
                      <input
                        type="text"
                        value={editForm.firstName}
                        onChange={(e) => handleEditChange('firstName', e.target.value)}
                      />
                    </div>
                    <div className="detail-row">
                      <span className="label">Last Name:</span>
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) => handleEditChange('lastName', e.target.value)}
                      />
                    </div>
                    <div className="detail-row">
                      <span className="label">Email:</span>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => handleEditChange('email', e.target.value)}
                      />
                    </div>
                    <div className="detail-row">
                      <span className="label">Phone:</span>
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) => handleEditChange('phone', e.target.value)}
                      />
                    </div>
                    <div className="detail-row">
                      <span className="label">Date of Birth:</span>
                      <input
                        type="date"
                        value={editForm.dateOfBirth}
                        onChange={(e) => handleEditChange('dateOfBirth', e.target.value)}
                      />
                    </div>
                    <div className="detail-row">
                      <span className="label">Anniversary:</span>
                      <input
                        type="date"
                        value={editForm.anniversaryDate}
                        onChange={(e) => handleEditChange('anniversaryDate', e.target.value)}
                      />
                    </div>
                    <div className="detail-row">
                      <span className="label">Gender:</span>
                      <select
                        value={editForm.gender}
                        onChange={(e) => handleEditChange('gender', e.target.value)}
                      >
                        <option value="">N/A</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="detail-row">
                      <span className="label">Customer Type:</span>
                      <select
                        value={editForm.customerType}
                        onChange={(e) => handleEditChange('customerType', e.target.value)}
                      >
                        <option value="regular">Regular</option>
                        <option value="new">New</option>
                        <option value="frequent">Frequent</option>
                      </select>
                    </div>
                    <div className="detail-row">
                      <span className="label">Preferred Contact:</span>
                      <select
                        value={editForm.preferredContactMethod}
                        onChange={(e) => handleEditChange('preferredContactMethod', e.target.value)}
                      >
                        <option value="">N/A</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="sms">SMS</option>
                      </select>
                    </div>
                    <div className="detail-row">
                      <span className="label">Marketing Consent:</span>
                      <input
                        type="checkbox"
                        checked={editForm.marketingConsent}
                        onChange={(e) => handleEditChange('marketingConsent', e.target.checked)}
                      />
                    </div>
                    <div className="detail-row">
                      <span className="label">VIP Customer:</span>
                      <input
                        type="checkbox"
                        checked={editForm.isVip}
                        onChange={(e) => handleEditChange('isVip', e.target.checked)}
                      />
                    </div>
                    <div className="detail-row">
                      <span className="label">Tags (comma separated):</span>
                      <input
                        type="text"
                        value={editForm.tags}
                        placeholder="e.g. regular, allergic"
                        onChange={(e) => handleEditChange('tags', e.target.value)}
                      />
                    </div>
                    <div className="detail-row">
                      <span className="label">Notes:</span>
                      <textarea
                        value={editForm.notes}
                        onChange={(e) => handleEditChange('notes', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="profile-actions">
                    <button
                      className="btn-primary"
                      onClick={saveEdit}
                      disabled={editSaving}
                    >
                      {editSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={cancelEdit}
                      disabled={editSaving}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== BOOKINGS MODAL ===== */}
      {showBookings && selectedCustomer && customerBookings && (
        <div className="modal-overlay" onClick={() => setShowBookings(false)}>
          <div className="modal bookings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><AppIcon name="bookings" /> {selectedCustomer.firstName}'s Bookings</h2>
              <button className="close-btn" onClick={() => setShowBookings(false)}><AppIcon name="close" /></button>
            </div>

            <div className="bookings-content">
              {customerBookings.stats && (
                <div className="bookings-stats">
                  <div className="stat">
                    <span className="label">Total Bookings</span>
                    <span className="value">{customerBookings.stats.totalBookings || 0}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Completed</span>
                    <span className="value">{customerBookings.stats.completedBookings || 0}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Pending</span>
                    <span className="value">
                      {customerBookings.stats.totalBookings - 
                       (customerBookings.stats.completedBookings || 0) - 
                       (customerBookings.stats.cancelledBookings || 0)}
                    </span>
                  </div>
                  <div className="stat">
                    <span className="label">Cancelled</span>
                    <span className="value">{customerBookings.stats.cancelledBookings || 0}</span>
                  </div>
                </div>
              )}

              {customerBookings.data && customerBookings.data.length > 0 ? (
                <div className="bookings-list">
                  {customerBookings.data.map(booking => (
                    <div className="booking-item" key={booking.id}>
                      <div className="booking-left">
                        <div className="booking-date">
                          {new Date(booking.bookingDate).toLocaleDateString()}
                        </div>
                        <div className="booking-info">
                          <div className="booking-venue">
                            <AppIcon name="building" /> {booking.Venue?.name || 'N/A'}
                          </div>
                          <div className="booking-time">
                            <AppIcon name="clock" /> {booking.bookingStartTime} - {booking.bookingEndTime}
                          </div>
                          <div className="booking-guests">
                            <AppIcon name="users" /> {booking.numGuests} guests
                          </div>
                        </div>
                      </div>
                      <div className={`booking-status ${booking.bookingStatus}`}>
                        {booking.bookingStatus.toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-bookings">
                  <p>No bookings yet</p>
                </div>
              )}

              <div className="bookings-actions">
                <button 
                  className="btn-secondary" 
                  onClick={() => setShowBookings(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
