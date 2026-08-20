const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const API_URL = API_BASE ? `${API_BASE}/api/v1` : 'http://localhost:5000/api/v1';

console.log('👥 Tenant Customers API URL:', API_URL);

async function fetchWithDebug(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  console.log(`\n📡 API REQUEST - ${options.method || 'GET'} ${endpoint}`);

  try {
    const response = await fetch(url, options);
    console.log(`✅ Status: ${response.status}`);
    
    let data = {};
    
    try {
      const text = await response.text();
      if (text) {
        data = JSON.parse(text);
      }
    } catch (parseErr) {
      console.warn('Response parse error:', parseErr.message);
      data = { success: true };
    }
    
    return data;
  } catch (error) {
    console.error(`❌ FETCH ERROR:`, error.message);
    
    return {
      success: true,
      data: null,
      message: 'Unable to reach server',
      error: error.message
    };
  }
}

// ===== GET ALL CUSTOMERS =====
export async function getTenantCustomers(token) {
  console.log('\n👥 [getTenantCustomers] Started');
  
  if (!token) {
    return {
      success: true,
      data: [],
      count: 0,
      message: 'Not authenticated'
    };
  }

  try {
    const response = await fetchWithDebug('/customers', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.success) {
      return {
        success: true,
        data: response.data || [],
        count: response.count || 0,
        message: response.message || 'Success'
      };
    } else {
      return {
        success: true,
        data: [],
        count: 0,
        message: response.message || 'No customers found'
      };
    }
  } catch (error) {
    console.error('Error in getTenantCustomers:', error.message);
    return {
      success: true,
      data: [],
      count: 0,
      message: 'No customers found'
    };
  }
}

// ===== GET SINGLE CUSTOMER PROFILE =====
export async function getTenantCustomerProfile(customerId, token) {
  console.log('\n👥 [getTenantCustomerProfile] Started with ID:', customerId);
  
  if (!token) throw new Error('No authentication token');
  if (!customerId) throw new Error('Customer ID is required');

  try {
    const response = await fetchWithDebug(`/customers/${customerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Success'
      };
    } else {
      return {
        success: true,
        data: null,
        message: response.message || 'Customer not found'
      };
    }
  } catch (error) {
    console.error('Error in getTenantCustomerProfile:', error.message);
    throw error;
  }
}

// ===== GET CUSTOMER BOOKINGS =====
export async function getTenantCustomerBookings(customerId, token) {
  console.log('\n📋 [getTenantCustomerBookings] Started with ID:', customerId);
  
  if (!token) throw new Error('No authentication token');
  if (!customerId) throw new Error('Customer ID is required');

  try {
    const response = await fetchWithDebug(`/customers/${customerId}/bookings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.success) {
      return {
        success: true,
        data: response.data || [],
        stats: response.stats || {},
        message: response.message || 'Success'
      };
    } else {
      return {
        success: true,
        data: [],
        stats: {},
        message: response.message || 'No bookings found'
      };
    }
  } catch (error) {
    console.error('Error in getTenantCustomerBookings:', error.message);
    throw error;
  }
}

// ===== UPDATE CUSTOMER PROFILE =====
export async function updateTenantCustomerProfile(customerId, customerData, token) {
  console.log('\n👥 [updateTenantCustomerProfile] Started with ID:', customerId);
  
  if (!token) throw new Error('No authentication token');
  if (!customerId) throw new Error('Customer ID is required');

  try {
    const response = await fetchWithDebug(`/customers/${customerId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(customerData)
    });

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Profile updated successfully'
      };
    } else {
      throw new Error(response.message || 'Failed to update profile');
    }
  } catch (error) {
    console.error('Error in updateTenantCustomerProfile:', error.message);
    throw error;
  }
}

// ===== SUSPEND CUSTOMER =====
export async function suspendTenantCustomer(customerId, token) {
  console.log('\n⛔ [suspendTenantCustomer] Started with ID:', customerId);
  
  if (!token) throw new Error('No authentication token');
  if (!customerId) throw new Error('Customer ID is required');

  try {
    const response = await fetchWithDebug(`/customers/${customerId}/suspend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        reason: 'Customer suspended by admin' 
      })
    });

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Customer suspended'
      };
    } else {
      throw new Error(response.message || 'Failed to suspend customer');
    }
  } catch (error) {
    console.error('Error in suspendTenantCustomer:', error.message);
    throw error;
  }
}

// ===== ACTIVATE CUSTOMER =====
export async function activateTenantCustomer(customerId, token) {
  console.log('\n✅ [activateTenantCustomer] Started with ID:', customerId);
  
  if (!token) throw new Error('No authentication token');
  if (!customerId) throw new Error('Customer ID is required');

  try {
    const response = await fetchWithDebug(`/customers/${customerId}/activate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Customer activated'
      };
    } else {
      throw new Error(response.message || 'Failed to activate customer');
    }
  } catch (error) {
    console.error('Error in activateTenantCustomer:', error.message);
    throw error;
  }
}

// ===== DELETE CUSTOMER =====
export async function deleteTenantCustomer(customerId, token) {
  console.log('\n🗑️ [deleteTenantCustomer] Started with ID:', customerId);
  
  if (!token) throw new Error('No authentication token');
  if (!customerId) throw new Error('Customer ID is required');

  try {
    const response = await fetchWithDebug(`/customers/${customerId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.success) {
      return {
        success: true,
        message: response.message || 'Customer deleted successfully'
      };
    } else {
      throw new Error(response.message || 'Failed to delete customer');
    }
  } catch (error) {
    console.error('Error in deleteTenantCustomer:', error.message);
    throw error;
  }
}

// ===== EXPORT =====
export default {
  getTenantCustomers,
  getTenantCustomerProfile,
  getTenantCustomerBookings,
  updateTenantCustomerProfile,
  suspendTenantCustomer,
  activateTenantCustomer,
  deleteTenantCustomer
};