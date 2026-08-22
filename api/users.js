const { verifyToken, isAdmin, getDb } = require('./_lib/firebaseAdmin');

const VALID_ROLES = ['user', 'admin', 'super_admin', 'moderator', 'editor', 'researcher'];
const VALID_STATUSES = ['active', 'inactive', 'suspended'];
const VALID_PLANS = ['free', 'premium', 'elite'];
const PLAN_RANK = { free: 0, premium: 1, elite: 2 };
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const NEW_USERS_DAYS = 30;

function parseUrl(req) {
  return new URL(req.url, `http://${req.headers.host || 'localhost'}`);
}

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return req.body;
}

function toMillis(val) {
  if (val == null) return null;
  if (typeof val === 'number') return val;
  if (val.toDate) return val.toDate().getTime();
  if (val instanceof Date) return val.getTime();
  return new Date(val).getTime();
}

const USER_SAFE_FIELDS = [
  'uid', 'fullName', 'email', 'phoneNumber', 'specialization',
  'profileImage', 'provider', 'role', 'status', 'emailVerified',
  'createdAt', 'updatedAt', 'lastLoginAt',
];

function serializeUser(doc) {
  const d = doc.data ? doc.data() : doc;
  const out = {};
  for (const f of USER_SAFE_FIELDS) {
    if (f === 'createdAt' || f === 'updatedAt' || f === 'lastLoginAt') {
      out[f] = toMillis(d[f]);
    } else {
      out[f] = d[f] !== undefined ? d[f] : null;
    }
  }
  return out;
}

function serializeSubscription(doc) {
  if (!doc || !doc.exists) return null;
  const d = doc.data();
  return {
    plan: d.plan || 'free',
    status: d.status || 'inactive',
    billingCycle: d.billingCycle || null,
    startDate: toMillis(d.startDate),
    expirationDate: toMillis(d.expirationDate),
    renewalDate: toMillis(d.renewalDate),
    createdAt: toMillis(d.createdAt),
    updatedAt: toMillis(d.updatedAt),
    packageQuotas: d.packageQuotas || null,
  };
}

async function fetchSubscriptionsMap(db, uids) {
  const map = {};
  if (!uids || uids.length === 0) return map;
  const snaps = await Promise.all(uids.map(uid => db.collection('subscriptions').doc(uid).get()));
  snaps.forEach((snap, i) => {
    if (snap.exists) map[uids[i]] = serializeSubscription(snap);
  });
  return map;
}

async function requireAdmin(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }
  const token = authHeader.slice(7);
  if (!(await isAdmin(token))) {
    res.status(403).json({ error: 'Admin access required' });
    return null;
  }
  let decoded;
  try {
    decoded = await verifyToken(token);
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
    return null;
  }
  return decoded;
}

