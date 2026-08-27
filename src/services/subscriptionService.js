import { auth } from '../firebase';

const API_BASE = '/api';

async function authFetch(path, options = {}) {
  const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
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

export async function initiateManualPayment(plan, billingCycle, paymentMethod) {
  return authFetch('/manual-payment/initiate', {
    method: 'POST',
    body: JSON.stringify({ plan, billingCycle, paymentMethod }),
  });
}

export async function confirmManualPayment(plan, billingCycle, paymentMethod, reference) {
  return authFetch('/manual-payment/confirm', {
    method: 'POST',
    body: JSON.stringify({ plan, billingCycle, paymentMethod, reference }),
  });
}

export async function activatePayment(paymentId) {
  return authFetch('/vodafone-cash/activate', {
    method: 'POST',
    body: JSON.stringify({ paymentId }),
  });
}

export async function rejectPayment(paymentId) {
  return authFetch('/vodafone-cash/reject', {
    method: 'POST',
    body: JSON.stringify({ paymentId }),
  });
}

export async function getPayments(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return authFetch(`/billing/payments${qs ? '?' + qs : ''}`);
}
