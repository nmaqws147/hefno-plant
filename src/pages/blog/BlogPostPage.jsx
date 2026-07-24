import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';
import SEO from '../../component/SEO';
import ImagePlaceholder from '../../component/ImagePlaceholder';

const handleContentClick = (e, setLightbox) => {
  const img = e.target.closest('img');
  if (img) {
    setLightbox({ src: img.src, alt: img.alt });
  }
};

const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [heroImgError, setHeroImgError] = useState(false);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    if (!lightbox) return;
    const handler = (e) => { if (e.key === 'Escape') closeLightbox(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, closeLightbox]);

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

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: post?.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      const btn = document.getElementById('share-btn');
      if (btn) { btn.textContent = '✅'; setTimeout(() => { btn.textContent = ''; }, 2000); }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-champagne dark:bg-[#111827] flex flex-col items-center justify-center gap-6">
        <div className="w-10 h-10 border-2 border-forest/20 border-t-gold dark:border-white/20 dark:border-t-gold rounded-full animate-spin" />
        <span className="text-sm font-medium text-[#8a8580] dark:text-gray-400">Loading HefnoPlant</span>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-champagne dark:bg-[#111827] flex items-center justify-center">
        <div className="text-center px-4">
          <svg className="w-20 h-20 mx-auto text-gold/30 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-3xl font-serif font-bold text-forest dark:text-[#f5f5f4] mb-3">Post not found</h1>
          <p className="text-[#8a8580] dark:text-gray-400 mb-6">The article you're looking for doesn't exist or has been removed.</p>
          <Link to="/blog" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold text-white font-bold text-sm hover:bg-gold/90 transition-all shadow-md shadow-gold/20">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to blog
          </Link>
        </div>
      </div>
    );
  }

  const plainText = post.body?.replace(/<[^>]+>/g, '') || '';
  const readTime = Math.max(1, Math.ceil(plainText.split(/\s+/).length / 200));
  const excerpt = post.excerpt || plainText.slice(0, 160).trim() || '';

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: excerpt,
    image: post.cover_url || 'https://hefnoplant.site/og-image.png',
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: { '@type': 'Organization', name: 'Hefno-Plant' },
    publisher: { '@type': 'Organization', name: 'Hefno-Plant' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://hefnoplant.site/blog/${post.slug}` },
  };

  return (
    <div className="min-h-screen bg-champagne dark:bg-[#111827]" dir="rtl">
      <SEO
        title={post.title}
        description={excerpt}
        image={post.cover_url}
        url={`/blog/${post.slug}`}
        type="article"
        publishedTime={post.created_at}
        jsonLd={articleJsonLd}
      />

      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent">
        <div
          className="h-full bg-gradient-to-l from-gold to-forest transition-all duration-150 ease-out rounded-full"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* Hero Section */}
      <div className="relative w-full h-[50vh] min-h-[400px] sm:min-h-[500px] lg:min-h-[60vh] overflow-hidden">
        {post.cover_url && !heroImgError ? (
          <img
            src={post.cover_url}
            alt={post.title}
            className="w-full h-full object-cover"
            fetchpriority="high"
            onError={() => setHeroImgError(true)}
          />
        ) : (
          <ImagePlaceholder className="w-full h-full" />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-forest/95 via-forest/40 via-30% to-transparent" />

        {/* Back Button */}
        <Link
          to="/blog"
          className="absolute top-6 right-6 sm:top-8 sm:right-8 z-10 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white/80 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-sm transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </Link>

        {/* Hero Text */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-16 max-w-5xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] bg-gold text-white mb-5 shadow-lg shadow-gold/20">
            Article
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-serif font-bold text-white leading-[1.15] tracking-tight max-w-4xl">
            {post.title}
          </h1>
          <div className="w-20 h-[2px] bg-gold mt-6 mb-5" />
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
            <time dateTime={post.created_at} className="inline-flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {new Date(post.created_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </time>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {readTime} min read
            </span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <article className="max-w-[720px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="prose prose-lg max-w-none
          [&_h1]:text-forest dark:[&_h1]:text-[#f5f5f4]
          [&_h2]:text-2xl sm:[&_h2]:text-3xl [&_h2]:font-bold [&_h2]:font-serif
          [&_h2]:text-forest dark:[&_h2]:text-[#f5f5f4]
          [&_h2]:mt-16 [&_h2]:mb-6
          [&_h2]:pb-3 [&_h2]:border-b-2 [&_h2]:border-gold/30
          [&_h3]:text-xl sm:[&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:font-serif
          [&_h3]:text-forest dark:[&_h3]:text-[#f5f5f4]
          [&_h3]:mt-12 [&_h3]:mb-4
          [&_h3]:before:content-[''] [&_h3]:before:inline-block [&_h3]:before:w-2 [&_h3]:before:h-2
          [&_h3]:before:rounded-full [&_h3]:before:bg-gold [&_h3]:before:ml-2 [&_h3]:before:align-middle
          [&_h4]:text-lg [&_h4]:font-medium [&_h4]:font-serif
          [&_h4]:text-forest dark:[&_h4]:text-[#e8e4dc]
          [&_h4]:mt-10 [&_h4]:mb-3
          [&_p]:text-base sm:[&_p]:text-[17px] [&_p]:leading-[1.9] [&_p]:text-[#2d2a24] dark:[&_p]:text-[#d4cfc8]
          [&_p]:mb-6
          [&_a]:text-forest [&_a]:dark:text-gold [&_a]:hover:text-gold [&_a]:dark:hover:text-gold/80
          [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-gold/40 [&_a]:hover:decoration-gold
          [&_a]:transition-all
          [&_blockquote]:relative [&_blockquote]:border-r-gold [&_blockquote]:border-r-4 [&_blockquote]:border-l-0
          [&_blockquote]:bg-[#faf7f0] dark:[&_blockquote]:bg-[#1a1a1a]
          [&_blockquote]:text-[#2d2a24] [&_blockquote]:dark:text-[#d4cfc8]
          [&_blockquote]:italic [&_blockquote]:pr-5 [&_blockquote]:pl-0 [&_blockquote]:py-3 [&_blockquote]:rounded-l-lg
          [&_hr]:border-gold/30 [&_hr]:w-1/4 [&_hr]:mx-auto [&_hr]:my-16
          [&_ul]:text-[#2d2a24] dark:[&_ul]:text-[#d4cfc8] [&_ul]:list-none [&_ul]:pr-0 [&_ul]:space-y-2
          [&_ul_li]:relative [&_ul_li]:pr-6
          [&_ul_li]:before:content-[''] [&_ul_li]:before:absolute [&_ul_li]:before:right-0
          [&_ul_li]:before:top-[9px] [&_ul_li]:before:w-2 [&_ul_li]:before:h-2
          [&_ul_li]:before:rounded-full [&_ul_li]:before:bg-gold/60
          [&_ol]:text-[#2d2a24] dark:[&_ol]:text-[#d4cfc8] [&_ol]:pr-6 [&_ol]:space-y-2
          [&_ol_li]:pr-2
          [&_li]:mb-0
          [&_code]:bg-gray-100 dark:[&_code]:bg-[#1a1a1a] [&_code]:text-forest dark:[&_code]:text-gold
          [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
          [&_pre]:bg-[#1a1a1a] dark:[&_pre]:bg-black [&_pre]:rounded-xl [&_pre]:p-6 [&_pre]:border [&_pre]:border-gold/10
          [&_pre]:my-8
          [&_pre_code]:bg-transparent [&_pre_code]:text-gray-100 [&_pre_code]:p-0 [&_pre_code]:rounded-none
          [&_pre_code]:text-sm [&_pre_code]:leading-relaxed
          [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_table]:my-8
          [&_table]:border [&_table]:border-gold/20 [&_table]:rounded-xl [&_table]:overflow-hidden
          [&_thead]:bg-[#faf7f0] dark:[&_thead]:bg-[#1a1a1a]
          [&_th]:text-forest dark:[&_th]:text-gold [&_th]:font-semibold [&_th]:p-4
          [&_th]:border-b-2 [&_th]:border-gold/30 [&_th]:text-sm
          [&_td]:p-4 [&_td]:border-b [&_td]:border-[#e8e3d8] dark:[&_td]:border-[#333]
          [&_tr:last-child_td]:border-b-0
          [&_tr:hover_td]:bg-[#faf7f0]/80 dark:[&_tr:hover_td]:bg-[#1a1a1a]/80 [&_tr_td]:transition-colors
          [&_img]:rounded-xl [&_img]:shadow-lg [&_img]:my-8 [&_img]:cursor-pointer [&_img]:transition-all [&_img]:hover:shadow-xl
          [&_figure_img]:rounded-xl [&_figure_img]:shadow-lg
          [&_figcaption]:text-center [&_figcaption]:mt-3 [&_figcaption]:text-sm [&_figcaption]:text-gold/60 [&_figcaption]:italic
          [&_.info-box-warning]:bg-amber-50 [&_.info-box-warning]:dark:bg-amber-900/20 [&_.info-box-warning]:border-r-4 [&_.info-box-warning]:border-r-amber-500
          [&_.info-box-warning]:p-4 [&_.info-box-warning]:my-6 [&_.info-box-warning]:rounded-lg
          [&_.info-box-danger]:bg-red-50 [&_.info-box-danger]:dark:bg-red-900/20 [&_.info-box-danger]:border-r-4 [&_.info-box-danger]:border-r-red-500
          [&_.info-box-danger]:p-4 [&_.info-box-danger]:my-6 [&_.info-box-danger]:rounded-lg
          [&_.info-box-info]:bg-blue-50 [&_.info-box-info]:dark:bg-blue-900/20 [&_.info-box-info]:border-r-4 [&_.info-box-info]:border-r-blue-500
          [&_.info-box-info]:p-4 [&_.info-box-info]:my-6 [&_.info-box-info]:rounded-lg
          [&_.info-box-success]:bg-emerald-50 [&_.info-box-success]:dark:bg-emerald-900/20 [&_.info-box-success]:border-r-4 [&_.info-box-success]:border-r-emerald-500
          [&_.info-box-success]:p-4 [&_.info-box-success]:my-6 [&_.info-box-success]:rounded-lg
          [&_.info-box-recommendation]:bg-forest/5 [&_.info-box-recommendation]:dark:bg-forest/10 [&_.info-box-recommendation]:border-r-4 [&_.info-box-recommendation]:border-r-forest
          [&_.info-box-recommendation]:p-4 [&_.info-box-recommendation]:my-6 [&_.info-box-recommendation]:rounded-lg
          [&_.info-box-tip]:bg-gold/5 [&_.info-box-tip]:dark:bg-gold/10 [&_.info-box-tip]:border-r-4 [&_.info-box-tip]:border-r-gold
          [&_.info-box-tip]:p-4 [&_.info-box-tip]:my-6 [&_.info-box-tip]:rounded-lg
          [&_.info-box-best-practice]:bg-indigo-50 [&_.info-box-best-practice]:dark:bg-indigo-900/20 [&_.info-box-best-practice]:border-r-4 [&_.info-box-best-practice]:border-r-indigo-500
          [&_.info-box-best-practice]:p-4 [&_.info-box-best-practice]:my-6 [&_.info-box-best-practice]:rounded-lg
          [&_.info-box-warning_p]:mb-0 [&_.info-box-danger_p]:mb-0 [&_.info-box-info_p]:mb-0 [&_.info-box-success_p]:mb-0
          [&_.info-box-recommendation_p]:mb-0 [&_.info-box-tip_p]:mb-0 [&_.info-box-best-practice_p]:mb-0
        "
          onClick={(e) => handleContentClick(e, setLightbox)}
        >
          {post.body?.trim().startsWith('<') ? (
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.body) }} />
          ) : (
            <ReactMarkdown components={{ img: ({ src, alt }) => (
              <img src={src} alt={alt || ''} loading="lazy" className="rounded-xl shadow-lg my-8 cursor-pointer hover:shadow-xl transition-all"
                onClick={() => setLightbox({ src, alt })} />
            ) }}>
              {post.body}
            </ReactMarkdown>
          )}
        </div>

        {/* Article Footer */}
        <div className="mt-16 sm:mt-20 pt-10 border-t border-gold/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-forest flex items-center justify-center text-white text-lg font-bold shadow-md shadow-gold/20">
                H
              </div>
              <div>
                <p className="text-sm font-bold text-forest dark:text-[#f5f5f4]">Hefno-Plant</p>
                <p className="text-xs text-[#8a8580] dark:text-gray-400">Agricultural Knowledge Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                id="share-btn"
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gold hover:bg-gold/90 transition-all shadow-md shadow-gold/20"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                Share
              </button>
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-forest dark:text-[#f5f5f4] bg-white dark:bg-[#242424] border border-gold/20 hover:border-gold/40 transition-all shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                All Articles
              </Link>
            </div>
          </div>
        </div>
      </article>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
             onClick={closeLightbox}>
          <button className="absolute top-5 left-5 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
                  onClick={closeLightbox}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <img src={lightbox.src} alt={lightbox.alt || ''}
               className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-lg shadow-2xl animate-[scaleIn_0.3s_ease]"
               onClick={e => e.stopPropagation()} />
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default BlogPostPage;
