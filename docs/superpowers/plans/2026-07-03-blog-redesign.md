# Blog Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign blog listing, blog post page, and blog card to look premium/luxury

**Architecture:** Pure CSS/Tailwind redesign of 3 existing components. No new dependencies, no API changes, no routing changes.

**Tech Stack:** React, Tailwind CSS v3

## Global Constraints

- Warm off-white (`#f8f7f4`) page bg in light mode, warm dark (`#1a1a1a`) in dark mode
- Gold accent: `#d97706` (light), `#f59e0b` (dark)
- No new files, no new dependencies
- Must remain responsive (mobile-first)

---

### Task 1: Redesign BlogCard component

**Files:**
- Modify: `src/component/blog/BlogCard.jsx`

- [ ] **Step 1: Rewrite BlogCard**

```jsx
import { Link } from 'react-router-dom';

const BlogCard = ({ post }) => {
  const words = post.body ? post.body.split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(words / 200));

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group block bg-white dark:bg-[#242424] rounded-2xl shadow-sm hover:shadow-xl border border-[#e8e6e1] dark:border-[#333] hover:border-amber-500/30 dark:hover:border-amber-400/30 transition-all duration-500 overflow-hidden hover:-translate-y-1"
    >
      <div className="h-0.5 bg-amber-600 dark:bg-amber-500 transition-colors duration-300" />
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-800">
        {post.cover_url ? (
          <img
            src={post.cover_url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
      <div className="p-6">
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500 mb-3 font-medium">
          <time dateTime={post.created_at}>
            {new Date(post.created_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
          </time>
          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
          <span>{readTime} min read</span>
        </div>
        <h3 className="text-lg font-semibold text-[#1c1917] dark:text-[#f5f5f4] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug line-clamp-2">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 text-sm text-[#78716c] dark:text-[#a8a29e] line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>
        )}
        <span className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-amber-600 dark:text-amber-400 group-hover:gap-3 transition-all">
          Read article
          <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </span>
      </div>
    </Link>
  );
};

export default BlogCard;
```

### Task 2: Redesign BlogPage

**Files:**
- Modify: `src/pages/blog/BlogPage.jsx`

- [ ] **Step 1: Rewrite BlogPage**

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
      <div className="min-h-screen bg-[#f8f7f4] dark:bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="mb-12">
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-3" />
            <div className="h-5 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse">
                <div className="aspect-[16/9]" />
                <div className="p-6 space-y-3">
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3" />
                  <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full" />
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
      <div className="min-h-screen bg-[#f8f7f4] dark:bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center px-4">
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Something went wrong</h2>
          <p className="text-gray-500 dark:text-gray-400">Could not load blog posts. Please try again later.</p>
        </div>
      </div>
    );
  }

  const featured = posts[0];

  return (
    <div className="min-h-screen bg-[#f8f7f4] dark:bg-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="mb-12 sm:mb-14">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#1c1917] dark:text-[#f5f5f4] tracking-tight">
            Blog
          </h1>
          <p className="mt-3 text-lg text-[#78716c] dark:text-[#a8a29e] max-w-2xl">
            Insights, guides, and updates from the Hefno team
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-20 h-20 mx-auto text-gray-200 dark:text-gray-700 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-400 dark:text-gray-500 mb-2">No posts yet</h2>
            <p className="text-gray-400 dark:text-gray-500">Check back soon for new articles</p>
          </div>
        ) : (
          <>
            {featured && (
              <div className="mb-14 sm:mb-16">
                <Link
                  to={`/blog/${featured.slug}`}
                  className="group block relative w-full h-[420px] sm:h-[480px] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-0.5"
                >
                  {featured.cover_url ? (
                    <img
                      src={featured.cover_url}
                      alt={featured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500 text-white mb-4">
                      Latest
                    </span>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight max-w-2xl">
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

            {/* decorative divider */}
            <div className="flex items-center gap-4 mb-8 sm:mb-10">
              <div className="flex-1 h-px bg-[#e8e6e1] dark:bg-[#333]" />
              <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
              </svg>
              <div className="flex-1 h-px bg-[#e8e6e1] dark:bg-[#333]" />
            </div>

            {posts.length > 1 && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#78716c] dark:text-[#a8a29e] mb-6 sm:mb-8">
                  All articles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
                  {posts.slice(1).map(post => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
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

### Task 3: Redesign BlogPostPage

**Files:**
- Modify: `src/pages/blog/BlogPostPage.jsx`

- [ ] **Step 1: Rewrite BlogPostPage**

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
      <div className="min-h-screen bg-[#f8f7f4] dark:bg-[#1a1a1a]">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] dark:bg-[#1a1a1a]">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Post not found</h1>
          <Link to="/blog" className="text-emerald-600 dark:text-emerald-400 hover:underline">
            &larr; Back to blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] dark:bg-[#1a1a1a]">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-[#78716c] dark:text-[#a8a29e] hover:text-emerald-600 dark:hover:text-emerald-400 mb-10 text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to blog
        </Link>

        <div className="relative w-full h-72 sm:h-96 rounded-xl overflow-hidden shadow-sm border border-[#e8e6e1] dark:border-[#333] mb-10">
          {post.cover_url ? (
            <>
              <img
                src={post.cover_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600" />
          )}
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-[#1c1917] dark:text-[#f5f5f4] mb-4 leading-tight">
          {post.title}
        </h1>

        <div className="flex items-center gap-3 text-sm uppercase tracking-[0.15em] text-[#78716c] dark:text-[#a8a29e] mb-8 font-medium">
          <time dateTime={post.created_at}>
            {new Date(post.created_at).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </time>
          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
          <span>{Math.max(1, Math.ceil((post.body || '').split(/\s+/).length / 200))} min read</span>
        </div>

        <div className="h-px bg-[#e8e6e1] dark:bg-[#333] mb-8" />

        <div className="bg-[#fefcfb] dark:bg-[#242424] rounded-xl p-8 sm:p-10 shadow-sm border border-[#e8e6e1] dark:border-[#333]">
          <div className="prose prose-lg prose-emerald max-w-none dark:text-gray-200 leading-relaxed first-letter:text-5xl first-letter:font-bold first-letter:text-emerald-600 dark:first-letter:text-emerald-400 first-letter:float-left first-letter:mr-3 first-letter:mt-1">
            <ReactMarkdown>{post.body}</ReactMarkdown>
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogPostPage;
```

### Task 4: Verify build

- [ ] **Step 1: Run build**

Run: `npm run build`
Expected: Build succeeds with no errors
