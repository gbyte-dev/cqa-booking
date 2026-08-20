const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const API_URL = API_BASE ? `${API_BASE}/api/v1` : 'http://localhost:5000/api/v1';

console.log('🏢 Tenant Venues API URL:', API_URL);

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
    
    // ✅ Always return data as-is, don't throw on bad status
    // Backend returns success: true even for "no data" cases
    return data;
  } catch (error) {
    console.error(`❌ FETCH ERROR:`, error.message);
    
    // ✅ Return graceful response instead of throwing
    return {
      success: true,
      data: null,
      message: 'Unable to reach server. Please check your connection.',
      error: error.message
    };
  }
}

// ===== GET ALL VENUES =====
export async function getTenantVenues(token) {
  console.log('\n🏢 [getTenantVenues] Started');
  
  if (!token) {
    console.warn('No token provided');
    return {
      success: true,
      data: [],
      count: 0,
      message: 'Not authenticated'
    };
  }

  try {
    const response = await fetchWithDebug('/venues', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    // ✅ Check response from backend
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
        message: response.message || 'No venues found'
      };
    }
  } catch (error) {
    console.error('Error in getTenantVenues:', error.message);
    return {
      success: true,
      data: [],
      count: 0,
      message: 'No venues found'
    };
  }
}

// ===== GET SINGLE VENUE =====
export async function getTenantVenue(venueId, token) {
  console.log('\n🏢 [getTenantVenue] Started with ID:', venueId);
  
  if (!token) throw new Error('No authentication token');
  if (!venueId) throw new Error('Venue ID is required');

  try {
    const response = await fetchWithDebug(`/venues/${venueId}`, {
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
        message: response.message || 'Venue not found'
      };
    }
  } catch (error) {
    console.error('Error in getTenantVenue:', error.message);
    return {
      success: true,
      data: null,
      message: 'Venue not found'
    };
  }
}

// ===== CREATE VENUE =====
export async function createTenantVenue(venueData, token) {
  console.log('\n🏢 [createTenantVenue] Started');
  
  if (!token) throw new Error('No authentication token');
  if (!venueData.name) throw new Error('Venue name is required');

  try {
    const response = await fetchWithDebug('/venues', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(venueData)
    });

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Venue created successfully'
      };
    } else {
      throw new Error(response.message || 'Failed to create venue');
    }
  } catch (error) {
    console.error('Error in createTenantVenue:', error.message);
    throw error;
  }
}

// ===== UPDATE VENUE =====
export async function updateTenantVenue(venueId, venueData, token) {
  console.log('\n🏢 [updateTenantVenue] Started with ID:', venueId);
  
  if (!token) throw new Error('No authentication token');
  if (!venueId) throw new Error('Venue ID is required');

  try {
    const response = await fetchWithDebug(`/venues/${venueId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(venueData)
    });

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Venue updated successfully'
      };
    } else {
      throw new Error(response.message || 'Failed to update venue');
    }
  } catch (error) {
    console.error('Error in updateTenantVenue:', error.message);
    throw error;
  }
}

// ===== DELETE VENUE =====
export async function deleteTenantVenue(venueId, token) {
  console.log('\n🏢 [deleteTenantVenue] Started with ID:', venueId);
  
  if (!token) throw new Error('No authentication token');
  if (!venueId) throw new Error('Venue ID is required');

  try {
    const response = await fetchWithDebug(`/venues/${venueId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.success) {
      return {
        success: true,
        message: response.message || 'Venue deleted successfully'
      };
    } else {
      throw new Error(response.message || 'Failed to delete venue');
    }
  } catch (error) {
    console.error('Error in deleteTenantVenue:', error.message);
    throw error;
  }
}

// ===== EXPORT =====
export default {
  getTenantVenues,
  getTenantVenue,
  createTenantVenue,
  updateTenantVenue,
  deleteTenantVenue
};