import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BlogCard from '../../component/blog/BlogCard';
import ImagePlaceholder from '../../component/ImagePlaceholder';
import SEO from '../../component/SEO';
import { makeBreadcrumbs, makeCollection } from '../../component/structuredData';

const BlogPage = () => {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState(null);
  const [featuredImgError, setFeaturedImgError] = useState(false);

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

  return (
    <div className="min-h-screen bg-champagne dark:bg-[#111827]" dir="rtl">
      <SEO title="المقالات الزراعية" description="مدونة Hefno-Plant — مقالات زراعية، نصائح، وإرشادات للمزارعين والمهتمين بالمجال الزراعي." url="/blog" keywords="مقالات زراعية, مدونة زراعية, نصائح للمزارعين, إرشادات زراعية, زراعة" breadcrumbs={makeBreadcrumbs('/blog')} jsonLd={makeCollection('المقالات الزراعية', '/blog', 'مدونة Hefno-Plant — مقالات ونصائح وإرشادات للمزارعين')} />
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

        {featured && (
          <div className="mb-14 sm:mb-16">
            <Link
              to={`/blog/${featured.slug}`}
              className="group block relative w-full h-[440px] sm:h-[520px] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-0.5"
            >
              {featured.cover_url && !featuredImgError ? (
                <img
                  src={featured.cover_url}
                  alt={featured.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={() => setFeaturedImgError(true)}
                />
              ) : (
                <ImagePlaceholder className="w-full h-full" />
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
                  <span>{Math.max(1, Math.ceil(((featured.body || '').replace(/<[^>]+>/g, '')).split(/\s+/).filter(Boolean).length / 200))} min read</span>
                </div>
              </div>
            </Link>
          </div>
        )}

        {posts && posts.length > 1 && (
          <>
            <div className="flex items-center gap-4 mb-8 sm:mb-10">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
              <span className="text-xs uppercase tracking-[0.2em] text-gold font-medium">Latest Articles</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              {posts.slice(1).map(post => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </>
        )}

        <div className={featured ? 'py-16 sm:py-20' : 'py-0 sm:py-0'}>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl font-serif font-semibold text-forest dark:text-[#f5f5f4] mb-4">آخر المقالات الزراعية</h2>
            <p className="text-lg text-[#2d2a24] dark:text-[#a8a29e] leading-relaxed">
              مدونة Hefno-Plant — مصدرك للمعلومات الزراعية الموثوقة. نقدم مقالات وإرشادات عن تشخيص أمراض النباتات، 
              المكافحة المتكاملة للآفات، دليل المبيدات الزراعية، التسميد والري، وأحدث الممارسات الزراعية المستدامة.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white dark:bg-[#242424] rounded-xl p-6 shadow-sm border border-[#e8e3d8] dark:border-[#333] text-center">
              <div className="w-12 h-12 bg-forest/10 dark:bg-forest/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 className="font-semibold text-forest dark:text-[#f5f5f4] mb-2">تشخيص الأمراض</h3>
              <p className="text-sm text-[#8a8580] dark:text-gray-400">دليل شامل لتشخيص الأمراض النباتية بالصور والوصف</p>
            </div>
            <div className="bg-white dark:bg-[#242424] rounded-xl p-6 shadow-sm border border-[#e8e3d8] dark:border-[#333] text-center">
              <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              <h3 className="font-semibold text-forest dark:text-[#f5f5f4] mb-2">دليل المبيدات</h3>
              <p className="text-sm text-[#8a8580] dark:text-gray-400">قاعدة بيانات المبيدات الزراعية وتصنيفاتها وطرق استخدامها</p>
            </div>
            <div className="bg-white dark:bg-[#242424] rounded-xl p-6 shadow-sm border border-[#e8e3d8] dark:border-[#333] text-center">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              </div>
              <h3 className="font-semibold text-forest dark:text-[#f5f5f4] mb-2">التقويم الزراعي</h3>
              <p className="text-sm text-[#8a8580] dark:text-gray-400">مواعيد الزراعة والتسميد والري حسب الشهر والمحصول</p>
            </div>
          </div>
          {error && (
            <div className="text-center mt-12">
              <p className="text-sm text-[#8a8580] dark:text-gray-500">تعذر تحميل المقالات الحديثة. حاول مرة أخرى لاحقًا.</p>
            </div>
          )}
          {!error && !featured && (
            <div className="text-center mt-12">
              <p className="text-sm text-[#8a8580] dark:text-gray-500">تُنشر المقالات الجديدة باستمرار. تابعنا للمزيد.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
