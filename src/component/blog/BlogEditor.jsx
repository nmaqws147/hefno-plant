import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

const BlogEditor = ({ post, onSave, onDelete, adminKey }) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [body, setBody] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [published, setPublished] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const [coverPreview, setCoverPreview] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [insertingImg, setInsertingImg] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const fileInputRef = useRef(null);
  const bodyFileInputRef = useRef(null);
  const bodyTextareaRef = useRef(null);

  useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setSlug(post.slug || '');
      setBody(post.body || '');
      setExcerpt(post.excerpt || '');
      setCoverUrl(post.cover_url || '');
      setCoverPreview(post.cover_url || '');
      setPublished(Boolean(post.published));
      setSlugEdited(true);
    } else {
      setTitle('');
      setSlug('');
      setBody('');
      setExcerpt('');
      setCoverUrl('');
      setCoverPreview('');
      setPublished(false);
      setSlugEdited(false);
    }
  }, [post]);

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    if (!slugEdited) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      const maxW = 1200;
      const maxH = 900;
      let w = img.width;
      let h = img.height;
      if (w > maxW) { h = h * maxW / w; w = maxW; }
      if (h > maxH) { w = w * maxH / h; h = maxH; }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCoverPreview(dataUrl);
      setCoverUrl(dataUrl);
    };
    img.src = URL.createObjectURL(file);
  };

  const handleBodyImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setInsertingImg(true);

    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise(resolve => { img.onload = resolve; });

    let w = img.width;
    let h = img.height;
    if (w > 1200) { h = h * 1200 / w; w = 1200; }

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, w, h);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const alt = file.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');

    try {
      const res = await fetch('/api/blog/image/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ dataUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      const ta = bodyTextareaRef.current;
      if (ta) {
        const currentBody = ta.value;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const before = currentBody.slice(0, start);
        const after = currentBody.slice(end);
        const markdown = `\n![${alt}](${data.url})\n`;
        setBody(before + markdown + after);
        setTimeout(() => {
          ta.focus();
          ta.selectionStart = ta.selectionEnd = start + markdown.length;
        }, 0);
      }
    } catch (err) {
      alert('Failed to upload image: ' + err.message);
    }

    if (bodyFileInputRef.current) bodyFileInputRef.current.value = '';
    setInsertingImg(false);
  };

  const clearCover = () => {
    setCoverUrl('');
    setCoverPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ id: post?.id, title, slug, body, excerpt, cover_url: coverUrl, published });
  };

  const labelClass = 'block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5';
  const inputClass = 'w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition-shadow text-sm';

  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-6">
        {post?.id ? 'Edit Post' : 'New Post'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className={labelClass}>Title</label>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Post title"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
            placeholder="post-url-slug"
            className={`${inputClass} font-mono text-xs`}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Excerpt</label>
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief preview of the post"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Cover Image</label>
            <div className="mt-1 space-y-3">
              {coverPreview ? (
                <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                  <img src={coverPreview} alt="Cover preview" className="w-full h-40 object-cover" />
                  <button
                    type="button"
                    onClick={clearCover}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-emerald-400 dark:hover:border-emerald-500 bg-gray-50 dark:bg-gray-700/50 transition-colors cursor-pointer"
                >
                  <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-400">Click to upload image</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={labelClass}>Body</label>
            <span className="text-xs text-gray-400">Markdown supported</span>
          </div>
          <div className="flex items-center gap-1 mb-2">
            <button
              type="button"
              onClick={() => bodyFileInputRef.current?.click()}
              disabled={insertingImg}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {insertingImg ? 'Uploading...' : 'Insert Image'}
            </button>
          </div>
          <textarea
            ref={bodyTextareaRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={14}
            placeholder="Write your post content here... Use **bold**, *italic*, ## headings, etc."
            className={`${inputClass} font-mono text-sm leading-relaxed resize-y`}
            required
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              {showPreview ? 'Hide Preview' : 'Preview'}
            </button>
          </div>
          {showPreview && (
            <div className="mt-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 prose prose-sm prose-emerald dark:prose-invert max-w-none">
              <ReactMarkdown>{body}</ReactMarkdown>
            </div>
          )}
          <input
            ref={bodyFileInputRef}
            type="file"
            accept="image/*"
            onChange={handleBodyImageSelect}
            className="hidden"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div className="relative">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-500 peer-checked:bg-emerald-600" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {published ? 'Published' : 'Draft'}
            </span>
          </label>

          <div className="flex items-center gap-2">
            {post?.id && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                Delete
              </button>
            )}
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              {post?.id ? 'Update' : published ? 'Publish' : 'Save Draft'}
            </button>
          </div>
        </div>
      </form>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-sm mx-4 animate-[slideUp_0.3s_ease]" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Delete post?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                This action cannot be undone. The post will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setShowDeleteModal(false); onDelete(post.id); }}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogEditor;