// ── List users ──────────────────────────────────────────────
async function handleListUsers(req, res, db) {
  const url = parseUrl(req);
  const page = Math.max(1, parseInt(url.searchParams.get('page')) || 1);
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit')) || DEFAULT_LIMIT, 1), MAX_LIMIT);
  const search = (url.searchParams.get('search') || '').trim().toLowerCase();
  const role = url.searchParams.get('role') || '';
  const status = url.searchParams.get('status') || '';
  const membership = url.searchParams.get('membership') || '';
  const sort = url.searchParams.get('sort') || 'createdAt';
  const order = (url.searchParams.get('order') || 'desc').toLowerCase() === 'asc' ? 1 : -1;

  let query = db.collection('users');
  if (role && VALID_ROLES.includes(role)) query = query.where('role', '==', role);
  if (status && VALID_STATUSES.includes(status)) query = query.where('status', '==', status);

  const snap = await query.get();
  let users = snap.docs.map(serializeUser);

  if (search) {
    users = users.filter(u =>
      (u.fullName && u.fullName.toLowerCase().includes(search)) ||
      (u.email && u.email.toLowerCase().includes(search))
    );
  }

  // Membership filtering requires subscription data across the candidate set.
  let subsMap = null;
  if (membership && VALID_PLANS.includes(membership)) {
    subsMap = await fetchSubscriptionsMap(db, users.map(u => u.uid));
    users = users.filter(u => {
      const plan = subsMap[u.uid]?.plan || 'free';
      if (membership === 'premium') return plan === 'premium';
      if (membership === 'elite') return plan === 'elite';
      return plan === 'free';
    });
  }

  const sorters = {
    name: (a, b) => (a.fullName || '').localeCompare(b.fullName || '') * order,
    createdAt: (a, b) => ((a.createdAt || 0) - (b.createdAt || 0)) * order,
    lastLoginAt: (a, b) => ((a.lastLoginAt || 0) - (b.lastLoginAt || 0)) * order,
    updatedAt: (a, b) => ((a.updatedAt || 0) - (b.updatedAt || 0)) * order,
    membership: (a, b) => {
      if (subsMap === null) return ((a.createdAt || 0) - (b.createdAt || 0)) * order;
      const pa = PLAN_RANK[subsMap[a.uid]?.plan || 'free'];
      const pb = PLAN_RANK[subsMap[b.uid]?.plan || 'free'];
      return (pa - pb) * order;
    },
  };
  if (sorters[sort]) users.sort(sorters[sort]);

  const total = users.length;
  const pageUsers = users.slice((page - 1) * limit, page * limit);

  // Enrich page users with membership info (only if not already fetched).
  if (subsMap === null) {
    subsMap = await fetchSubscriptionsMap(db, pageUsers.map(u => u.uid));
  }

  const rows = pageUsers.map(u => ({
    ...u,
    membership: serializeSubscriptionLike(subsMap[u.uid]),
  }));

  return res.status(200).json({ users: rows, total, page, limit });
}

function serializeSubscriptionLike(sub) {
  if (!sub) return { plan: 'free', status: null };
  return { plan: sub.plan, status: sub.status, billingCycle: sub.billingCycle, expirationDate: sub.expirationDate };
}

// ── Stats ───────────────────────────────────────────────────
async function handleGetStats(req, res, db) {
  const [usersSnap, subsSnap] = await Promise.all([
    db.collection('users').get(),
    db.collection('subscriptions').get(),
  ]);

  const now = Date.now();
  const cutoff = now - NEW_USERS_DAYS * 24 * 60 * 60 * 1000;

  let total = 0, active = 0, inactive = 0, suspended = 0, newUsers = 0;
  const roles = {};

  usersSnap.forEach(doc => {
    const u = serializeUser(doc);
    total++;
    const st = u.status || 'active';
    if (st === 'active') active++;
    else if (st === 'inactive') inactive++;
    else if (st === 'suspended') suspended++;
    roles[u.role || 'user'] = (roles[u.role || 'user'] || 0) + 1;
    if (u.createdAt && u.createdAt >= cutoff) newUsers++;
  });

  let premium = 0;
  subsSnap.forEach(doc => {
    const s = doc.data();
    if (s.status === 'active' && (s.plan === 'premium' || s.plan === 'elite')) premium++;
  });

  return res.status(200).json({
    total,
    active,
    inactive,
    suspended,
    newUsers,
    premium,
    roles,
  });
}

// ── User details ────────────────────────────────────────────
async function handleGetUser(req, res, db, uid) {
  const userSnap = await db.collection('users').doc(uid).get();
  if (!userSnap.exists) return res.status(404).json({ error: 'User not found' });
  const user = serializeUser(userSnap);

  const subSnap = await db.collection('subscriptions').doc(uid).get();
  const sub = serializeSubscription(subSnap);

  let usage = {};
  try {
    const usageSnap = await db.collection('usage').doc(uid).collection('features').get();
    usageSnap.forEach(doc => {
      usage[doc.id] = doc.data();
    });
  } catch (_) { /* usage tracking may be disabled */ }

  return res.status(200).json({ user: { ...user, subscription: sub, usage } });
}

