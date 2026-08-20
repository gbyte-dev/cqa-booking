// ===== API CONFIGURATION =====
const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const API_URL = API_BASE ? `${API_BASE}/api/v1` : 'http://localhost:5000/api/v1';

console.log('💳 Subscriptions API URL:', API_URL);

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

// ===== GET ALL SUBSCRIPTIONS =====
export async function getAllSubscriptions(token) {
  console.log('\n💳 [getAllSubscriptions] Started');
  
  if (!token) throw new Error('No authentication token');

  return fetchWithDebug('/superadmin/subscriptions', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
}

// ===== GET SUBSCRIPTION DETAILS =====
export async function getSubscriptionDetails(subscriptionId, token) {
  console.log('\n💳 [getSubscriptionDetails] Started with ID:', subscriptionId);
  
  if (!token) throw new Error('No authentication token');
  if (!subscriptionId) throw new Error('Subscription ID is required');

  return fetchWithDebug(`/superadmin/subscriptions/${subscriptionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
}

// ===== CHANGE PLAN =====
export async function changePlan(subscriptionId, plan, token) {
  console.log('\n📊 [changePlan] Started with ID:', subscriptionId, 'Plan:', plan);
  
  if (!token) throw new Error('No authentication token');
  if (!subscriptionId) throw new Error('Subscription ID is required');
  if (!plan) throw new Error('Plan is required');

  return fetchWithDebug(`/superadmin/subscriptions/${subscriptionId}/change-plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ plan })
  });
}

// ===== CANCEL SUBSCRIPTION =====
export async function cancelSubscription(subscriptionId, reason, token) {
  console.log('\n❌ [cancelSubscription] Started with ID:', subscriptionId);
  
  if (!token) throw new Error('No authentication token');
  if (!subscriptionId) throw new Error('Subscription ID is required');

  return fetchWithDebug(`/superadmin/subscriptions/${subscriptionId}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ reason })
  });
}

// ===== UPDATE AUTO-RENEW =====
export async function updateAutoRenew(subscriptionId, autoRenew, token) {
  console.log('\n🔄 [updateAutoRenew] Started with ID:', subscriptionId);
  
  if (!token) throw new Error('No authentication token');
  if (!subscriptionId) throw new Error('Subscription ID is required');

  return fetchWithDebug(`/superadmin/subscriptions/${subscriptionId}/auto-renew`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ autoRenew })
  });
}

// ===== GET PAYMENTS =====
export async function getPayments(subscriptionId, token) {
  console.log('\n💰 [getPayments] Started for subscription:', subscriptionId);
  
  if (!token) throw new Error('No authentication token');

  return fetchWithDebug(`/superadmin/payments?subscriptionId=${subscriptionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
}

// ===== GET SUBSCRIPTION STATS =====
export async function getSubscriptionStats(token) {
  console.log('\n📊 [getSubscriptionStats] Started');
  
  if (!token) throw new Error('No authentication token');

  return fetchWithDebug('/superadmin/subscriptions/stats', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
}

// ===== EXPORT =====
export default {
  getAllSubscriptions,
  getSubscriptionDetails,
  changePlan,
  cancelSubscription,
  updateAutoRenew,
  getPayments,
  getSubscriptionStats
};