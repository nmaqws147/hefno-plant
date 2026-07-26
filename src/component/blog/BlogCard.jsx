import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ImagePlaceholder from '../ImagePlaceholder';

const BlogCard = ({ post, index = 0 }) => {
  const [imgError, setImgError] = useState(false);
  const plainText = post.body ? post.body.replace(/<[^>]+>/g, '') : '';
  const words = plainText.split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(words / 200));

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={`/blog/${post.slug}`}
        className="group block bg-white dark:bg-[#1d1d1d] rounded-2xl overflow-hidden border border-[#e8e3d8] dark:border-[#2a2a2a] hover:border-[#4a7c59]/20 dark:hover:border-[#6da07b]/20 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-[#f0ece4] dark:bg-[#222]">
          {post.cover_url && !imgError ? (
            <img
              src={post.cover_url}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
            />
          ) : (
            <ImagePlaceholder className="w-full h-full" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          {post.category && (
            <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-wider bg-white/90 dark:bg-black/60 text-[#4a7c59] dark:text-[#6da07b] backdrop-blur-sm">
              {post.category}
            </span>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2.5 text-xs text-[#8a8580] dark:text-[#d4cfc8]/70">
            <time dateTime={post.created_at}>
              {new Date(post.created_at).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
              })}
            </time>
            <span className="w-1 h-1 rounded-full bg-[#d4d4d4] dark:bg-[#525252]" />
            <span>{readTime} min read</span>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-[#2d2a24] dark:text-white leading-snug line-clamp-2 group-hover:text-[#4a7c59] dark:group-hover:text-[#6da07b] transition-colors duration-300">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="mt-2 text-sm text-[#8a8580] dark:text-[#a1a1aa] leading-relaxed line-clamp-2">
              {post.excerpt}
            </p>
          )}
          <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-[#4a7c59] dark:text-[#6da07b] group-hover:gap-2.5 transition-all duration-300">
            <span>Read article</span>
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default BlogCard;
