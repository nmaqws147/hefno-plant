const { init, verifyToken } = require('./_lib/firebaseAdmin');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    const auth = req.headers['authorization'];
    if (!auth || !auth.startsWith('Bearer ')) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing Authorization header' }));
      return;
    }

    const token = auth.slice(7);
    const decoded = await verifyToken(token);
    const callerUid = decoded.uid;

    const fb = init();
    const db = fb.firestore();

    // Check caller's role
    const callerDoc = await db.collection('users').doc(callerUid).get();
    if (!callerDoc.exists) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'User not found' }));
      return;
    }

    const callerRole = callerDoc.data().role;
    if (callerRole !== 'admin' && callerRole !== 'super_admin') {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Forbidden: admin role required' }));
      return;
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { targetUid, newRole } = body;

    if (!targetUid || !newRole) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'targetUid and newRole are required' }));
      return;
    }

    const validRoles = ['user', 'admin', 'moderator', 'editor', 'researcher'];
    if (!validRoles.includes(newRole)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` }));
      return;
    }

    await db.collection('users').doc(targetUid).update({
      role: newRole,
      updatedAt: new Date().toISOString(),
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, message: `Role updated to ${newRole}` }));
  } catch (err) {
    console.error('set-role error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
};
