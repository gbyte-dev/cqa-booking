// =========================================================
// TENANT BOOKINGS API
// =========================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const API_URL = API_BASE
  ? `${API_BASE}/api/v1`
  : 'http://localhost:5000/api/v1';

// =========================================================
// REQUEST HELPER
// =========================================================

async function fetchWithDebug(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  try {
    const response = await fetch(url, options);

    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        data?.error || `HTTP ${response.status}`
      );
    }

    return data;

  } catch (error) {
    throw error;
  }
}


// =========================================================
// GET TENANT BOOKINGS
// =========================================================

export async function getTenantBookings(token) {

  if (!token) {
    throw new Error('No authentication token');
  }

  try {

    const response = await fetchWithDebug('/bookings', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    return {
      success: true,
      data: response.data || [],
      count: response.count || 0
    };

  } catch (error) {

    return {
      success: false,
      data: [],
      count: 0,
      error: error.message
    };
  }
}


// =========================================================
// GET BOOKING DETAILS
// =========================================================

export async function getTenantBookingDetails(
  bookingId,
  token
) {

  if (!token) {
    throw new Error('No authentication token');
  }

  if (!bookingId) {
    throw new Error('Booking ID is required');
  }

  return fetchWithDebug(
    `/bookings/${bookingId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    }
  );
}


// =========================================================
// GET BOOKING STATS
// =========================================================

export async function getTenantBookingStats(token) {

  if (!token) {
    throw new Error('No authentication token');
  }

  try {

    const response = await fetchWithDebug(
      '/bookings/stats',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    );

    return {
      success: true,
      data: response.data || {
        totalBookings: 0,
        confirmedBookings: 0,
        pendingBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        checkedInBookings: 0,
        totalGuests: 0,
        averageBookingValue: 0
      }
    };

  } catch (error) {

    return {
      success: false,
      data: {
        totalBookings: 0,
        confirmedBookings: 0,
        pendingBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        checkedInBookings: 0,
        totalGuests: 0,
        averageBookingValue: 0
      },
      error: error.message
    };
  }
}


// =========================================================
// CONFIRM BOOKING
// =========================================================

export async function confirmTenantBooking(
  bookingId,
  token
) {

  if (!token) {
    throw new Error('No authentication token');
  }

  if (!bookingId) {
    throw new Error('Booking ID is required');
  }

  return fetchWithDebug(
    `/bookings/${bookingId}/confirm`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    }
  );
}


// =========================================================
// COMPLETE BOOKING
// =========================================================

export async function completeTenantBooking(
  bookingId,
  token
) {

  if (!token) {
    throw new Error('No authentication token');
  }

  if (!bookingId) {
    throw new Error('Booking ID is required');
  }

  return fetchWithDebug(
    `/bookings/${bookingId}/complete`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    }
  );
}


// =========================================================
// CANCEL BOOKING
// =========================================================

export async function cancelTenantBooking(
  bookingId,
  reason,
  token
) {

  if (!token) {
    throw new Error('No authentication token');
  }

  if (!bookingId) {
    throw new Error('Booking ID is required');
  }

  return fetchWithDebug(
    `/bookings/${bookingId}/cancel`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        reason
      })
    }
  );
}


// =========================================================
// CHECK IN
// =========================================================

export async function checkInTenantBooking(
  bookingId,
  token
) {

  return fetchWithDebug(
    `/bookings/${bookingId}/check-in`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    }
  );
}


// =========================================================
// MARK NO-SHOW
// =========================================================

export async function markTenantBookingNoShow(
  bookingId,
  token
) {

  if (!token) {
    throw new Error('No authentication token');
  }

  if (!bookingId) {
    throw new Error('Booking ID is required');
  }

  return fetchWithDebug(
    `/bookings/${bookingId}/no-show`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    }
  );
}


// =========================================================
// GET BOOKING ACTIVITY (who did what)
// =========================================================

export async function getTenantBookingActivity(
  bookingId,
  token
) {

  if (!token) {
    throw new Error('No authentication token');
  }

  if (!bookingId) {
    throw new Error('Booking ID is required');
  }

  try {
    const response = await fetchWithDebug(
      `/bookings/${bookingId}/activity`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    );

    return {
      success: true,
      data: response.data || []
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      error: error.message
    };
  }
}


// =========================================================
// EXPORT
// =========================================================

export default {
  getTenantBookings,
  getTenantBookingDetails,
  getTenantBookingStats,
  confirmTenantBooking,
  completeTenantBooking,
  cancelTenantBooking,
  checkInTenantBooking,
  markTenantBookingNoShow,
  getTenantBookingActivity
};