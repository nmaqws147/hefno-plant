const { createClient } = require('@libsql/client');
const crypto = require('crypto');
const { put } = require('@vercel/blob');
const { isAdmin } = require('./_lib/firebaseAdmin');

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const SITE_URL = 'https://hefnoplant.site';
const SITE_NAME = 'Hefno-Plant';
const OG_DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;
const OG_DEFAULT_DESC = 'منصة زراعية متكاملة لتشخيص أمراض النباتات بالذكاء الاصطناعي، دليل المبيدات، التقويم الزراعي، وأكثر.';

function ogHtml({ title, description, image, url, type = 'website' }) {
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  return `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"/>
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}"/>
<meta property="og:type" content="${esc(type)}"/>
<meta property="og:title" content="${esc(title)}"/>
<meta property="og:description" content="${esc(description)}"/>
<meta property="og:url" content="${esc(url)}"/>
<meta property="og:image" content="${esc(image)}"/>
<meta property="og:site_name" content="${SITE_NAME}"/>
<meta property="og:locale" content="ar_AR"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${esc(title)}"/>
<meta name="twitter:description" content="${esc(description)}"/>
<meta name="twitter:image" content="${esc(image)}"/>
<link rel="canonical" href="${esc(url)}"/>
<meta http-equiv="refresh" content="0;url=${esc(url)}"/></head><body><script>location.href="${esc(url)}"</script></body></html>`;
}

function getToken(req) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) return null;
  return auth.slice(7);
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

async function uploadDataUrl(dataUrl) {
  const matches = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) throw new Error('Invalid dataUrl');
  const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  const buffer = Buffer.from(matches[2], 'base64');
  const filename = `${crypto.randomUUID()}.${ext}`;
  const blob = await put(filename, buffer, { access: 'public', token: process.env.BLOB_READ_WRITE_TOKEN });
  return blob.url;
}

