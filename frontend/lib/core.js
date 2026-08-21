const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_BASE = `${API_URL}/api/v1`;

async function request(path, token, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  return data;
}

export const coreAPI = {
  forgotPassword: email => request('/auth/forgot-password', null, { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token, password) => request('/auth/reset-password', null, { method: 'POST', body: JSON.stringify({ token, password }) }),
  createPayment: (token, bookingId, data) => request(`/payments/booking/${bookingId}`, token, { method: 'POST', body: JSON.stringify(data) }),
  completePayment: (token, paymentId, providerReference) => request(`/payments/${paymentId}/complete`, token, { method: 'POST', body: JSON.stringify({ providerReference }) }),
  refundPayment: (token, paymentId, amount) => request(`/payments/${paymentId}/refund`, token, { method: 'POST', body: JSON.stringify({ amount }) }),
  listPromotions: token => request('/promotions', token),
  createPromotion: (token, data) => request('/promotions', token, { method: 'POST', body: JSON.stringify(data) }),
  validatePromotion: (token, code, amount) => request('/promotions/validate', token, { method: 'POST', body: JSON.stringify({ code, amount }) }),
  listNotifications: token => request('/notifications', token),
  queueNotification: (token, data) => request('/notifications/queue', token, { method: 'POST', body: JSON.stringify(data) }),
  bookingCsvUrl: () => `${API_BASE}/reports/bookings.csv`,
  customerCsvUrl: () => `${API_BASE}/reports/customers.csv`,
  paymentCsvUrl: () => `${API_BASE}/reports/payments.csv`,
  publicAvailability: (slug, data) => request(`/public/${slug}/availability`, null, { method: 'POST', body: JSON.stringify(data) }),
  publicBooking: (slug, data) => request(`/public/${slug}/bookings`, null, { method: 'POST', body: JSON.stringify(data) })
};
