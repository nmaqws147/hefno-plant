# Blog Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a blog system where admin can write/publish posts and visitors can read them.

**Architecture:** A Vercel serverless function (`api/blog.js`) handles CRUD against a Turso (edge SQLite) database. The React frontend has public routes (`/blog`, `/blog/:slug`) and an admin route (`/admin/blog`) guarded by a secret key header. No user auth — admin access is key-based.

**Tech Stack:** `@libsql/client` (Turso DB), `react-markdown` (frontend rendering), Turso (free edge-hosted SQLite), Vercel serverless functions.

## Global Constraints
- API files live in `api/` and use CommonJS (`require()`, `module.exports`) per `api/package.json` `"type": "commonjs"`
- All frontend components use Tailwind CSS v3 with `dark:` variants for dark mode (`.dark` class on `<html>`)
- Admin routes require `x-admin-key` header matching `BLOG_ADMIN_KEY` env var — no user auth
- Frontend uses React 19 + react-router-dom v7 (lazy-loaded routes with `Suspense` pattern per existing `App.js`)
- Data goes through Turso (`@libsql/client`) — free tier, edge-hosted SQLite
- Admin can only access `/admin/blog` by navigating directly to the URL (no link in main nav)
- Color palette: primary `#059669` (emerald-600), secondary bg `#d1fae5`, card bg white/`#1f2937` (dark), body text `#111827`/`#f3f4f6` (dark)

---

### Task 1: Install dependencies and add env vars

**Files:**
- Modify: `api/package.json`
- Modify: `package.json` (root)
- Create: `.env.example`
- Modify: `.gitignore` (if `.env` not already listed)

- [ ] **Step 1: Add `@libsql/client` to `api/package.json`**

```json
{
  "name": "netlify-functions",
  "version": "1.0.0",
  "type": "commonjs",
  "dependencies": {
    "@libsql/client": "^0.14.0",
    "@upstash/redis": "^1.28.0",
    "nodemailer": "^8.0.5",
    "unpdf": "^1.0.0"
  }
}
```

- [ ] **Step 2: Install the new dep**

Run: `npm install` inside `api/`

- [ ] **Step 3: Add `react-markdown` to root `package.json`**

```json
"dependencies": {
    "@testing-library/dom": "^10.4.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^13.5.0",
    "react": "^19.2.0",
    "react-chartjs-2": "^5.3.1",
    "react-dom": "^19.2.0",
    "react-markdown": "^9.0.1",
    "react-router-dom": "^7.9.5",
    "react-scripts": "5.0.1",
    "sonner": "^2.0.7"
  }
```

- [ ] **Step 4: Install root dep**

Run: `npm install` in project root

- [ ] **Step 4b: Install @tailwindcss/typography and add to config**

Run: `npm install -D @tailwindcss/typography` in project root

Then update `tailwind.config.js`:
```js
plugins: [
    require('@tailwindcss/typography'),
],
```

- [ ] **Step 5: Create `.env.example`**

```bash
# Turso (Edge SQLite)
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-turso-token

# Blog admin key (shared secret for write operations)
BLOG_ADMIN_KEY=change-this-to-a-random-secret

# Existing (keep as-is):
REDIS_URL=
TOKEN=
IMAGE_AI1=
IMAGE_AI2=
WEATHER=
PASSWORD=
```

- [ ] **Step 6: Ensure `.env` is in `.gitignore`**

Check `.gitignore` contains `.env`. If not, add it.

- [ ] **Step 7: Commit**

```bash
git add api/package.json package.json .env.example .gitignore tailwind.config.js
git commit -m "chore: add libsql, react-markdown, typography deps with env template"
```

---

### Task 2: Build `api/blog.js` — blog CRUD API

**Files:**
- Create: `api/blog.js`

**Interfaces:**
- Consumes: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `BLOG_ADMIN_KEY` env vars
- Produces: Vercel serverless handler at `/api/blog` supporting GET/POST/PUT/DELETE methods

