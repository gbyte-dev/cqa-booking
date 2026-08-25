const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ===== AUTH APIS =====
export const authAPI = {
  register: async (data) => {
    const res = await fetch(`${API_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  login: async (email, password) => {
    const res = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  registerCustomer: async (data) => {
    const res = await fetch(`${API_URL}/api/v1/auth/register/customer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  validateOwnerStep: async (data) => {
    const res = await fetch(`${API_URL}/api/v1/auth/register/owner/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getSubscriptionPlans: async () => {
    const res = await fetch(`${API_URL}/api/v1/subscription-plans`);
    return res.json();
  },

  getOwnerPaymentGateways: async () => {
    const res = await fetch(`${API_URL}/api/v1/auth/register/owner/payment-gateways`);
    return res.json();
  },

  createOwnerPaymentIntent: async (data) => {
    const res = await fetch(`${API_URL}/api/v1/auth/register/owner/payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  confirmOwnerPayment: async (data) => {
    const res = await fetch(`${API_URL}/api/v1/auth/register/owner/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }
};

// ===== VENUE APIS =====
export const venueAPI = {
  create: async (token, data) => {
    const res = await fetch(`${API_URL}/api/v1/venues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getAll: async (token) => {
    const res = await fetch(`${API_URL}/api/v1/venues`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  getById: async (token, id) => {
    const res = await fetch(`${API_URL}/api/v1/venues/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  update: async (token, id, data) => {
    const res = await fetch(`${API_URL}/api/v1/venues/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  delete: async (token, id) => {
    const res = await fetch(`${API_URL}/api/v1/venues/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  }
};

// ===== TABLE APIS =====
export const tableAPI = {
  create: async (token, data) => {
    const res = await fetch(`${API_URL}/api/v1/tables`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getByVenue: async (token, venueId) => {
    const res = await fetch(`${API_URL}/api/v1/tables/venue/${venueId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  update: async (token, id, data) => {
    const res = await fetch(`${API_URL}/api/v1/tables/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  delete: async (token, id) => {
    const res = await fetch(`${API_URL}/api/v1/tables/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  }
};

// ===== BOOKING APIS =====
export const bookingAPI = {
  checkAvailability: async (token, data) => {
    const res = await fetch(`${API_URL}/api/v1/bookings/availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  create: async (token, data) => {
    const res = await fetch(`${API_URL}/api/v1/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getAll: async (token) => {
    const res = await fetch(`${API_URL}/api/v1/bookings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  getById: async (token, id) => {
    const res = await fetch(`${API_URL}/api/v1/bookings/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  update: async (token, id, data) => {
    const res = await fetch(`${API_URL}/api/v1/bookings/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  cancel: async (token, id) => {
    const res = await fetch(`${API_URL}/api/v1/bookings/${id}/cancel`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  checkIn: async (token, id) => {
    const res = await fetch(`${API_URL}/api/v1/bookings/${id}/check-in`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  checkOut: async (token, id) => {
    const res = await fetch(`${API_URL}/api/v1/bookings/${id}/check-out`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  }
};