'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/TenantHeader';
import Footer from '@/components/Footer';
import TenantSidebar from '@/components/TenantSidebar';
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
import './customers.css';

export default function TenantCustomersPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showBookings, setShowBookings] = useState(false);
  const [customerBookings, setCustomerBookings] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);

  const token = storage.getToken();
  const currentUser = storage.getUser();

  // Helper function to check if customer is suspended
  const isSuspended = (customer) => customer.notes?.includes('[SUSPENDED]');
  const getCustomerStatus = (customer) => isSuspended(customer) ? 'suspended' : 'active';

  useEffect(() => {
    if (!token || !currentUser) {
      router.push('/tenant/login');
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
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = async (customer) => {
    setSelectedCustomer(customer);
    setShowProfile(true);
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
      alert('❌ Error: ' + error.message);
    }
  };

  const handleSuspend = async (customerId) => {
    if (!confirm('Suspend this customer?')) return;

    setActionLoading(true);
    try {
      const response = await suspendTenantCustomer(customerId, token);
      if (response.success) {
        alert('✅ Customer suspended');
        await loadCustomers();
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async (customerId) => {
    if (!confirm('Activate this customer?')) return;

    setActionLoading(true);
    try {
      const response = await activateTenantCustomer(customerId, token);
      if (response.success) {
        alert('✅ Customer activated');
        await loadCustomers();
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (customerId) => {
    if (!confirm('Delete this customer? This cannot be undone.')) return;

    setActionLoading(true);
    try {
      const response = await deleteTenantCustomer(customerId, token);
      if (response.success) {
        alert('✅ Customer deleted');
        await loadCustomers();
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
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

    // ✅ Updated status filter logic
    const matchesStatus = 
      filterStatus === 'all' || 
      getCustomerStatus(customer) === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="customers-page">
        <div className="loading-state">
          <div className="loading-spinner" />
          <span>Loading Customers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="customers-page">
      <div className="customers-layout">
        <TenantSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="customers-main-wrapper">
          <Header
            title="Customers"
            onMenuClick={() => setSidebarOpen(true)}
          />

          <main className="customers-content">
            <div className="customers-header">
              <div>
                <h2>👥 Customers</h2>
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
                <div className="empty-icon">👥</div>
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
                                </strong>
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
                            {/* ✅ Updated status badge logic */}
                            <span 
                              className={`status-badge ${getCustomerStatus(customer)}`}
                            >
                              {isSuspended(customer) ? '⛔ Suspended' : '✅ Active'}
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
                                👁️
                              </button>
                              <button
                                className="btn-bookings"
                                onClick={() => handleViewBookings(customer)}
                                title="View Bookings"
                              >
                                📋
                              </button>
                              {/* ✅ Updated suspend/activate logic */}
                              {isSuspended(customer) ? (
                                <button
                                  className="btn-activate"
                                  onClick={() => handleActivate(customer.id)}
                                  disabled={actionLoading}
                                  title="Activate"
                                >
                                  ✅
                                </button>
                              ) : (
                                <button
                                  className="btn-suspend"
                                  onClick={() => handleSuspend(customer.id)}
                                  disabled={actionLoading}
                                  title="Suspend"
                                >
                                  ⛔
                                </button>
                              )}
                              <button
                                className="btn-delete"
                                onClick={() => handleDelete(customer.id)}
                                disabled={actionLoading}
                                title="Delete"
                              >
                                🗑️
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

          <Footer />
        </div>
      </div>

      {/* ===== PROFILE MODAL ===== */}
      {showProfile && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="modal profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👤 Customer Profile</h2>
              <button className="close-btn" onClick={() => setShowProfile(false)}>✕</button>
            </div>

            <div className="profile-content">
              <div className="profile-section">
                <div className="profile-avatar-large">
                  {selectedCustomer.firstName?.charAt(0).toUpperCase() || 'C'}
                </div>
                <div className="profile-name">
                  {selectedCustomer.firstName} {selectedCustomer.lastName}
                </div>
                <div className="profile-status">
                  {/* ✅ Updated status badge logic */}
                  <span className={`badge ${getCustomerStatus(selectedCustomer)}`}>
                    {isSuspended(selectedCustomer) ? '⛔ Suspended' : '✅ Active'}
                  </span>
                </div>
              </div>

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
                  <span className="label">Total Bookings:</span>
                  <span className="value">{selectedCustomer.totalBookings || 0}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Total Spent:</span>
                  <span className="value">₹{selectedCustomer.totalSpent || 0}</span>
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
                <button
                  className="btn-primary"
                  onClick={() => {
                    setShowProfile(false);
                    handleViewBookings(selectedCustomer);
                  }}
                >
                  📋 View Bookings
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setShowProfile(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== BOOKINGS MODAL ===== */}
      {showBookings && selectedCustomer && customerBookings && (
        <div className="modal-overlay" onClick={() => setShowBookings(false)}>
          <div className="modal bookings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 {selectedCustomer.firstName}'s Bookings</h2>
              <button className="close-btn" onClick={() => setShowBookings(false)}>✕</button>
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
                            🏢 {booking.Venue?.name || 'N/A'}
                          </div>
                          <div className="booking-time">
                            🕐 {booking.bookingStartTime} - {booking.bookingEndTime}
                          </div>
                          <div className="booking-guests">
                            👥 {booking.numGuests} guests
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
    </div>
  );
}