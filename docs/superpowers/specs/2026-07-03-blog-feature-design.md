# Blog Feature — Design Spec

## Overview
Add a blog system to the Hefno-Plant-Delivared app. The admin can write and publish posts; visitors can read them. No authentication — write access is guarded by a secret key. Uses Turso (edge SQLite) for persistence.

## Data Model
```sql
CREATE TABLE posts (
  id          TEXT PRIMARY KEY,          -- UUID v4
  title       TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  body        TEXT NOT NULL,              -- Markdown
  excerpt     TEXT DEFAULT '',
  cover_url   TEXT DEFAULT '',
  published   INTEGER DEFAULT 0,         -- 0=draft, 1=published
  created_at  TEXT NOT NULL,              -- ISO 8601
  updated_at  TEXT NOT NULL               -- ISO 8601
);
```

## API Endpoints — `/api/blog`

| Method | Query Params | Body | Response | Guard |
|--------|-------------|------|----------|-------|
| GET | — | — | `{ posts: [...] }` (published only) | None |
| GET | `?all=1` | — | `{ posts: [...] }` (all) | `x-admin-key` header |
| GET | `?slug=hello-world` | — | `{ post: {...} }` | None |
| POST | — | `{ title, body, excerpt?, cover_url?, published? }` | `{ post: {...} }` | `x-admin-key` header |
| PUT | — | `{ id, title?, body?, excerpt?, cover_url?, published?, slug? }` | `{ post: {...} }` | `x-admin-key` header |
| DELETE | `?id=xxx` | — | `{ ok: true }` | `x-admin-key` header |

**Guard mechanism:** Compare `x-admin-key` header value against `BLOG_ADMIN_KEY` env var. Reject with 401 if mismatch.

## Frontend Components

### Public: `/blog`
- Route: `<Route path="/blog" element={<BlogPage />} />`
- Fetches `GET /api/blog` → renders grid of `<BlogCard>`
- Empty state: "No posts yet — check back soon"
- Loading state: skeleton cards (3x pulsing rectangles)

### Public: `/blog/:slug`
- Route: `<Route path="/blog/:slug" element={<BlogPostPage />} />`
- Fetches `GET /api/blog?slug=:slug` → renders full post
- Hero section: cover image with gradient overlay (or emerald gradient fallback), title overlaid
- Body: max-width 768px centered, 18px font, relaxed leading, emerald links
- 404 state: "Post not found" with link back to `/blog`

### Admin: `/admin/blog`
- Route: `<Route path="/admin/blog" element={<AdminBlogPage />} />`
- Split layout: left = post list with status badges, right = editor
- Post list: title, status (green dot = published, gray = draft), date, delete button
- Editor form: title, slug (auto from title, editable), excerpt, body textarea, cover URL, publish toggle
- Save button labels: "Save Draft" or "Publish" depending on toggle state
- Delete confirmation: simple browser confirm()

### Component tree
```
pages/BlogPage.jsx
  └── component/BlogCard.jsx

pages/BlogPostPage.jsx

pages/AdminBlogPage.jsx
  └── component/BlogEditor.jsx
```

## Visual Design

### Colors
- Primary: `#059669` (emerald-600) — buttons, links, accents
- Secondary bg: `#d1fae5` (emerald-100)
- Body text: `#111827` / `#f3f4f6` (dark)
- Card bg: white / `#1f2937` (dark)
- Card border: `#e5e7eb` / `#374151` (dark), `#059669` on hover
- Page bg: `#f9fafb` / `#111827` (dark)

### Typography
- Headings: Inter, semibold, `tracking-tight`
- Body: Inter, regular, `text-base` (16px), `leading-relaxed` (1.75)
- Blog post body: `text-lg` (18px), `leading-relaxed`, max-width 768px

### Spacing & Layout
- Blog list: 2-col grid on `md+`, 1-col on mobile, `gap-6`
- Cards: `rounded-xl shadow-sm`, padding `p-5`, hover `shadow-md border-emerald-600`
- Blog post: centered column, `px-4 md:px-0`
- Admin editor: flex row on desktop, column on mobile

## Dark Mode
- Uses existing `.dark` class on `<html>` (Tailwind `darkMode: 'class'`)
- Every styled element gets its dark variant
- Emerald accent shifts to `#34d399` in dark mode for contrast

## Error Handling
- API returns `{ error: string }` with appropriate status code
- Frontend shows inline error states (toast via sonner or inline message)
- Network failures caught and shown as "Something went wrong — try again"
- Empty / not-found states handled per component

## Implementation Order
1. Install Turso/libSQL client, set up database schema
2. Build `api/blog.js` with all CRUD endpoints
3. Build `BlogPage` + `BlogCard` (public list)
4. Build `BlogPostPage` (public single post)
5. Build `AdminBlogPage` + `BlogEditor` (admin panel)
6. Add routes to `App.jsx`
7. Add admin link to header (hidden in main nav, accessible via `/admin/blog` URL)

## Non-Goals
- No authentication system (key-guard only)
- No comment system
- No rich text editor (plain textarea + Markdown)
- No image upload (admin provides URL)
- No RSS feed
- No search

## Notes
- Markdown rendering: use `react-markdown` on the public post page (already compatible with React 19)
- Turso database uses `@libsql/client` npm package, works in Vercel Edge Functions and Node.js runtime
