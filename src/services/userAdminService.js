import { auth } from '../firebase';

const API_BASE = '/api';

async function authFetch(path, options = {}) {
  const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function getUsers(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, v);
  });
  const query = qs.toString();
  return authFetch(`/users${query ? '?' + query : ''}`);
}

export async function getUserStats() {
  return authFetch('/users/stats');
}

export async function getUserDetails(uid) {
  return authFetch(`/users/${uid}`);
}

export async function updateUser(uid, data) {
  return authFetch(`/users/${uid}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteUser(uid) {
  return authFetch(`/users/${uid}`, { method: 'DELETE' });
}
