'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import Header from '@/components/TenantHeader';
import Footer from '@/components/Footer';
import TenantSidebar from '@/components/TenantSidebar';

import { storage } from '@/lib/storage';

import {
  getTenantBookings,
  getTenantBookingStats,
  confirmTenantBooking,
  completeTenantBooking,
  cancelTenantBooking
} from '@/lib/tenant-bookings';

import './bookings.css';


export default function TenantBookingsPage() {

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


  // =====================================================
  // AUTH
  // =====================================================

  useEffect(() => {

    const token = storage.getToken();
    const currentUser = storage.getUser();

    if (
      !token ||
      !currentUser ||
      !['tenant', 'manager', 'owner', 'admin'].includes(
        currentUser.role
      )
    ) {
      router.push('/tenant/login');
      return;
    }

    setUser(currentUser);

    loadData(token);

  }, []);


  // =====================================================
  // LOAD DATA
  // =====================================================

  const loadData = async (authToken) => {

    try {

      const [bookingsResponse, statsResponse] =
        await Promise.all([
          getTenantBookings(authToken),
          getTenantBookingStats(authToken)
        ]);

      if (bookingsResponse.success) {
        setBookings(bookingsResponse.data || []);
      }

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

    } catch (error) {

      console.error(
        'Tenant bookings load error:',
        error
      );

    } finally {

      setLoading(false);
    }
  };


  // =====================================================
  // CONFIRM
  // =====================================================

  const handleConfirm = async (booking) => {

    const token = storage.getToken();

    setActionLoading(true);

    try {

      const response =
        await confirmTenantBooking(
          booking.id,
          token
        );

      if (response.success) {

        alert('✅ Booking confirmed');

        await loadData(token);
      }

    } catch (error) {

      alert('❌ Error: ' + error.message);

    } finally {

      setActionLoading(false);
    }
  };


  // =====================================================
  // COMPLETE
  // =====================================================

  const handleComplete = async (booking) => {

    const token = storage.getToken();

    setActionLoading(true);

    try {

      const response =
        await completeTenantBooking(
          booking.id,
          token
        );

      if (response.success) {

        alert('✅ Booking completed');

        await loadData(token);
      }

    } catch (error) {

      alert('❌ Error: ' + error.message);

    } finally {

      setActionLoading(false);
    }
  };


  // =====================================================
  // CANCEL MODAL
  // =====================================================

  const handleCancelClick = (booking) => {

    setSelectedBooking(booking);
    setCancelReason('');
    setShowCancelModal(true);
  };


  // =====================================================
  // CANCEL
  // =====================================================

  const handleCancelBooking = async () => {

    if (!cancelReason.trim()) {

      alert('⚠️ Please provide a reason');

      return;
    }

    const token = storage.getToken();

    setActionLoading(true);

    try {

      const response =
        await cancelTenantBooking(
          selectedBooking.id,
          cancelReason,
          token
        );

      if (response.success) {

        alert('✅ Booking cancelled');

        setShowCancelModal(false);

        await loadData(token);
      }

    } catch (error) {

      alert('❌ Error: ' + error.message);

    } finally {

      setActionLoading(false);
    }
  };


  // =====================================================
  // DATE
  // =====================================================

  const formatDate = (dateString) => {

    if (!dateString) return 'N/A';

    return new Date(
      dateString
    ).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };


  // =====================================================
  // TIME
  // =====================================================

  const formatTime = (timeString) => {

    if (!timeString) return 'N/A';

    return timeString.substring(0, 5);
  };


  // =====================================================
  // STATUS
  // =====================================================

  const getStatusBadge = (status) => {

    const badges = {

      confirmed: {
        class: 'confirmed',
        text: '✅ Confirmed'
      },

      pending: {
        class: 'pending',
        text: '⏳ Pending'
      },

      cancelled: {
        class: 'cancelled',
        text: '❌ Cancelled'
      },

      completed: {
        class: 'completed',
        text: '✔️ Completed'
      },

      checked_in: {
        class: 'checked-in',
        text: '📍 Checked In'
      }

    };

    return badges[status] || {
      class: 'pending',
      text: status || 'Unknown'
    };
  };


  // =====================================================
  // FILTER
  // =====================================================

  const filteredBookings = bookings.filter(
    (booking) => {

      const status =
        booking.bookingStatus;

      const matchesStatus =
        filterStatus === 'all' ||
        status === filterStatus;

      const search =
        searchTerm.toLowerCase();

      const matchesSearch =
        booking.customerName
          ?.toLowerCase()
          .includes(search) ||

        booking.customerEmail
          ?.toLowerCase()
          .includes(search) ||

        booking.customerPhone
          ?.toLowerCase()
          .includes(search) ||

        booking.Venue?.name
          ?.toLowerCase()
          .includes(search);

      return (
        matchesStatus &&
        matchesSearch
      );
    }
  );


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (
      <div className="bookings-page">

        <div className="loading-state">

          <div className="loading-spinner" />

          <span>
            Loading Bookings...
          </span>

        </div>

      </div>
    );
  }


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="bookings-page">

      <div className="bookings-layout">

        <TenantSidebar
          open={sidebarOpen}
          onClose={() =>
            setSidebarOpen(false)
          }
        />


        <div className="bookings-main-wrapper">

          <Header
            title="Bookings"
            onMenuClick={() =>
              setSidebarOpen(true)
            }
          />


          <main className="bookings-content">


            {/* =================================================
                STATS
            ================================================= */}

            {stats && (

              <div className="stats-grid">

                <div className="stat-card">
                  <div className="stat-label">
                    Total Bookings
                  </div>

                  <div className="stat-value">
                    {stats.totalBookings}
                  </div>

                  <div className="stat-footer">
                    All bookings
                  </div>
                </div>


                <div className="stat-card">
                  <div className="stat-label">
                    Pending
                  </div>

                  <div className="stat-value">
                    {stats.pendingBookings}
                  </div>

                  <div className="stat-footer">
                    Awaiting confirmation
                  </div>
                </div>


                <div className="stat-card">
                  <div className="stat-label">
                    Confirmed
                  </div>

                  <div className="stat-value">
                    {stats.confirmedBookings}
                  </div>

                  <div className="stat-footer">
                    Active bookings
                  </div>
                </div>


                <div className="stat-card">
                  <div className="stat-label">
                    Checked In
                  </div>

                  <div className="stat-value">
                    {stats.checkedInBookings}
                  </div>

                  <div className="stat-footer">
                    Current guests
                  </div>
                </div>


                <div className="stat-card">
                  <div className="stat-label">
                    Completed
                  </div>

                  <div className="stat-value">
                    {stats.completedBookings}
                  </div>

                  <div className="stat-footer">
                    Successfully done
                  </div>
                </div>


                <div className="stat-card">
                  <div className="stat-label">
                    Cancelled
                  </div>

                  <div className="stat-value">
                    {stats.cancelledBookings}
                  </div>

                  <div className="stat-footer">
                    Cancelled bookings
                  </div>
                </div>

              </div>
            )}


            {/* =================================================
                FILTERS
            ================================================= */}

            <div className="filters-section">

              <div className="filter-group">

                <input
                  type="text"
                  placeholder="Search customer, email, phone, or venue..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(
                      e.target.value
                    )
                  }
                  className="search-input"
                />

              </div>


              <div className="filter-group">

                <select
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(
                      e.target.value
                    )
                  }
                  className="status-filter"
                >

                  <option value="all">
                    All Status
                  </option>

                  <option value="pending">
                    Pending
                  </option>

                  <option value="confirmed">
                    Confirmed
                  </option>

                  <option value="checked_in">
                    Checked In
                  </option>

                  <option value="completed">
                    Completed
                  </option>

                  <option value="cancelled">
                    Cancelled
                  </option>

                </select>

              </div>

            </div>


            {/* =================================================
                TABLE
            ================================================= */}

            <div className="panel">

              <div className="panel-header">

                <h3>
                  Bookings
                </h3>

                <span>
                  {filteredBookings.length}
                  {' '}results
                </span>

              </div>


              {filteredBookings.length === 0 ? (

                <div className="empty-state">

                  <div className="empty-icon">
                    📋
                  </div>

                  <p>
                    No bookings found
                  </p>

                </div>

              ) : (

                <div className="table-container">

                  <table className="bookings-table">

                    <thead>

                      <tr>

                        <th>
                          Customer
                        </th>

                        <th>
                          Venue
                        </th>

                        <th>
                          Table
                        </th>

                        <th>
                          Guests
                        </th>

                        <th>
                          Date
                        </th>

                        <th>
                          Time
                        </th>

                        <th>
                          Status
                        </th>

                        <th>
                          Actions
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {filteredBookings.map(
                        (booking) => {

                          const badge =
                            getStatusBadge(
                              booking.bookingStatus
                            );

                          return (

                            <tr
                              key={booking.id}
                            >

                              {/* CUSTOMER */}

                              <td>

                                <div className="customer-cell">

                                  <div className="customer-avatar">

                                    {booking.customerName
                                      ?.charAt(0)
                                      ?.toUpperCase() || 'C'}

                                  </div>


                                  <div>

                                    <strong>
                                      {booking.customerName}
                                    </strong>

                                    <div className="customer-email">
                                      {booking.customerEmail || 'N/A'}
                                    </div>

                                  </div>

                                </div>

                              </td>


                              {/* VENUE */}

                              <td>

                                <strong>
                                  {booking.Venue?.name || 'N/A'}
                                </strong>

                                <div className="venue-city">
                                  {booking.Venue?.city || ''}
                                </div>

                              </td>


                              {/* TABLE */}

                              <td>
                                {booking.Table?.name || 'N/A'}
                              </td>


                              {/* GUESTS */}

                              <td>

                                <span className="guests-badge">

                                  {booking.numGuests}

                                </span>

                              </td>


                              {/* DATE */}

                              <td>
                                {formatDate(
                                  booking.bookingDate
                                )}
                              </td>


                              {/* TIME */}

                              <td>
                                {formatTime(
                                  booking.bookingStartTime
                                )}
                              </td>


                              {/* STATUS */}

                              <td>

                                <span
                                  className={`status-badge ${badge.class}`}
                                >
                                  {badge.text}
                                </span>

                              </td>


                              {/* ACTIONS */}

                              <td>

                                <div className="action-buttons">

                                  {/* VIEW */}

                                  <button
                                    className="action-btn view-btn"
                                    onClick={() => {

                                      setSelectedBooking(
                                        booking
                                      );

                                      setShowDetails(
                                        true
                                      );

                                    }}
                                    title="View Details"
                                  >
                                    👁️
                                  </button>


                                  {/* CONFIRM */}

                                  {booking.bookingStatus ===
                                    'pending' && (

                                    <button
                                      className="action-btn confirm-btn"
                                      onClick={() =>
                                        handleConfirm(
                                          booking
                                        )
                                      }
                                      disabled={
                                        actionLoading
                                      }
                                      title="Confirm"
                                    >
                                      ✅
                                    </button>

                                  )}


                                  {/* COMPLETE */}

                                  {booking.bookingStatus ===
                                    'confirmed' && (

                                    <button
                                      className="action-btn complete-btn"
                                      onClick={() =>
                                        handleComplete(
                                          booking
                                        )
                                      }
                                      disabled={
                                        actionLoading
                                      }
                                      title="Complete"
                                    >
                                      ✔️
                                    </button>

                                  )}


                                  {/* CANCEL */}

                                  {![
                                    'cancelled',
                                    'completed'
                                  ].includes(
                                    booking.bookingStatus
                                  ) && (

                                    <button
                                      className="action-btn cancel-btn"
                                      onClick={() =>
                                        handleCancelClick(
                                          booking
                                        )
                                      }
                                      disabled={
                                        actionLoading
                                      }
                                      title="Cancel"
                                    >
                                      ❌
                                    </button>

                                  )}

                                </div>

                              </td>

                            </tr>

                          );

                        }
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          </main>


          <Footer />

        </div>

      </div>


      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {showDetails &&
        selectedBooking && (

        <div
          className="modal-overlay"
          onClick={() =>
            setShowDetails(false)
          }
        >

          <div
            className="modal details-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <h2>
                📋 Booking Details
              </h2>

              <button
                className="close-btn"
                onClick={() =>
                  setShowDetails(false)
                }
              >
                ✕
              </button>

            </div>


            <div className="booking-details">


              {/* CUSTOMER */}

              <div className="details-section">

                <h3>
                  👤 Customer Information
                </h3>

                <div className="detail-row">
                  <span className="label">
                    Name:
                  </span>

                  <span className="value">
                    {selectedBooking.customerName}
                  </span>
                </div>


                <div className="detail-row">
                  <span className="label">
                    Email:
                  </span>

                  <span className="value">
                    {selectedBooking.customerEmail || 'N/A'}
                  </span>
                </div>


                <div className="detail-row">
                  <span className="label">
                    Phone:
                  </span>

                  <span className="value">
                    {selectedBooking.customerPhone || 'N/A'}
                  </span>
                </div>

              </div>


              {/* VENUE */}

              <div className="details-section">

                <h3>
                  🏢 Venue Information
                </h3>

                <div className="detail-row">

                  <span className="label">
                    Venue:
                  </span>

                  <span className="value">
                    {selectedBooking.Venue?.name || 'N/A'}
                  </span>

                </div>


                <div className="detail-row">

                  <span className="label">
                    Location:
                  </span>

                  <span className="value">
                    {selectedBooking.Venue?.city || 'N/A'}
                  </span>

                </div>


                <div className="detail-row">

                  <span className="label">
                    Address:
                  </span>

                  <span className="value">
                    {selectedBooking.Venue?.address || 'N/A'}
                  </span>

                </div>

              </div>


              {/* TABLE */}

              <div className="details-section">

                <h3>
                  🪑 Table Information
                </h3>

                <div className="detail-row">

                  <span className="label">
                    Table:
                  </span>

                  <span className="value">
                    {selectedBooking.Table?.name || 'N/A'}
                  </span>

                </div>


                <div className="detail-row">

                  <span className="label">
                    Capacity:
                  </span>

                  <span className="value">
                    {selectedBooking.Table?.capacity || 'N/A'}
                    {' '}seats
                  </span>

                </div>

              </div>


              {/* BOOKING */}

              <div className="details-section">

                <h3>
                  📅 Booking Details
                </h3>


                <div className="detail-row">

                  <span className="label">
                    Date:
                  </span>

                  <span className="value">
                    {formatDate(
                      selectedBooking.bookingDate
                    )}
                  </span>

                </div>


                <div className="detail-row">

                  <span className="label">
                    Time:
                  </span>

                  <span className="value">

                    {formatTime(
                      selectedBooking.bookingStartTime
                    )}

                    {' - '}

                    {formatTime(
                      selectedBooking.bookingEndTime
                    )}

                  </span>

                </div>


                <div className="detail-row">

                  <span className="label">
                    Guests:
                  </span>

                  <span className="value">
                    {selectedBooking.numGuests}
                    {' '}people
                  </span>

                </div>


                <div className="detail-row">

                  <span className="label">
                    Status:
                  </span>

                  <span
                    className={`value status-badge ${
                      getStatusBadge(
                        selectedBooking.bookingStatus
                      ).class
                    }`}
                  >

                    {
                      getStatusBadge(
                        selectedBooking.bookingStatus
                      ).text
                    }

                  </span>

                </div>


                {selectedBooking.totalAmount && (

                  <div className="detail-row">

                    <span className="label">
                      Total Amount:
                    </span>

                    <span className="value">
                      ${selectedBooking.totalAmount}
                    </span>

                  </div>

                )}


                {selectedBooking.specialRequests && (

                  <div className="detail-row">

                    <span className="label">
                      Special Requests:
                    </span>

                    <span className="value">
                      {selectedBooking.specialRequests}
                    </span>

                  </div>

                )}


                {selectedBooking.cancellationReason && (

                  <div className="detail-row">

                    <span className="label">
                      Cancellation Reason:
                    </span>

                    <span className="value">
                      {selectedBooking.cancellationReason}
                    </span>

                  </div>

                )}

              </div>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          CANCEL MODAL
      ===================================================== */}

      {showCancelModal &&
        selectedBooking && (

        <div
          className="modal-overlay"
          onClick={() =>
            setShowCancelModal(false)
          }
        >

          <div
            className="modal cancel-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <h2>
                ❌ Cancel Booking
              </h2>

              <button
                className="close-btn"
                onClick={() =>
                  setShowCancelModal(false)
                }
              >
                ✕
              </button>

            </div>


            <div className="cancel-content">

              <p>

                Are you sure you want to cancel
                the booking for{' '}

                <strong>
                  {selectedBooking.customerName}
                </strong>
                ?

              </p>


              <p className="booking-info">

                📅{' '}
                {formatDate(
                  selectedBooking.bookingDate
                )}

                {' at '}

                {formatTime(
                  selectedBooking.bookingStartTime
                )}

                <br />

                🏢{' '}
                {selectedBooking.Venue?.name}

              </p>


              <div className="form-group">

                <label>
                  Reason for Cancellation *
                </label>

                <textarea
                  value={cancelReason}
                  onChange={(e) =>
                    setCancelReason(
                      e.target.value
                    )
                  }
                  placeholder="Please provide a reason..."
                  rows="4"
                  disabled={actionLoading}
                />

              </div>


              <div className="modal-actions">

                <button
                  className="btn-cancel"
                  onClick={() =>
                    setShowCancelModal(false)
                  }
                  disabled={actionLoading}
                >
                  Keep Booking
                </button>


                <button
                  className="btn-cancel-confirm"
                  onClick={
                    handleCancelBooking
                  }
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? 'Cancelling...'
                    : '❌ Cancel Booking'}
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}