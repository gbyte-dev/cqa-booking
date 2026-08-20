// ===== API CONFIGURATION =====
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

console.log('🔌 Super Admin API URL:', API_URL);

// ===== DASHBOARD STATS =====
export async function getDashboardStats(token) {
  try {
    console.log('📊 Fetching dashboard stats...');
    
    const res = await fetch(`${API_URL}/api/v1/superadmin/dashboard/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();
    
    console.log('✅ Stats Response:', data);
    
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch stats');
    }
    
    return data;
  } catch (error) {
    console.error('❌ Stats Error:', error);
    throw error;
  }
}

// ===== ORGANIZATIONS =====
export async function getOrganizations(token) {
  try {
    console.log('🏢 Fetching organizations...');
    
    const res = await fetch(`${API_URL}/api/v1/superadmin/organizations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();
    
    console.log('✅ Organizations Response:', data);
    
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch organizations');
    }
    
    return data;
  } catch (error) {
    console.error('❌ Organizations Error:', error);
    throw error;
  }
}

export async function getOrganizationById(organizationId, token) {
  try {
    const res = await fetch(`${API_URL}/api/v1/superadmin/organizations/${organizationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

export async function updateOrganization(organizationId, data, token) {
  try {
    const res = await fetch(
      `${API_URL}/api/v1/superadmin/organizations/${organizationId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      }
    );

    const responseData = await res.json();
    if (!res.ok) throw new Error(responseData.error);
    return responseData;
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// ===== SUSPEND/REACTIVATE =====
export async function suspendOrganization(organizationId, token) {
  try {
    console.log('🔒 Suspending organization:', organizationId);
    
    const res = await fetch(
      `${API_URL}/api/v1/superadmin/organizations/${organizationId}/suspend`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const data = await res.json();
    
    console.log('✅ Suspend Response:', data);
    
    if (!res.ok) throw new Error(data.error);
    return data;
  } catch (error) {
    console.error('❌ Suspend Error:', error);
    throw error;
  }
}

export async function reactivateOrganization(organizationId, token) {
  try {
    console.log('✅ Reactivating organization:', organizationId);
    
    const res = await fetch(
      `${API_URL}/api/v1/superadmin/organizations/${organizationId}/reactivate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const data = await res.json();
    
    console.log('✅ Reactivate Response:', data);
    
    if (!res.ok) throw new Error(data.error);
    return data;
  } catch (error) {
    console.error('❌ Reactivate Error:', error);
    throw error;
  }
}

// ===== SUBSCRIPTIONS =====
export async function getSubscriptions(token) {
  try {
    const res = await fetch(`${API_URL}/api/v1/superadmin/subscriptions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

export async function changePlan(subscriptionId, plan, token) {
  try {
    const res = await fetch(
      `${API_URL}/api/v1/superadmin/subscriptions/${subscriptionId}/change-plan`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plan })
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

export async function cancelSubscription(subscriptionId, reason, token) {
  try {
    const res = await fetch(
      `${API_URL}/api/v1/superadmin/subscriptions/${subscriptionId}/cancel`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// ===== PAYMENTS =====
export async function getPayments(token) {
  try {
    const res = await fetch(`${API_URL}/api/v1/superadmin/payments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// ===== EXPORT =====
export default {
  getDashboardStats,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  suspendOrganization,
  reactivateOrganization,
  getSubscriptions,
  changePlan,
  cancelSubscription,
  getPayments
};