// ── Update user ─────────────────────────────────────────────
async function handleUpdateUser(req, res, db, caller, uid) {
  const body = parseBody(req);
  const userSnap = await db.collection('users').doc(uid).get();
  if (!userSnap.exists) return res.status(404).json({ error: 'User not found' });

  const target = userSnap.data();
  const callerSnap = await db.collection('users').doc(caller.uid).get();
  const callerRole = callerSnap.exists ? callerSnap.data().role : 'user';

  // Security guards
  if (target.role === 'super_admin' && callerRole !== 'super_admin') {
    return res.status(403).json({ error: 'Only super admins can modify a super admin' });
  }
  if (uid === caller.uid) {
    return res.status(403).json({ error: 'You cannot edit your own account here' });
  }
  if (body.role !== undefined && body.role === 'super_admin' && callerRole !== 'super_admin') {
    return res.status(403).json({ error: 'Only super admins can grant the super admin role' });
  }
  if (body.role !== undefined && !VALID_ROLES.includes(body.role)) {
    return res.status(400).json({ error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` });
  }
  if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  const update = { updatedAt: new Date().toISOString() };
  const editable = ['fullName', 'phoneNumber', 'specialization', 'profileImage', 'role', 'status'];
  for (const f of editable) {
    if (body[f] !== undefined && body[f] !== null) update[f] = body[f];
  }

  await db.collection('users').doc(uid).update(update);
  const after = await db.collection('users').doc(uid).get();
  const updated = serializeUser(after);

  const subSnap = await db.collection('subscriptions').doc(uid).get();
  updated.subscription = serializeSubscriptionLike(serializeSubscription(subSnap));

  return res.status(200).json({ user: updated });
}

// ── Delete / deactivate user ────────────────────────────────
async function handleDeleteUser(req, res, db, caller, uid) {
  const userSnap = await db.collection('users').doc(uid).get();
  if (!userSnap.exists) return res.status(404).json({ error: 'User not found' });

  const target = userSnap.data();
  const callerSnap = await db.collection('users').doc(caller.uid).get();
  const callerRole = callerSnap.exists ? callerSnap.data().role : 'user';

  if (uid === caller.uid) {
    return res.status(403).json({ error: 'You cannot delete your own account' });
  }
  if (target.role === 'super_admin' && callerRole !== 'super_admin') {
    return res.status(403).json({ error: 'Only super admins can delete a super admin' });
  }

  // Soft delete — the platform's user model uses status for account state.
  await db.collection('users').doc(uid).update({
    status: 'inactive',
    updatedAt: new Date().toISOString(),
  });

  // Revoke refresh tokens so the user is signed out everywhere.
  try {
    const { admin } = require('./_lib/firebaseAdmin');
    await admin.auth().revokeRefreshTokens(uid);
  } catch (err) {
    console.error('Failed to revoke tokens for deleted user:', err.message);
  }

  return res.status(200).json({ ok: true, deactivated: uid });
}

// ── Router ──────────────────────────────────────────────────
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    const db = getDb();
    if (!db) {
      return res.status(500).json({ error: 'Firebase not configured' });
    }

    const url = parseUrl(req);
    const parts = url.pathname.split('/').filter(Boolean); // ['api','users',...]
    if (parts[0] !== 'api' || parts[1] !== 'users') {
      return res.status(404).json({ error: 'Not found' });
    }

    const caller = await requireAdmin(req, res);
    if (!caller) return;

    const sub = parts[2] || '';
    const uid = parts[3] || '';

    if (req.method === 'GET') {
      if (sub === 'stats') return await handleGetStats(req, res, db);
      if (sub && uid) return await handleGetUser(req, res, db, uid);
      if (!sub) return await handleListUsers(req, res, db);
      return res.status(404).json({ error: 'Not found' });
    }

    if (req.method === 'PUT' && sub && uid) {
      return await handleUpdateUser(req, res, db, caller, uid);
    }

    if (req.method === 'DELETE' && sub && uid) {
      return await handleDeleteUser(req, res, db, caller, uid);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Users API error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
};
