// ===== API CONFIGURATION =====
const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const API_URL = API_BASE ? `${API_BASE}/api/v1` : 'http://localhost:5000/api/v1';
// ===== REQUEST HELPER =====
async function fetchWithDebug(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  try {
    const response = await fetch(url, options);    
    const data = await response.json();
    
    if (!response.ok) {      throw new Error(data?.error || `HTTP ${response.status}`);
    }
    
    return data;
  } catch (error) {    throw error;
  }
}

// ===== GET ALL BOOKINGS =====
export async function getAllBookings(token) {  
  if (!token) throw new Error('No authentication token');

  try {
    const response = await fetchWithDebug('/superadmin/bookings', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return {
      success: true,
      data: response.data || [],
      count: response.count || 0
    };
  } catch (error) {    return {
      success: false,
      data: [],
      count: 0,
      error: error.message
    };
  }
}

// ===== GET BOOKING DETAILS =====
export async function getBookingDetails(bookingId, token) {  
  if (!token) throw new Error('No authentication token');
  if (!bookingId) throw new Error('Booking ID is required');

  return fetchWithDebug(`/superadmin/bookings/${bookingId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
}

// ===== GET BOOKING STATS =====
export async function getBookingStats(token) {  
  if (!token) throw new Error('No authentication token');

  try {
    const response = await fetchWithDebug('/superadmin/bookings/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return {
      success: true,
      data: response.data || {
        totalBookings: 0,
        confirmedBookings: 0,
        cancelledBookings: 0,
        completedBookings: 0,
        totalGuests: 0,
        averageBookingValue: 0,
        topVenue: null
      }
    };
  } catch (error) {    return {
      success: false,
      data: {
        totalBookings: 0,
        confirmedBookings: 0,
        cancelledBookings: 0,
        completedBookings: 0,
        totalGuests: 0,
        averageBookingValue: 0,
        topVenue: null
      },
      error: error.message
    };
  }
}

// ===== CANCEL BOOKING =====
export async function cancelBooking(bookingId, reason, token) {  
  if (!token) throw new Error('No authentication token');
  if (!bookingId) throw new Error('Booking ID is required');

  return fetchWithDebug(`/superadmin/bookings/${bookingId}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ reason })
  });
}

// ===== CONFIRM BOOKING =====
export async function confirmBooking(bookingId, token) {  
  if (!token) throw new Error('No authentication token');
  if (!bookingId) throw new Error('Booking ID is required');

  return fetchWithDebug(`/superadmin/bookings/${bookingId}/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
}

// ===== COMPLETE BOOKING =====
export async function completeBooking(bookingId, token) {  
  if (!token) throw new Error('No authentication token');
  if (!bookingId) throw new Error('Booking ID is required');

  return fetchWithDebug(`/superadmin/bookings/${bookingId}/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
}

// ===== EXPORT =====
export default {
  getAllBookings,
  getBookingDetails,
  getBookingStats,
  cancelBooking,
  confirmBooking,
  completeBooking
};