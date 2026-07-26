import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import BlogCard from '../../component/blog/BlogCard';
import ImagePlaceholder from '../../component/ImagePlaceholder';
import SEO from '../../component/SEO';
import { makeBreadcrumbs, makeCollection } from '../../component/structuredData';

const Skeleton = () => (
  <div className="rounded-2xl bg-[#f0ece4] dark:bg-[#1d1d1d] overflow-hidden animate-pulse">
    <div className="aspect-[16/9] bg-[#e8e3d8] dark:bg-[#2a2a2a]" />
    <div className="p-5 space-y-3">
      <div className="h-3 w-24 bg-[#e8e3d8] dark:bg-[#2a2a2a] rounded" />
      <div className="h-5 w-full bg-[#e8e3d8] dark:bg-[#2a2a2a] rounded" />
      <div className="h-4 w-3/4 bg-[#e8e3d8] dark:bg-[#2a2a2a] rounded" />
      <div className="h-3 w-20 bg-[#e8e3d8] dark:bg-[#2a2a2a] rounded" />
    </div>
  </div>
);

const BlogPage = () => {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState(null);
  const [heroImgError, setHeroImgError] = useState(false);

  useEffect(() => {
    fetch('/api/blog')
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setPosts(data.posts || []);
      })
      .catch(err => {
        setError(err.message);
        setPosts([]);
      });
  }, []);

  const featured = posts && posts[0];

  const plainText = featured?.body ? featured.body.replace(/<[^>]+>/g, '') : '';
  const featuredReadTime = Math.max(1, Math.ceil(plainText.split(/\s+/).filter(Boolean).length / 200));

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0f0f0e]" dir="rtl">
      <SEO
        title="المقالات الزراعية"
        description="مدونة Hefno-Plant — مقالات زراعية، نصائح، وإرشادات للمزارعين والمهتمين بالمجال الزراعي."
        url="/blog"
        keywords="مقالات زراعية, مدونة زراعية, نصائح للمزارعين, إرشادات زراعية, زراعة"
        breadcrumbs={makeBreadcrumbs('/blog')}
        jsonLd={makeCollection('المقالات الزراعية', '/blog', 'مدونة Hefno-Plant — مقالات ونصائح وإرشادات للمزارعين')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#2d2a24] dark:text-white">
            Blog
          </h1>
          <div className="mt-4 w-12 h-1 bg-[#4a7c59] dark:bg-[#6da07b] rounded-full" />
          <p className="mt-6 text-lg text-[#8a8580] dark:text-[#a1a1aa] max-w-xl leading-relaxed">
            Insights, guides, and updates from the Hefno team
          </p>
        </motion.div>

        {/* Loading State */}
        {!posts && !error && (
          <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mt-24 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#f0ece4] dark:bg-[#1d1d1d] flex items-center justify-center">
              <svg className="w-8 h-8 text-[#8a8580] dark:text-[#6b7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-[#8a8580] dark:text-[#a1a1aa] mb-4">Failed to load articles</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4a7c59] hover:bg-[#3d6b4b] text-white text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try again
            </button>
          </div>
        )}

        {/* Empty State */}
        {posts && posts.length === 0 && (
          <div className="mt-24 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#f0ece4] dark:bg-[#1d1d1d] flex items-center justify-center">
              <svg className="w-8 h-8 text-[#8a8580] dark:text-[#6b7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <p className="text-[#8a8580] dark:text-[#a1a1aa] text-lg">No articles published yet</p>
            <p className="text-sm text-[#8a8580] dark:text-[#d4cfc8] mt-2">Check back soon for new content</p>
          </div>
        )}

        {/* Featured Post */}
        {featured && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16"
          >
            <Link
              to={`/blog/${featured.slug}`}
              className="group block relative aspect-[16/7] sm:aspect-[16/6] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
            >
              {featured.cover_url && !heroImgError ? (
                <img
                  src={featured.cover_url}
                  alt={featured.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={() => setHeroImgError(true)}
                />
              ) : (
                <ImagePlaceholder className="w-full h-full" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#2d5a27]/90 via-[#2d5a27]/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <span className="px-3 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider bg-white/15 backdrop-blur-sm text-[#e8dcc4] dark:text-white/90">
                    {featured.category || 'Featured'}
                  </span>
                  <span className="text-white/40">·</span>
                  <span className="text-sm text-white/60">{featuredReadTime} min read</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight max-w-3xl">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="mt-3 text-sm sm:text-base text-white/70 max-w-2xl line-clamp-2 leading-relaxed">
                    {featured.excerpt}
                  </p>
                )}
              </div>
            </Link>
          </motion.div>
        )}

        {/* Latest Articles Grid */}
        {posts && posts.length > 1 && (
          <div className="mt-20 sm:mt-24">
            <div className="flex items-center gap-4 mb-10">
              <h2 className="text-sm font-semibold text-[#2d2a24] dark:text-white uppercase tracking-[0.2em]">
                Latest Articles
              </h2>
              <div className="flex-1 h-px bg-[#e8e3d8] dark:bg-[#2a2a2a]" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {posts.slice(1).map((post, i) => (
                <BlogCard key={post.id} post={post} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
