const API_BASE = '/api';

export async function checkQuota(featureId, { guestId, authToken } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (guestId) headers['X-Guest-Id'] = guestId;
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const res = await fetch(`${API_BASE}/check-quota`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ featureId }),
  });

  const data = await res.json();
  return { ...data, allowed: res.ok };
}
