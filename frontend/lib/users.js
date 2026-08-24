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

// ===== GET ALL USERS (CUSTOMERS) =====
export async function getAllCustomers(token) {  
  if (!token) throw new Error('No authentication token');

  return fetchWithDebug('/users/customers', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
}

// ===== GET CUSTOMER BY ID =====
export async function getCustomerById(id, token) {  
  if (!token) throw new Error('No authentication token');
  if (!id) throw new Error('User ID is required');

  return fetchWithDebug(`/users/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
}

// ===== GET CUSTOMER BOOKINGS =====
export async function getCustomerBookings(userId, token) {  
  if (!token) throw new Error('No authentication token');
  if (!userId) throw new Error('User ID is required');

  return fetchWithDebug(`/users/${userId}/bookings`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
}

// ===== UPDATE CUSTOMER =====
export async function updateCustomer(id, data, token) {  
  if (!token) throw new Error('No authentication token');
  if (!id) throw new Error('User ID is required');

  return fetchWithDebug(`/users/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
}

// ===== DELETE CUSTOMER =====
export async function deleteCustomer(id, token) {  
  if (!token) throw new Error('No authentication token');
  if (!id) throw new Error('User ID is required');

  return fetchWithDebug(`/users/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
}

// ===== SUSPEND CUSTOMER =====
export async function suspendCustomer(id, token) {  
  if (!token) throw new Error('No authentication token');
  if (!id) throw new Error('User ID is required');

  return fetchWithDebug(`/users/${id}/suspend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
}

// ===== REACTIVATE CUSTOMER =====
export async function reactivateCustomer(id, token) {  
  if (!token) throw new Error('No authentication token');
  if (!id) throw new Error('User ID is required');

  return fetchWithDebug(`/users/${id}/reactivate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
}

// ===== EXPORT =====
export default {
  getAllCustomers,
  getCustomerById,
  getCustomerBookings,
  updateCustomer,
  deleteCustomer,
  suspendCustomer,
  reactivateCustomer
};