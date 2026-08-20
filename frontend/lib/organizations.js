// ===== API CONFIGURATION =====
const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const API_URL = API_BASE ? `${API_BASE}/api/v1` : 'http://localhost:5000/api/v1';

console.log('🏢 Organizations API URL:', API_URL);

// ===== REQUEST HELPER =====
async function fetchWithDebug(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  console.log(`\n📡 API REQUEST - ${options.method || 'GET'} ${endpoint}`);
  console.log(`Full URL: ${url}`);

  try {
    const response = await fetch(url, options);
    
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`❌ Error Response:`, data);
      throw new Error(data?.error || `HTTP ${response.status}`);
    }
    
    console.log(`✅ Response received:`, data);
    return data;
  } catch (error) {
    console.error(`❌ FETCH ERROR:`, error.message);
    throw error;
  }
}

// ===== GET ALL ORGANIZATIONS =====
export async function getAllOrganizations(token) {
  console.log('\n🏢 [getAllOrganizations] Started');
  
  if (!token) throw new Error('No authentication token');

  return fetchWithDebug('/organizations', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
}

// ===== GET ORGANIZATION BY ID =====
export async function getOrganizationById(id, token) {
  console.log('\n🏢 [getOrganizationById] Started with ID:', id);
  
  if (!token) throw new Error('No authentication token');
  if (!id) throw new Error('Organization ID is required');

  return fetchWithDebug(`/organizations/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
}

// ===== CREATE ORGANIZATION =====
export async function createOrganization(data, token) {
  console.log('\n➕ [createOrganization] Started with data:', data);
  
  if (!token) throw new Error('No authentication token');
  if (!data.name) throw new Error('Organization name is required');
  if (!data.slug) throw new Error('Organization slug is required');

  return fetchWithDebug('/organizations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
}

// ===== UPDATE ORGANIZATION =====
export async function updateOrganization(id, data, token) {
  console.log('\n✏️ [updateOrganization] Started with ID:', id, 'Data:', data);
  
  if (!token) throw new Error('No authentication token');
  if (!id) throw new Error('Organization ID is required');

  return fetchWithDebug(`/organizations/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
}

// ===== DELETE ORGANIZATION =====
export async function deleteOrganization(id, token) {
  console.log('\n🗑️ [deleteOrganization] Started with ID:', id);
  
  if (!token) throw new Error('No authentication token');
  if (!id) throw new Error('Organization ID is required');

  return fetchWithDebug(`/organizations/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
}

// ===== SUSPEND ORGANIZATION =====
export async function suspendOrganization(id, token) {
  console.log('\n🔒 [suspendOrganization] Started with ID:', id);
  
  if (!token) throw new Error('No authentication token');
  if (!id) throw new Error('Organization ID is required');

  return fetchWithDebug(`/organizations/${id}/suspend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
}

// ===== REACTIVATE ORGANIZATION =====
export async function reactivateOrganization(id, token) {
  console.log('\n✅ [reactivateOrganization] Started with ID:', id);
  
  if (!token) throw new Error('No authentication token');
  if (!id) throw new Error('Organization ID is required');

  return fetchWithDebug(`/organizations/${id}/reactivate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
}

// ===== EXPORT ALL =====
export default {
  getAllOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  suspendOrganization,
  reactivateOrganization
};