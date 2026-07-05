# Blog Premium Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the blog listing and article pages from a clean utilitarian design to a nature-inspired premium magazine experience.

**Architecture:** All changes are frontend-only (Tailwind CSS utility classes + Playfair Display Google Font). The existing page/component structure is preserved — only the JSX markup and Tailwind classes change. No backend, API, or admin changes.

**Tech Stack:** React, Tailwind CSS, `@tailwindcss/typography` (prose), Playfair Display (Google Fonts)

**Note:** The app uses RTL layout (`direction: rtl`). Ensure arrow icons and decorative elements respect the RTL direction. The masonry grid uses CSS columns which work naturally in RTL.

## Global Constraints

- All colors from the Forest + Champagne palette: `#1e352f` (forest green), `#faf7f0` (cream bg), `#b8955a` (gold), `#2d2a24` (body text), `#e8e3d8` (card borders), `#ffffff` (card bg)
- Playfair Display for h1-h3 headings; UbuntuCustom or system sans-serif for body/meta
- Dark mode: backgrounds `#1a1a1a` / `#242424`, borders `#333`, gold accents preserved, forest headings lighten to `#2d5a4a`
- No changes to admin panel or blog editor
- Image upload system unchanged

---
## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `public/index.html` | Modify | Add Google Fonts preconnect + stylesheet link for Playfair Display |
| `tailwind.config.js` | Modify | Add forest, champagne, gold custom colors |
| `src/component/blog/BlogCard.jsx` | Rewrite | Premium card with new palette, typography, hover effects |
| `src/pages/blog/BlogPage.jsx` | Rewrite | Hero section + masonry grid with new design |
| `src/pages/blog/BlogPostPage.jsx` | Rewrite | Magazine-style article layout with drop cap, gold accents |

---

### Task 1: Add Playfair Display Font & Custom Colors

**Files:**
- Modify: `public/index.html`
- Modify: `tailwind.config.js`

**Interfaces:**
- Consumes: (none)
- Produces: Playfair Display available via `font-serif` utility in Tailwind; custom colors `forest`, `gold`, `champagne` available as Tailwind classes

- [ ] **Step 1: Add Google Fonts link to `public/index.html`**

Insert after the last `<link>` tag (before `<title>`):

```html
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
```

- [ ] **Step 2: Add custom colors to `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#1e352f',
          light: '#2d5a4a',
        },
        gold: {
          DEFAULT: '#b8955a',
          light: '#d4b87a',
        },
        champagne: {
          DEFAULT: '#faf7f0',
          dark: '#f5f0e5',
        },
        dark: {
          bg: '#0f1a09',
          card: '#1a2c0d',
          text: '#e8f5e8',
          'text-secondary': '#a8c6a8',
          border: '#2d4a1f',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

- [ ] **Step 3: Commit**

---

### Task 2: Redesign BlogCard Component

**Files:**
- Rewrite: `src/component/blog/BlogCard.jsx`

**Interfaces:**
- Consumes: `{ post }` prop (same shape as before: `id`, `title`, `slug`, `body`, `excerpt`, `cover_url`, `created_at`)
- Produces: `<Link>` card element (same external contract — used by BlogPage)
- Depends on: Task 1 (font-family `serif`, colors `forest`, `gold` available)

- [ ] **Step 1: Rewrite `BlogCard.jsx`**

Replace entire file:

```jsx
import { Link } from 'react-router-dom';

