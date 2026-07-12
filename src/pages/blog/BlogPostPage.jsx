import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Helmet } from 'react-helmet-async';

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
      <div className="min-h-screen bg-champagne dark:bg-[#111827] flex flex-col items-center justify-center gap-6">
        <div className="w-7 h-7 border-2 border-[rgba(45,106,79,0.12)] border-t-[#2d6a4f] dark:border-[rgba(74,222,128,0.12)] dark:border-t-[#4ade80] rounded-full animate-spin" />
        <span className="text-sm font-medium text-[#8a8580] dark:text-gray-400">Loading HefnoPlant</span>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-champagne dark:bg-[#111827] flex items-center justify-center">
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
    <div className="min-h-screen bg-champagne dark:bg-[#111827]" dir="rtl">
      <Helmet>
        <title>مقال | Hefno-Plant</title>
        <meta name="description" content="اقرأ أحدث المقالات الزراعية على مدونة Hefno-Plant — نصائح وإرشادات للمزارعين." />
      </Helmet>
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