const IMAGE_UPLOAD_RE = /^\/api\/blog\/image\/upload$/;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    await ensureTable();
    const url = new URL(req.url, `http://${req.headers.host}`);
    const method = req.method.toUpperCase();

    // OG / social crawler handler (non-API paths only)
    if (!url.pathname.startsWith('/api/')) {
      const slugMatch = url.pathname.match(/^\/blog\/(.+)$/);
      if (slugMatch) {
        const slug = decodeURIComponent(slugMatch[1]);
        const result = await turso.execute({
          sql: 'SELECT title, excerpt, cover_url, body, created_at FROM posts WHERE slug = ? AND published = 1',
          args: [slug],
        });
        if (result.rows.length > 0) {
          const post = result.rows[0];
          const excerpt = post.excerpt || post.body?.replace(/<[^>]+>/g, '').replace(/#{1,6}\s/g, '').slice(0, 160).trim() || OG_DEFAULT_DESC;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
          res.end(ogHtml({
            title: post.title,
            description: excerpt,
            image: (post.cover_url && !post.cover_url.startsWith('data:')) ? post.cover_url : OG_DEFAULT_IMAGE,
            url: `${SITE_URL}/blog/${slug}`,
            type: 'article',
          }));
          return;
        }
      }
      // Default OG for any non-API path
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
      res.end(ogHtml({
        title: `${SITE_NAME} | خبيرك الزراعي الذكي`,
        description: OG_DEFAULT_DESC,
        image: OG_DEFAULT_IMAGE,
        url: `${SITE_URL}${url.pathname}`,
      }));
      return;
    }

    const token = getToken(req);
    let admin = false;
    if (token) {
      try { admin = await isAdmin(token); } catch {}
    }

    if (method === 'POST' && IMAGE_UPLOAD_RE.test(url.pathname)) {
      if (!admin) return json(res, 401, { error: 'Unauthorized' });
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!body.dataUrl) return json(res, 400, { error: 'dataUrl is required' });
      const url = await uploadDataUrl(body.dataUrl);
      return json(res, 200, { url });
    }

    if (method === 'POST' && url.pathname === '/api/blog/format') {
      if (!admin) return json(res, 401, { error: 'Unauthorized' });
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!body.text || typeof body.text !== 'string') return json(res, 400, { error: 'text is required' });

      const categoryHint = body.category ? `تصنيف المقال: ${body.category}.` : '';
      const formatRes = await fetch(process.env.AI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.AI_KEY}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: `أنت مساعد تنسيق مقالات زراعية متخصص. حول النص الخام إلى HTML دلالي منظم.

مهم جداً - قواعد التنسيق:
- H1: عنوان المقال الرئيسي (مرة واحدة في البداية)
- H2: الأقسام الرئيسية (الأعراض، الأسباب، المكافحة، إلخ)
- H3: الأقسام الفرعية
- H4: الأقسام الفرعية المتداخلة
- STRONG: للأسماء المهمة (أمراض، مبيدات، مواد فعالة، تحذيرات)
- EM: للأسماء العلمية والمصطلحات اللاتينية
- BLOCKQUOTE: للاقتباسات والملاحظات
- TABLE: للمعلومات المنظمة جداول (جرعات، مقارنات)

الصناديق المعلوماتية:
- <div class="info-box-warning"> للتحذيرات
- <div class="info-box-danger"> للخطر
- <div class="info-box-info"> للمعلومات
- <div class="info-box-success"> للنجاح
- <div class="info-box-recommendation"> للتوصيات
- <div class="info-box-tip"> لنصائح الخبراء
- <div class="info-box-best-practice"> لأفضل الممارسات

قواعد المقالات الزراعية:
- الأمراض: الأعراض ← الأسباب ← دورة الحياة ← الظروف ← التشخيص ← المكافحة ← الوقاية
- المبيدات: المادة الفعالة ← طريقة التأثير ← الجرعة ← التوقيت ← الاحتياطات
- الأسمدة: المكونات ← النسبة ← التوقيع ← طريقة الاستخدام

مهم: حافظ على المعنى الأصلي. لا تغير أو تخترع معلومات. المخرجات HTML فقط.

ردك JSON فقط: {"title": "عنوان", "excerpt": "ملخص", "html": "<h1>...</h1>"}` },
            { role: 'user', content: `${categoryHint}\n\nقم بتنسيق النص التالي إلى HTML:\n\n${body.text}` },
          ],
          temperature: 0.2,
          max_tokens: 4096,
        }),
      });
      if (!formatRes.ok) throw new Error(`Groq API returned status ${formatRes.status}`);
      const formatData = await formatRes.json();
      let aiText = formatData?.choices?.[0]?.message?.content;
      if (!aiText) throw new Error('AI returned empty response');
      let result;
      try { result = JSON.parse(aiText); } catch {
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        if (jsonMatch) result = JSON.parse(jsonMatch[0]);
        else throw new Error('AI response was not valid JSON');
      }
      if (!result.title || !result.html) throw new Error('AI response missing required fields');
      return json(res, 200, { title: result.title, excerpt: result.excerpt || '', html: result.html });
    }

    if (method === 'GET' && url.pathname === '/api/blog/admin/fix-images') {
      if (!admin) return json(res, 401, { error: 'Unauthorized' });
      const posts = await turso.execute('SELECT * FROM posts');
      const results = { total: posts.rows.length, fixed: 0, skipped: 0, errors: [] };
      for (const post of posts.rows) {
        if (post.cover_url && post.cover_url.startsWith('data:')) {
          try {
            const blobUrl = await uploadDataUrl(post.cover_url);
            await turso.execute({
              sql: 'UPDATE posts SET cover_url = ?, updated_at = ? WHERE id = ?',
              args: [blobUrl, new Date().toISOString(), post.id],
            });
            results.fixed++;
          } catch (err) {
            results.errors.push({ id: post.id, slug: post.slug, error: err.message });
          }
        } else {
          results.skipped++;
        }
      }
      return json(res, 200, results);
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
        if (!admin) return json(res, 401, { error: 'Unauthorized' });
        const result = await turso.execute('SELECT * FROM posts ORDER BY created_at DESC');
        return json(res, 200, { posts: result.rows });
      }

      const result = await turso.execute(
        'SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC'
      );
      return json(res, 200, { posts: result.rows });
    }

    if (!admin) return json(res, 401, { error: 'Unauthorized' });

    if (method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!body.title || !body.body) return json(res, 400, { error: 'title and body are required' });

      let coverUrl = body.cover_url || '';
      if (coverUrl.startsWith('data:')) {
        try { coverUrl = await uploadDataUrl(coverUrl); } catch { coverUrl = ''; }
      }

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
            args: [id, body.title, slug, body.body, body.excerpt || '', coverUrl, body.published ? 1 : 0, now, now],
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

      if (body.cover_url && body.cover_url.startsWith('data:')) {
        try { body.cover_url = await uploadDataUrl(body.cover_url); } catch { body.cover_url = ''; }
      }

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
