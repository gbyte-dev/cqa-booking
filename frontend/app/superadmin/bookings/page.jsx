'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SuperAdminSidebar from '@/components/SuperAdminSidebar';
import { storage } from '@/lib/storage';
import {
  getAllBookings,
  getBookingStats,
  cancelBooking,
  confirmBooking,
  completeBooking,
} from '@/lib/superadmin-bookings';
import './bookings.css';

export default function BookingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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

  // Load bookings and stats
  const loadData = async () => {
    try {
      const [bookingsResponse, statsResponse] = await Promise.all([
        getAllBookings(token),
        getBookingStats(token),
      ]);

      if (bookingsResponse.success) {
        setBookings(bookingsResponse.data || []);
      }

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle actions
  const handleConfirm = async (booking) => {
    setActionLoading(true);
    try {
        const response = await confirmBooking(booking.id, token);
        if (response.success) {
        alert('✅ Booking confirmed');
        await loadData();
        }
    } catch (error) {
        alert('❌ Error: ' + error.message);
    } finally {
        setActionLoading(false);
    }
    };

  const handleComplete = async (booking) => {
    setActionLoading(true);
    try {
        const response = await completeBooking(booking.id, token);
        if (response.success) {
        alert('✅ Booking completed');
        await loadData();
        }
    } catch (error) {
        alert('❌ Error: ' + error.message);
    } finally {
        setActionLoading(false);
    }
    };

    const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setCancelReason('');
    setShowCancelModal(true);
    };

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      alert('⚠️ Please provide a reason');
      return;
    }

    setActionLoading(true);
    try {
      const response = await cancelBooking(selectedBooking.id, cancelReason, token);
      if (response.success) {
        alert('✅ Booking cancelled');
        setShowCancelModal(false);
        await loadData();
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
    } finally {
      setActionLoading(false);
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

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString.substring(0, 5);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
        confirmed: { class: 'confirmed', text: '✅ Confirmed' },
        pending: { class: 'pending', text: '⏳ Pending' },
        cancelled: { class: 'cancelled', text: '❌ Cancelled' },
        completed: { class: 'completed', text: '✔️ Completed' },
        checked_in: { class: 'pending', text: '📍 Checked In' }
    };
    return badges[status] || { class: 'pending', text: status };
    };

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesSearch = 
      booking.User?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.User?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.User?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.Venue?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="bookings-page">
        <div className="loading-state">
          <div className="loading-spinner" />
          <span>Loading Bookings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bookings-page">
      <div className="bookings-layout">
        <SuperAdminSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="bookings-main-wrapper">
          <Header
            title="Bookings"
            onMenuClick={() => setSidebarOpen(true)}
          />

          <main className="bookings-content">
            {/* Stats Cards */}
            {stats && (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Total Bookings</div>
                  <div className="stat-value">{stats.totalBookings}</div>
                  <div className="stat-footer">All time</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">Confirmed</div>
                  <div className="stat-value">{stats.confirmedBookings}</div>
                  <div className="stat-footer">Active bookings</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">Completed</div>
                  <div className="stat-value">{stats.completedBookings}</div>
                  <div className="stat-footer">Successfully done</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">Cancelled</div>
                  <div className="stat-value">{stats.cancelledBookings}</div>
                  <div className="stat-footer">Cancelled</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">Total Guests</div>
                  <div className="stat-value">{stats.totalGuests}</div>
                  <div className="stat-footer">Across all bookings</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">Avg Guests</div>
                  <div className="stat-value">{stats.averageBookingValue}</div>
                  <div className="stat-footer">Per booking</div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="filters-section">
              <div className="filter-group">
                <input
                  type="text"
                  placeholder="Search by customer name, email, or venue..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="filter-group">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="status-filter"
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="panel">
              <div className="panel-header">
                <h3>All Bookings</h3>
                <span>{filteredBookings.length} results</span>
              </div>

              {filteredBookings.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <p>No bookings found</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="bookings-table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Venue</th>
                        <th>Table</th>
                        <th>Guests</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((booking) => {
                        const statusBadge = getStatusBadge(booking.status);
                        return (
                          <tr key={booking.id}>
                            <td>
                                <div className="customer-cell">
                                <div className="customer-avatar">
                                    {booking.customerName?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <strong>{booking.customerName}</strong>
                                    <div className="customer-email">
                                    {booking.customerEmail}
                                    </div>
                                </div>
                                </div>
                            </td>
                            <td>
                                <strong>{booking.Venue?.name}</strong>
                                <div className="venue-city">
                                {booking.Venue?.city}
                                </div>
                            </td>
                            <td>{booking.Table?.name}</td>
                            <td>
                                <span className="guests-badge">
                                {booking.numGuests}  {/* ← numGuests */}
                                </span>
                            </td>
                            <td>{formatDate(booking.bookingDate)}</td>
                            <td>{formatTime(booking.bookingStartTime)}</td>
                            <td>
                                <span className={`status-badge ${getStatusBadge(booking.bookingStatus).class}`}>
                                {getStatusBadge(booking.bookingStatus).text}
                                </span>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button
                                  className="action-btn view-btn"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setShowDetails(true);
                                  }}
                                  title="View Details"
                                >
                                  👁️
                                </button>
                                {booking.status === 'pending' && (
                                  <button
                                    className="action-btn confirm-btn"
                                    onClick={() => handleConfirm(booking)}
                                    disabled={actionLoading}
                                    title="Confirm"
                                  >
                                    ✅
                                  </button>
                                )}
                                {booking.status === 'confirmed' && (
                                  <button
                                    className="action-btn complete-btn"
                                    onClick={() => handleComplete(booking)}
                                    disabled={actionLoading}
                                    title="Complete"
                                  >
                                    ✔️
                                  </button>
                                )}
                                {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                  <button
                                    className="action-btn cancel-btn"
                                    onClick={() => handleCancelClick(booking)}
                                    disabled={actionLoading}
                                    title="Cancel"
                                  >
                                    ❌
                                  </button>
                                )}
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

          <Footer />
        </div>
      </div>

      {/* DETAILS MODAL */}
      {showDetails && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
            <div className="modal details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
                <h2>📋 Booking Details</h2>
                <button className="close-btn" onClick={() => setShowDetails(false)}>✕</button>
            </div>

            <div className="booking-details">
                <div className="details-section">
                <h3>👤 Customer Information</h3>
                <div className="detail-row">
                    <span className="label">Name:</span>
                    <span className="value">{selectedBooking.customerName}</span>
                </div>
                <div className="detail-row">
                    <span className="label">Email:</span>
                    <span className="value">{selectedBooking.customerEmail}</span>
                </div>
                <div className="detail-row">
                    <span className="label">Phone:</span>
                    <span className="value">{selectedBooking.customerPhone}</span>
                </div>
                </div>

                <div className="details-section">
                <h3>🏢 Venue Information</h3>
                <div className="detail-row">
                    <span className="label">Venue:</span>
                    <span className="value">{selectedBooking.Venue?.name}</span>
                </div>
                <div className="detail-row">
                    <span className="label">Location:</span>
                    <span className="value">{selectedBooking.Venue?.city}</span>
                </div>
                <div className="detail-row">
                    <span className="label">Address:</span>
                    <span className="value">{selectedBooking.Venue?.address}</span>
                </div>
                </div>

                <div className="details-section">
                <h3>🪑 Table Information</h3>
                <div className="detail-row">
                    <span className="label">Table:</span>
                    <span className="value">{selectedBooking.Table?.name}</span>
                </div>
                <div className="detail-row">
                    <span className="label">Capacity:</span>
                    <span className="value">{selectedBooking.Table?.capacity} seats</span>
                </div>
                </div>

                <div className="details-section">
                <h3>📅 Booking Details</h3>
                <div className="detail-row">
                    <span className="label">Date:</span>
                    <span className="value">{formatDate(selectedBooking.bookingDate)}</span>
                </div>
                <div className="detail-row">
                    <span className="label">Time:</span>
                    <span className="value">
                    {formatTime(selectedBooking.bookingStartTime)} - {formatTime(selectedBooking.bookingEndTime)}
                    </span>
                </div>
                <div className="detail-row">
                    <span className="label">Guests:</span>
                    <span className="value">{selectedBooking.numGuests} people</span>
                </div>
                <div className="detail-row">
                    <span className="label">Status:</span>
                    <span className={`value status-badge ${getStatusBadge(selectedBooking.bookingStatus).class}`}>
                    {getStatusBadge(selectedBooking.bookingStatus).text}
                    </span>
                </div>
                {selectedBooking.totalAmount && (
                    <div className="detail-row">
                    <span className="label">Total Amount:</span>
                    <span className="value">${selectedBooking.totalAmount}</span>
                    </div>
                )}
                {selectedBooking.specialRequests && (
                    <div className="detail-row">
                    <span className="label">Special Requests:</span>
                    <span className="value">{selectedBooking.specialRequests}</span>
                    </div>
                )}
                {selectedBooking.cancellationReason && (
                    <div className="detail-row">
                    <span className="label">Cancellation Reason:</span>
                    <span className="value">{selectedBooking.cancellationReason}</span>
                    </div>
                )}
                </div>
            </div>
            </div>
        </div>
    )}

      {/* CANCEL MODAL */}
      {showCancelModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal cancel-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>❌ Cancel Booking</h2>
              <button className="close-btn" onClick={() => setShowCancelModal(false)}>✕</button>
            </div>

            <div className="cancel-content">
              <p>
                Are you sure you want to cancel the booking for{' '}
                <strong>
                  {selectedBooking.User?.firstName} {selectedBooking.User?.lastName}
                </strong>
                ?
              </p>
              <p className="booking-info">
                📅 {formatDate(selectedBooking.bookingDate)} at {formatTime(selectedBooking.bookingStartTime)}
                <br />
                🏢 {selectedBooking.Venue?.name}
              </p>

              <div className="form-group">
                <label>Reason for Cancellation *</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please provide a reason..."
                  rows="4"
                  disabled={actionLoading}
                />
              </div>

              <div className="modal-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setShowCancelModal(false)}
                  disabled={actionLoading}
                >
                  Keep Booking
                </button>
                <button
                  className="btn-cancel-confirm"
                  onClick={handleCancelBooking}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Cancelling...' : '❌ Cancel Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}