- [ ] **Step 1: Create `api/blog.js` with Turso client init and admin key guard**

```javascript
const { createClient } = require('@libsql/client');

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

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
```

- [ ] **Step 2: Add the request handler**

```javascript
module.exports = async (req, res) => {
  const method = req.method.toUpperCase();

  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-admin-key',
    });
    res.end();
    return;
  }

  try {
    await ensureTable();

    if (method === 'GET') {
      const url = new URL(req.url, `http://${req.headers.host}`);
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
      const body = JSON.parse(req.body || '{}');
      if (!body.title || !body.body) return json(res, 400, { error: 'title and body are required' });

      const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
      const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const now = new Date().toISOString();

      await turso.execute({
        sql: `INSERT INTO posts (id, title, slug, body, excerpt, cover_url, published, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [id, body.title, slug, body.body, body.excerpt || '', body.cover_url || '', body.published ? 1 : 0, now, now],
      });

      const result = await turso.execute({ sql: 'SELECT * FROM posts WHERE id = ?', args: [id] });
      return json(res, 201, { post: result.rows[0] });
    }

    if (method === 'PUT') {
      const body = JSON.parse(req.body || '{}');
      if (!body.id) return json(res, 400, { error: 'id is required' });

      const fields = [];
      const args = [];
      ['title', 'slug', 'body', 'excerpt', 'cover_url'].forEach(f => {
        if (body[f] !== undefined) { fields.push(`${f} = ?`); args.push(body[f]); }
      });
      if (body.published !== undefined) { fields.push('published = ?'); args.push(body.published ? 1 : 0); }
      fields.push('updated_at = ?');
      args.push(new Date().toISOString());
      args.push(body.id);

      await turso.execute({
        sql: `UPDATE posts SET ${fields.join(', ')} WHERE id = ?`,
        args,
      });

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
```

- [ ] **Step 3: Add crypto import at top of the file**

Add `const crypto = require('crypto');` at the top of `api/blog.js`.

- [x] **Step 4: Verify the full file is syntactically correct**

The complete file should have these imports at the top:
```javascript
const { createClient } = require('@libsql/client');
const crypto = require('crypto');
```

- [ ] **Step 5: Commit**

```bash
git add api/blog.js
git commit -m "feat: add blog CRUD API with Turso persistence"
```

---

### Task 3: Build BlogPage + BlogCard (public list)

**Files:**
- Create: `src/pages/BlogPage.jsx`
- Create: `src/component/BlogCard.jsx`

**Interfaces:**
- Consumes: `GET /api/blog` (public, returns published posts)
- Produces: `<BlogPage />` (route `/blog`), `<BlogCard post={...} />`

- [ ] **Step 1: Create `src/component/BlogCard.jsx`**

```jsx
import { Link } from 'react-router-dom';

const BlogCard = ({ post }) => {
  const fallbackGradient = 'linear-gradient(135deg, #059669, #34d399)';

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="block rounded-xl shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-emerald-600 dark:hover:border-emerald-400 transition-all duration-200 overflow-hidden group"
    >
      <div
        className="h-48 bg-cover bg-center"
        style={{
          backgroundImage: post.cover_url ? `url(${post.cover_url})` : fallbackGradient,
        }}
      />
      <div className="p-5">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          {new Date(post.created_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 text-gray-600 dark:text-gray-300 line-clamp-1">
            {post.excerpt}
          </p>
        )}
        <span className="inline-block mt-3 text-emerald-600 dark:text-emerald-400 font-medium text-sm">
          Read more &rarr;
        </span>
      </div>
    </Link>
  );
};

export default BlogCard;
```

- [ ] **Step 2: Create `src/pages/BlogPage.jsx`**

```jsx
import { useState, useEffect } from 'react';
import BlogCard from '../component/BlogCard';

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/blog')
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setPosts(data.posts || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Blog</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse h-80" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Blog</h1>
        <p className="text-red-500">Something went wrong — try again later.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Blog</h1>
      {posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500 dark:text-gray-400">No posts yet — check back soon</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map(post => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogPage;
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/BlogPage.jsx src/component/BlogCard.jsx
git commit -m "feat: add public blog list page with card component"
```

---

### Task 4: Build BlogPostPage (single post view)

**Files:**
- Create: `src/pages/BlogPostPage.jsx`

**Interfaces:**
- Consumes: `GET /api/blog?slug=:slug` (public, returns single post)
- Produces: `<BlogPostPage />` (route `/blog/:slug`)

- [ ] **Step 1: Create `src/pages/BlogPostPage.jsx`**

```jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/blog?slug=${encodeURIComponent(slug)}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setPost(data.post);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Post not found</h1>
        <Link to="/blog" className="text-emerald-600 dark:text-emerald-400 hover:underline">
          &larr; Back to blog
        </Link>
      </div>
    );
  }

  const fallbackGradient = 'linear-gradient(135deg, #059669, #34d399)';

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <Link to="/blog" className="text-emerald-600 dark:text-emerald-400 hover:underline mb-6 inline-block">
        &larr; Back to blog
      </Link>

      <div
        className="w-full h-64 md:h-80 rounded-xl bg-cover bg-center mb-8"
        style={{ backgroundImage: post.cover_url ? `url(${post.cover_url})` : fallbackGradient }}
      />

      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">{post.title}</h1>

      <p className="text-gray-500 dark:text-gray-400 mb-8">
        {new Date(post.created_at).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
        })}
      </p>

      <div className="prose prose-emerald max-w-none dark:text-gray-200 text-lg leading-relaxed">
        <ReactMarkdown>{post.body}</ReactMarkdown>
      </div>
    </article>
  );
};

export default BlogPostPage;
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/BlogPostPage.jsx
git commit -m "feat: add single blog post page with markdown rendering"
```

---

### Task 5: Build AdminBlogPage + BlogEditor (admin panel)

**Files:**
- Create: `src/pages/AdminBlogPage.jsx`
- Create: `src/component/BlogEditor.jsx`

**Interfaces:**
- Consumes: `GET /api/blog?all=1`, `POST /api/blog`, `PUT /api/blog`, `DELETE /api/blog?id=xxx` (all require `x-admin-key` header)
- Produces: `<AdminBlogPage />` (route `/admin/blog`), `<BlogEditor post={...} onSave={...} />`

- [ ] **Step 1: Create `src/component/BlogEditor.jsx`**

```jsx
import { useState, useEffect } from 'react';

const BlogEditor = ({ post, onSave, onDelete }) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [body, setBody] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [published, setPublished] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);

  useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setSlug(post.slug || '');
      setBody(post.body || '');
      setExcerpt(post.excerpt || '');
      setCoverUrl(post.cover_url || '');
      setPublished(Boolean(post.published));
      setSlugEdited(true);
    } else {
      setTitle('');
      setSlug('');
      setBody('');
      setExcerpt('');
      setCoverUrl('');
      setPublished(false);
      setSlugEdited(false);
    }
  }, [post]);

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    if (!slugEdited) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ id: post?.id, title, slug, body, excerpt, coverUrl, published });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Excerpt (optional)</label>
        <input
          type="text"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Body (Markdown)
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={12}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-mono text-sm"
          required
        />
        <p className="text-xs text-gray-400 mt-1">Supports Markdown: `**bold**`, `*italic*`, `[links](url)`, `## headings`, etc.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cover Image URL (optional)</label>
        <input
          type="url"
          value={coverUrl}
          onChange={(e) => setCoverUrl(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600" />
          <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Published</span>
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors duration-200"
        >
          {post?.id ? 'Update' : published ? 'Publish' : 'Save Draft'}
        </button>
        {post?.id && (
          <button
            type="button"
            onClick={() => { if (confirm('Delete this post?')) onDelete(post.id); }}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
};

export default BlogEditor;
```

- [ ] **Step 2: Create `src/pages/AdminBlogPage.jsx`**

```jsx
import { useState, useEffect } from 'react';
import BlogEditor from '../component/BlogEditor';
import { toast } from 'sonner';

const ADMIN_KEY = prompt('Enter admin key:');

const api = async (path, options = {}) => {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': ADMIN_KEY,
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

const AdminBlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadPosts = async () => {
    try {
      const data = await api('/api/blog?all=1');
      setPosts(data.posts || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPosts(); }, []);

  const handleSave = async (postData) => {
    try {
      if (postData.id) {
        const data = await api('/api/blog', {
          method: 'PUT',
          body: JSON.stringify(postData),
        });
        toast.success('Post updated');
        setSelected(data.post);
      } else {
        const data = await api('/api/blog', {
          method: 'POST',
          body: JSON.stringify(postData),
        });
        toast.success('Post created');
        setSelected(data.post);
      }
      loadPosts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api(`/api/blog?id=${id}`, { method: 'DELETE' });
      toast.success('Post deleted');
      setSelected(null);
      loadPosts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!ADMIN_KEY) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-red-500">Admin access requires a key.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Blog Admin</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-72 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Posts</h2>
            <button
              onClick={() => setSelected(null)}
              className="text-sm px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              + New
            </button>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-16 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No posts yet</p>
          ) : (
            <div className="space-y-2 max-h-[70vh] overflow-y-auto">
              {posts.map(post => (
                <button
                  key={post.id}
                  onClick={() => setSelected(post)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selected?.id === post.id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{post.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-block w-2 h-2 rounded-full ${post.published ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <BlogEditor
            key={selected?.id || 'new'}
            post={selected}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminBlogPage;
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/AdminBlogPage.jsx src/component/BlogEditor.jsx
git commit -m "feat: add admin blog page with editor component"
```

---

### Task 6: Wire up routes in App.js and add admin link in header

**Files:**
- Modify: `src/App.js`
- Modify: `src/component/header.jsx`

- [ ] **Step 1: Add lazy imports for blog pages in `App.js`**

Add these imports after the existing lazy imports:

```jsx
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const AdminBlogPage = lazy(() => import('./pages/AdminBlogPage'));
```

- [ ] **Step 2: Add blog routes inside the nested `<Routes>` block**

Before the closing `</Routes>` after the knowledge-base routes:

```jsx
<Route path="/blog" element={<BlogPage />} />
<Route path="/blog/:slug" element={<BlogPostPage />} />
<Route path="/admin/blog" element={<AdminBlogPage />} />
```

- [ ] **Step 3: Verify the App.js file compiles correctly**

The modified section with the new routes should look like:

```jsx
                  </Route>
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/:slug" element={<BlogPostPage />} />
                  <Route path="/admin/blog" element={<AdminBlogPage />} />
                </Routes>
              </main>
            }
          />
        </Routes>
```

- [ ] **Step 4: Commit**

```bash
git add src/App.js
git commit -m "feat: add blog routes to app router"
```

---

### Task 7: Build and verify

**Files:**
- Modify: (none — just build and test)

- [ ] **Step 1: Build the project**

Run: `npx react-scripts build`

Expected: Build completes with no errors. Any warnings about missing deps should be addressed.

- [ ] **Step 2: Run the dev server and verify routes**

Run: `npm start`
Visit in browser:
- `/blog` → shows empty state "No posts yet"
- `/admin/blog` → prompts for admin key, then shows editor
- `/blog/some-post` → shows 404 state

- [ ] **Step 3: Create a post via admin panel**

Enter admin key, create a test post, publish it. Verify it shows on `/blog`.

- [ ] **Step 4: Commit any final fixes**

```bash
git add -A
git commit -m "fix: address build warnings and finalize blog feature"
```
