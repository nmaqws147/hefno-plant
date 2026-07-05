import { Link } from 'react-router-dom';

const BlogCard = ({ post }) => {
  const words = post.body ? post.body.split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(words / 200));

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group block bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm hover:shadow-xl border border-[#e8e3d8] dark:border-[#2a2a2a] hover:border-gold/30 dark:hover:border-gold/30 transition-all duration-500 overflow-hidden hover:-translate-y-1"
      style={{ breakInside: 'avoid' }}
    >
      <div className="h-1 bg-forest dark:bg-forest-light transition-colors duration-300" />
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-[#222]">
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
