import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BlogCard from '../../component/blog/BlogCard';
import { Helmet } from 'react-helmet-async';

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
      <div className="min-h-screen bg-champagne dark:bg-[#111827] flex flex-col items-center justify-center gap-6">
        <div className="w-7 h-7 border-2 border-[rgba(45,106,79,0.12)] border-t-[#2d6a4f] dark:border-[rgba(74,222,128,0.12)] dark:border-t-[#4ade80] rounded-full animate-spin" />
        <span className="text-sm font-medium text-[#8a8580] dark:text-gray-400">Loading HefnoPlant</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-champagne dark:bg-[#111827] flex items-center justify-center">
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
    <div className="min-h-screen bg-champagne dark:bg-[#111827]" dir="rtl">
      <Helmet>
        <title>المقالات الزراعية | Hefno-Plant</title>
        <meta name="description" content="مدونة Hefno-Plant — مقالات زراعية، نصائح، وإرشادات للمزارعين والمهتمين بالمجال الزراعي." />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="mb-12 sm:mb-14">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-forest dark:text-[#f5f5f4] tracking-tight">
            Blog
          </h1>
          <div className="mt-3 w-16 h-0.5 bg-gold" />
          <p className="mt-4 text-lg text-[#2d2a24] dark:text-[#a8a29e] max-w-2xl">
            Insights, guides, and updates from the Hefno team
          </p>
          <Link
            to="/admin/blog"
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gold hover:bg-gold/90 transition-all shadow-md shadow-gold/20"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            إدارة المقالات
          </Link>
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
