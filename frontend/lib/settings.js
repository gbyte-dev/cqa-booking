// ===== API CONFIGURATION =====
const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const API_URL = API_BASE ? `${API_BASE}/api/v1` : 'http://localhost:5000/api/v1';

async function fetchWithDebug(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || `HTTP ${response.status}`);
  }

  return data;
}

// ===== GET PLATFORM SETTINGS =====
export async function getPlatformSettings(token) {
  if (!token) throw new Error('No authentication token');

  return fetchWithDebug('/superadmin/settings', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });
}

// ===== UPDATE PLATFORM SETTINGS =====
export async function updatePlatformSettings(token, data) {
  if (!token) throw new Error('No authentication token');

  return fetchWithDebug('/superadmin/settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
}
