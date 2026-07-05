const { createClient } = require('@libsql/client');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const UPLOADS_DIR = path.join(__dirname, 'uploads');

function isAdmin(req) {
  const key = req.headers['x-admin-key'];
  return key && key === process.env.BLOG_ADMIN_KEY;
}

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

async function ensureTable() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS posts (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      slug        TEXT NOT NULL UNIQUE,
      body        TEXT NOT NULL,
      excerpt     TEXT DEFAULT '',
      cover_url   TEXT DEFAULT '',
      published   INTEGER DEFAULT 0,
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL
    )
  `);
}

const IMAGE_UPLOAD_RE = /^\/api\/blog\/image\/upload$/;
const IMAGE_SERVE_RE = /^\/api\/blog\/image\/([a-f0-9-]+\.\w+)$/;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    await ensureTable();
    const url = new URL(req.url, `http://${req.headers.host}`);
    const method = req.method.toUpperCase();

    if (method === 'POST' && IMAGE_UPLOAD_RE.test(url.pathname)) {
      if (!isAdmin(req)) return json(res, 401, { error: 'Unauthorized' });
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!body.dataUrl) return json(res, 400, { error: 'dataUrl is required' });
      const matches = body.dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) return json(res, 400, { error: 'Invalid dataUrl' });
      const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      const buffer = Buffer.from(matches[2], 'base64');
      const filename = `${crypto.randomUUID()}.${ext}`;
      fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
      return json(res, 200, { url: `/api/blog/image/${filename}` });
    }

    if (method === 'GET' && IMAGE_SERVE_RE.test(url.pathname)) {
      const filename = url.pathname.match(IMAGE_SERVE_RE)[1];
      const filepath = path.join(UPLOADS_DIR, filename);
      if (!fs.existsSync(filepath)) return json(res, 404, { error: 'Image not found' });
      const ext = path.extname(filename).slice(1);
      const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : 'application/octet-stream';
      const data = fs.readFileSync(filepath);
      res.writeHead(200, { 'Content-Type': mime, 'Content-Length': data.length, 'Cache-Control': 'public, max-age=31536000' });
      res.end(data);
      return;
    }

    if (method === 'GET') {
      const slug = url.searchParams.get('slug');
      const all = url.searchParams.get('all');

      if (slug) {
        const result = await turso.execute({
          sql: 'SELECT * FROM posts WHERE slug = ?',
          args: [slug],
        });
        if (result.rows.length === 0) return json(res, 404, { error: 'Post not found' });
        return json(res, 200, { post: result.rows[0] });
      }

      if (all) {
        if (!isAdmin(req)) return json(res, 401, { error: 'Unauthorized' });
        const result = await turso.execute('SELECT * FROM posts ORDER BY created_at DESC');
        return json(res, 200, { posts: result.rows });
      }

      const result = await turso.execute(
        'SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC'
      );
      return json(res, 200, { posts: result.rows });
    }

    if (!isAdmin(req)) return json(res, 401, { error: 'Unauthorized' });

    if (method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!body.title || !body.body) return json(res, 400, { error: 'title and body are required' });

      const id = crypto.randomUUID();
      const rawSlug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      let slug = rawSlug;
      let slugN = 1;
      const now = new Date().toISOString();

      while (true) {
        try {
          await turso.execute({
            sql: `INSERT INTO posts (id, title, slug, body, excerpt, cover_url, published, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [id, body.title, slug, body.body, body.excerpt || '', body.cover_url || '', body.published ? 1 : 0, now, now],
          });
          break;
        } catch (err) {
          if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('posts.slug')) {
            slug = `${rawSlug}-${slugN++}`;
            continue;
          }
          throw err;
        }
      }

      const result = await turso.execute({ sql: 'SELECT * FROM posts WHERE id = ?', args: [id] });
      return json(res, 201, { post: result.rows[0] });
    }

    if (method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!body.id) return json(res, 400, { error: 'id is required' });

      let slugAttempt = body.slug;
      let slugN = 1;

      while (true) {
        const fields = [];
        const args = [];
        ['title', 'slug', 'body', 'excerpt', 'cover_url'].forEach(f => {
          if (body[f] !== undefined) {
            if (f === 'slug' && slugAttempt) {
              fields.push('slug = ?');
              args.push(slugAttempt);
            } else if (f !== 'slug') {
              fields.push(`${f} = ?`);
              args.push(body[f]);
            }
          }
        });
        if (body.published !== undefined) { fields.push('published = ?'); args.push(body.published ? 1 : 0); }
        fields.push('updated_at = ?');
        args.push(new Date().toISOString());
        args.push(body.id);

        try {
          await turso.execute({
            sql: `UPDATE posts SET ${fields.join(', ')} WHERE id = ?`,
            args,
          });
          break;
        } catch (err) {
          if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('posts.slug')) {
            slugAttempt = `${body.slug}-${slugN++}`;
            continue;
          }
          throw err;
        }
      }

      const result = await turso.execute({ sql: 'SELECT * FROM posts WHERE id = ?', args: [body.id] });
      if (result.rows.length === 0) return json(res, 404, { error: 'Post not found' });
      return json(res, 200, { post: result.rows[0] });
    }

    if (method === 'DELETE') {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const id = url.searchParams.get('id');
      if (!id) return json(res, 400, { error: 'id query param is required' });

      await turso.execute({ sql: 'DELETE FROM posts WHERE id = ?', args: [id] });
      return json(res, 200, { ok: true });
    }

    return json(res, 405, { error: 'Method not allowed' });

  } catch (err) {
    console.error('Blog API error:', err);
    return json(res, 500, { error: 'Server error: ' + err.message });
  }
};
