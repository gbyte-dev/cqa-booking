// ===== API CONFIGURATION =====
const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const API_URL = API_BASE ? `${API_BASE}/api/v1` : 'http://localhost:5000/api/v1';

console.log('👥 Users API URL:', API_URL);

// ===== REQUEST HELPER =====
async function fetchWithDebug(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  console.log(`\n📡 API REQUEST - ${options.method || 'GET'} ${endpoint}`);

  try {
    const response = await fetch(url, options);
    console.log(`✅ Status: ${response.status}`);
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`❌ Error Response:`, data);
      throw new Error(data?.error || `HTTP ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error(`❌ FETCH ERROR:`, error.message);
    throw error;
  }
}

// ===== GET ALL USERS (CUSTOMERS) =====
export async function getAllCustomers(token) {
  console.log('\n👥 [getAllCustomers] Started');
  
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
  console.log('\n👥 [getCustomerById] Started with ID:', id);
  
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
  console.log('\n📋 [getCustomerBookings] Started with User ID:', userId);
  
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
  console.log('\n✏️ [updateCustomer] Started with ID:', id);
  
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
  console.log('\n🗑️ [deleteCustomer] Started with ID:', id);
  
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
  console.log('\n🔒 [suspendCustomer] Started with ID:', id);
  
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
  console.log('\n✅ [reactivateCustomer] Started with ID:', id);
  
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