const BlogCard = ({ post }) => {
  const words = post.body ? post.body.split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(words / 200));

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group block bg-white dark:bg-[#242424] rounded-2xl shadow-sm hover:shadow-xl border border-[#e8e3d8] dark:border-[#333] hover:border-gold/30 dark:hover:border-gold/30 transition-all duration-500 overflow-hidden hover:-translate-y-1"
      style={{ breakInside: 'avoid' }}
    >
      <div className="h-1 bg-forest dark:bg-forest-light transition-colors duration-300" />
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-800">
        {post.cover_url ? (
          <img
            src={post.cover_url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-forest to-gold" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
      <div className="p-6 sm:p-7">
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.15em] text-[#8a8580] dark:text-gray-500 mb-3 font-medium">
          <time dateTime={post.created_at}>
            {new Date(post.created_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
          </time>
          <span className="w-1 h-1 rounded-full bg-[#e8e3d8] dark:bg-gray-600" />
          <span>{readTime} min read</span>
        </div>
        <h3 className="text-lg font-serif font-semibold text-forest dark:text-[#f5f5f4] group-hover:text-gold dark:group-hover:text-gold transition-colors leading-snug line-clamp-2">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 text-sm text-[#2d2a24] dark:text-[#a8a29e] line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>
        )}
        <span className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-gold group-hover:gap-3 transition-all">
          Read article
          <svg className="w-4 h-4 flex-shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </span>
      </div>
    </Link>
  );
};

export default BlogCard;
```

- [ ] **Step 2: Commit**

---

### Task 3: Redesign BlogPage (Listing)

**Files:**
- Rewrite: `src/pages/blog/BlogPage.jsx`

**Interfaces:**
- Consumes: `BlogCard` from `../../component/blog/BlogCard` (updated in Task 2)
- Produces: Blog listing page with hero + masonry grid
- Depends on: Task 1 (colors), Task 2 (BlogCard)

- [ ] **Step 1: Rewrite `BlogPage.jsx`**

Replace entire file:

```jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BlogCard from '../../component/blog/BlogCard';

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
      <div className="min-h-screen bg-champagne dark:bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="mb-14">
            <div className="h-10 w-48 bg-[#e8e3d8] dark:bg-gray-700 rounded animate-pulse mb-3" />
            <div className="h-5 w-80 bg-[#e8e3d8] dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 sm:gap-10 space-y-8 sm:space-y-10">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="rounded-2xl bg-[#e8e3d8] dark:bg-gray-700 animate-pulse" style={{ breakInside: 'avoid' }}>
                <div className="aspect-[16/9]" />
                <div className="p-6 space-y-3">
                  <div className="h-3 bg-[#d4cfc8] dark:bg-gray-600 rounded w-1/3" />
                  <div className="h-5 bg-[#d4cfc8] dark:bg-gray-600 rounded w-3/4" />
                  <div className="h-4 bg-[#d4cfc8] dark:bg-gray-600 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-champagne dark:bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center px-4">
          <svg className="w-16 h-16 mx-auto text-gold/40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h2 className="text-xl font-serif font-semibold text-forest dark:text-[#f5f5f4] mb-2">Something went wrong</h2>
          <p className="text-[#8a8580] dark:text-gray-400">Could not load blog posts. Please try again later.</p>
        </div>
      </div>
    );
  }

  const featured = posts[0];

  return (
    <div className="min-h-screen bg-champagne dark:bg-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="mb-12 sm:mb-14">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-forest dark:text-[#f5f5f4] tracking-tight">
            Blog
          </h1>
          <div className="mt-3 w-16 h-0.5 bg-gold" />
          <p className="mt-4 text-lg text-[#2d2a24] dark:text-[#a8a29e] max-w-2xl">
            Insights, guides, and updates from the Hefno team
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-20 h-20 mx-auto text-gold/30 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <h2 className="text-2xl font-serif font-semibold text-[#8a8580] dark:text-gray-500 mb-2">No articles yet</h2>
            <p className="text-[#8a8580] dark:text-gray-500">Check back soon for new articles</p>
          </div>
        ) : (
          <>
            {featured && (
              <div className="mb-14 sm:mb-16">
                <Link
                  to={`/blog/${featured.slug}`}
                  className="group block relative w-full h-[440px] sm:h-[520px] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-0.5"
                >
                  {featured.cover_url ? (
                    <img
                      src={featured.cover_url}
                      alt={featured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-forest to-gold" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-10">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-gold text-white mb-4 shadow-sm">
                      Featured
                    </span>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white leading-tight max-w-2xl">
                      {featured.title}
                    </h2>
                    {featured.excerpt && (
                      <p className="mt-3 text-sm sm:text-base text-white/80 leading-relaxed max-w-xl line-clamp-2">
                        {featured.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-5 text-sm text-white/60">
                      <time dateTime={featured.created_at}>
                        {new Date(featured.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </time>
                      <span className="w-1 h-1 rounded-full bg-white/30" />
                      <span>{Math.max(1, Math.ceil((featured.body || '').split(/\s+/).length / 200))} min read</span>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            <div className="flex items-center gap-4 mb-8 sm:mb-10">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
              <span className="text-xs uppercase tracking-[0.2em] text-gold font-medium">Latest Articles</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            </div>

            {posts.length > 1 && (
              <div className="columns-1 md:columns-2 lg:columns-3 gap-8 sm:gap-10 space-y-8 sm:space-y-10 [&>a]:mb-8 sm:[&>a]:mb-10">
                {posts.slice(1).map(post => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
```

- [ ] **Step 2: Commit**

---

### Task 4: Redesign BlogPostPage (Magazine Article)

**Files:**
- Rewrite: `src/pages/blog/BlogPostPage.jsx`

**Interfaces:**
- Consumes: `post` object from API (same shape: `title`, `slug`, `body`, `cover_url`, `created_at`)
- Produces: Magazine-style article page
- Depends on: Task 1 (colors, font), `@tailwindcss/typography` prose classes

- [ ] **Step 1: Rewrite `BlogPostPage.jsx`**

Replace entire file:

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
      <div className="min-h-screen bg-champagne dark:bg-[#1a1a1a]">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-5 bg-[#e8e3d8] dark:bg-gray-700 rounded w-24" />
            <div className="h-[400px] bg-[#e8e3d8] dark:bg-gray-700 rounded-xl" />
            <div className="h-10 bg-[#e8e3d8] dark:bg-gray-700 rounded w-3/4" />
            <div className="h-4 bg-[#e8e3d8] dark:bg-gray-700 rounded w-1/4" />
            <div className="h-4 bg-[#e8e3d8] dark:bg-gray-700 rounded" />
            <div className="h-4 bg-[#e8e3d8] dark:bg-gray-700 rounded" />
            <div className="h-4 bg-[#e8e3d8] dark:bg-gray-700 rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-champagne dark:bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center px-4">
          <svg className="w-16 h-16 mx-auto text-gold/40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-2xl font-serif font-semibold text-forest dark:text-[#f5f5f4] mb-2">Post not found</h1>
          <Link to="/blog" className="text-gold hover:text-gold/80 transition-colors">
            &larr; Back to blog
          </Link>
        </div>
      </div>
    );
  }

  const readTime = Math.max(1, Math.ceil((post.body || '').split(/\s+/).length / 200));

  return (
    <div className="min-h-screen bg-champagne dark:bg-[#1a1a1a]">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-[#8a8580] dark:text-[#a8a29e] hover:text-gold dark:hover:text-gold mb-10 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to blog
        </Link>

        <div className="relative w-full max-h-[500px] rounded-2xl overflow-hidden shadow-sm border-2 border-gold/20 mb-10">
          {post.cover_url ? (
            <>
              <img
                src={post.cover_url}
                alt={post.title}
                className="w-full h-[400px] sm:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/20 to-transparent" />
            </>
          ) : (
            <div className="w-full h-[400px] sm:h-[500px] bg-gradient-to-br from-forest to-gold" />
          )}
        </div>

        <div className="max-w-[740px] mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-forest dark:text-[#f5f5f4] leading-tight tracking-tight mb-4">
            {post.title}
          </h1>

          <div className="w-16 h-0.5 bg-gold mb-6" />

          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.15em] text-[#8a8580] dark:text-[#a8a29e] mb-10 font-medium">
            <time dateTime={post.created_at}>
              {new Date(post.created_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </time>
            <span className="w-1 h-1 rounded-full bg-gold" />
            <span>{readTime} min read</span>
          </div>

          <div className="bg-white dark:bg-[#242424] rounded-xl p-8 sm:p-10 shadow-sm border border-[#e8e3d8] dark:border-[#333]">
            <div className="prose prose-lg prose-forest dark:prose-invert max-w-none leading-relaxed
              [&_h1]:font-serif [&_h2]:font-serif [&_h3]:font-serif [&_h4]:font-serif
              [&_h2]:text-forest [&_h3]:text-forest [&_h4]:text-forest
              [&_h2]:dark:text-[#f5f5f4] [&_h3]:dark:text-[#f5f5f4]
              [&_h2]:mt-10 [&_h3]:mt-8
              [&_a]:text-forest [&_a]:dark:text-gold [&_a]:hover:text-gold [&_a]:dark:hover:text-gold/80 [&_a]:no-underline [&_a]:transition-colors
              [&_blockquote]:border-l-gold [&_blockquote]:text-[#2d2a24] [&_blockquote]:dark:text-[#d4cfc8] [&_blockquote]:italic
              [&_hr]:border-gold/30 [&_hr]:w-1/2 [&_hr]:mx-auto
              [&_img]:rounded-lg [&_img]:shadow-sm
              first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-forest first-letter:dark:text-gold first-letter:float-left first-letter:mr-3 first-letter:mt-1
            ">
              <ReactMarkdown>{post.body}</ReactMarkdown>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogPostPage;
```

- [ ] **Step 2: Commit**

---

### Task 5: Verify Build

**Files:**
- (none — run build/typecheck)

- [ ] **Step 1: Build to check for compilation errors**

```bash
npm run build 2>&1 | tail -20
```
Expected: no errors, build succeeds.

- [ ] **Step 2: Dev server test**

```bash
npm run dev
```
Open `http://localhost:3000/blog` and verify:
- Hero section renders with forest gradient and gold badge
- Cards below show new colors (forest top bar, gold accents)
- Click a post → magazine article layout with Playfair Display, gold divider, drop cap
- Dark mode toggle works correctly
