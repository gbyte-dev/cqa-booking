'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import {
  getAllCustomers,
  getCustomerBookings,
  updateCustomer,
  deleteCustomer,
  suspendCustomer,
  reactivateCustomer,
} from '@/lib/users';
import './users.css';

export default function UsersPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [bookingStats, setBookingStats] = useState(null);
  const [showBookings, setShowBookings] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const token = storage.getToken();
  const currentUser = storage.getUser();

  // Check auth
  useEffect(() => {
    if (!token || !currentUser || currentUser.role !== 'superadmin') {
      router.push('/superadmin/login');
      return;
    }
    setUser(currentUser);
    loadCustomers();
  }, []);

  // Load customers
  const loadCustomers = async () => {
    setLoading(true);
    try {
      const response = await getAllCustomers(token);
      if (response.success) {
        setCustomers(response.data || []);
      }
    } catch (error) {
      console.error('Load error:', error);
      alert('❌ Error loading customers: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load customer bookings
  const loadBookings = async (customerId) => {
    setBookingsLoading(true);
    try {
      const response = await getCustomerBookings(customerId, token);
      if (response.success) {
        setBookings(response.data || []);
        setBookingStats(response.stats || {});
      }
    } catch (error) {
      console.error('Bookings error:', error);
      alert('❌ Error loading bookings: ' + error.message);
    } finally {
      setBookingsLoading(false);
    }
  };

  // View bookings
  const handleViewBookings = async (customer) => {
    setSelectedCustomer(customer);
    setShowBookings(true);
    await loadBookings(customer.id);
  };

  // Close bookings
  const handleCloseBookings = () => {
    setShowBookings(false);
    setSelectedCustomer(null);
    setBookings([]);
    setBookingStats(null);
  };

  // Suspend
  const handleSuspend = async (customer) => {
    if (!confirm(`Suspend customer "${customer.firstName} ${customer.lastName}"?`)) return;

    try {
      const response = await suspendCustomer(customer.id, token);
      if (response.success) {
        alert('✅ Customer suspended');
        await loadCustomers();
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };

  // Reactivate
  const handleReactivate = async (customer) => {
    if (!confirm(`Reactivate customer "${customer.firstName} ${customer.lastName}"?`)) return;

    try {
      const response = await reactivateCustomer(customer.id, token);
      if (response.success) {
        alert('✅ Customer reactivated');
        await loadCustomers();
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };

  // Delete
  const handleDelete = async (customer) => {
    if (!confirm(`Delete customer "${customer.firstName} ${customer.lastName}" permanently?`)) return;

    try {
      const response = await deleteCustomer(customer.id, token);
      if (response.success) {
        alert('✅ Customer deleted');
        await loadCustomers();
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
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

  // Get status badge
  const getStatusBadge = (status) => {
    const statusClass = status === 'active' ? 'active' : 'suspended';
    const statusText = status === 'active' ? '✅ Active' : '🔒 Suspended';
    return { statusClass, statusText };
  };

  if (loading) {
    return (
      <div className="users-page">
        <div className="loading-state">
          <div className="loading-spinner" />
          <span>Loading Customers...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="users-content">
            <div className="page-header">
              <div>
                <h2>Manage Customers</h2>
                <p>View and manage all customer accounts and their booking history.</p>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h3>All Customers</h3>
                <span>{customers.length} total</span>
              </div>

              {customers.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">👤</div>
                  <p>No customers found</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>Customer Name</th>
                        <th>Email</th>
                        <th>Organization</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => {
                        const { statusClass, statusText } = getStatusBadge(customer.status);
                        return (
                          <tr key={customer.id}>
                            <td>
                              <div className="customer-cell">
                                <div className="customer-avatar">
                                  {customer.firstName?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="customer-name">
                                    {customer.firstName} {customer.lastName}
                                  </div>
                                  <div className="customer-id">
                                    {customer.id.substring(0, 8)}...
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <code className="email-badge">{customer.email}</code>
                            </td>
                            <td>
                              {customer.Organization?.name || 'N/A'}
                            </td>
                            <td>
                              <span className={`status ${statusClass}`}>
                                {statusText}
                              </span>
                            </td>
                            <td>{formatDate(customer.createdAt)}</td>
                            <td>
                              <div className="action-buttons">
                                <button
                                  className="action-btn view-btn"
                                  onClick={() => handleViewBookings(customer)}
                                  title="View Bookings"
                                >
                                  📋
                                </button>
                                {customer.status === 'active' ? (
                                  <button
                                    className="action-btn suspend-btn"
                                    onClick={() => handleSuspend(customer)}
                                    title="Suspend"
                                  >
                                    🔒
                                  </button>
                                ) : (
                                  <button
                                    className="action-btn reactivate-btn"
                                    onClick={() => handleReactivate(customer)}
                                    title="Reactivate"
                                  >
                                    ✅
                                  </button>
                                )}
                                <button
                                  className="action-btn delete-btn"
                                  onClick={() => handleDelete(customer)}
                                  title="Delete"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
      </main>

      {/* BOOKINGS MODAL */}
      {showBookings && selectedCustomer && (
        <div className="modal-overlay" onClick={handleCloseBookings}>
          <div className="modal bookings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Booking History</h2>
              <button className="close-btn" onClick={handleCloseBookings}>✕</button>
            </div>

            {bookingsLoading ? (
              <div className="loading-state">
                <div className="loading-spinner" />
                <span>Loading bookings...</span>
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="bookings-stats">
                  <div className="stat-box">
                    <div className="stat-label">Total Bookings</div>
                    <div className="stat-value">{bookingStats?.totalBookings || 0}</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Completed</div>
                    <div className="stat-value">{bookingStats?.completedBookings || 0}</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Cancelled</div>
                    <div className="stat-value">{bookingStats?.cancelledBookings || 0}</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Total Guests</div>
                    <div className="stat-value">{bookingStats?.totalGuests || 0}</div>
                  </div>
                </div>

                {/* Bookings Table */}
                {bookings.length === 0 ? (
                  <div className="empty-state">
                    <p>No bookings found</p>
                  </div>
                ) : (
                  <div className="bookings-table-container">
                    <table className="bookings-table">
                      <thead>
                        <tr>
                          <th>Booking Date</th>
                          <th>Venue</th>
                          <th>Table</th>
                          <th>Guests</th>
                          <th>Time</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking) => (
                          <tr key={booking.id}>
                            <td>{formatDate(booking.bookingDate)}</td>
                            <td>
                              <strong>{booking.Venue?.name || 'N/A'}</strong>
                              <div className="venue-info">
                                {booking.Venue?.city}
                              </div>
                            </td>
                            <td>{booking.Table?.name || 'N/A'}</td>
                            <td>
                              <strong>{booking.numberOfGuests}</strong>
                              <div className="guest-info">
                                {booking.Table?.capacity} capacity
                              </div>
                            </td>
                            <td>
                              {booking.bookingStartTime?.substring(0, 5)} - {booking.bookingEndTime?.substring(0, 5)}
                            </td>
                            <td>
                              <span className={`booking-status ${booking.status}`}>
                                {booking.status === 'confirmed' && '✅ Confirmed'}
                                {booking.status === 'cancelled' && '❌ Cancelled'}
                                {booking.status === 'completed' && '✔️ Completed'}
                                {booking.status === 'pending' && '⏳ Pending'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}