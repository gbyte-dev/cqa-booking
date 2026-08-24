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
    }    return data;
  } catch (error) {    throw error;
  }
}

// ===== GET ALL ORGANIZATIONS =====
export async function getAllOrganizations(token) {  
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