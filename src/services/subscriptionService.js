const API_BASE = '/api';

async function authFetch(path, options = {}) {
  const token = localStorage.getItem('firebaseToken');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function getSubscription() {
  return authFetch('/subscription');
}

export async function createPaymobIntent(plan, billingCycle) {
  return authFetch('/paymob/intent', {
    method: 'POST',
    body: JSON.stringify({ plan, billingCycle }),
  });
}

export async function getPayments(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return authFetch(`/paymob/payments${qs ? '?' + qs : ''}`);
}
