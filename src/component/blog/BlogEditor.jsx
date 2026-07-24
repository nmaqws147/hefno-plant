import { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: '', label: 'General' },
  { value: 'disease', label: 'Disease' },
  { value: 'pesticide', label: 'Pesticide' },
  { value: 'fertilizer', label: 'Fertilizer' },
  { value: 'crop', label: 'Crop' },
  { value: 'pest', label: 'Pest' },
];

const BlogEditor = ({ post, onSave, onDelete }) => {
  const { user } = useAuth();
  const [rawText, setRawText] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [published, setPublished] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const [category, setCategory] = useState('');
  const [step, setStep] = useState('write');
  const [formatting, setFormatting] = useState(false);
  const [formatError, setFormatError] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const rawInputRef = useRef(null);

  useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setSlug(post.slug || '');
      setExcerpt(post.excerpt || '');
      setCoverUrl(post.cover_url || '');
      setCoverPreview(post.cover_url || '');
      setPublished(Boolean(post.published));
      setSlugEdited(true);
      const isHtml = post.body?.trim().startsWith('<');
      if (isHtml) {
        setBody(post.body || '');
        setRawText('');
        setStep('preview');
      } else {
        setBody('');
        setRawText(post.body || '');
        setStep('write');
      }
    } else {
      setTitle('');
      setSlug('');
      setExcerpt('');
      setBody('');
      setCoverUrl('');
      setCoverPreview('');
      setPublished(false);
      setSlugEdited(false);
      setRawText('');
      setStep('write');
      setFormatError('');
    }
  }, [post]);

  const handleFormat = async () => {
    if (!rawText.trim()) {
      toast.error('Please write some content first');
      return;
    }
    setFormatting(true);
    setFormatError('');
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/blog/format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text: rawText, category: category || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Formatting failed');
      setTitle(data.title);
      setExcerpt(data.excerpt || '');
      setBody(data.html);
      if (!slugEdited) {
        setSlug(data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
      }
      setStep('preview');
      toast.success('Article formatted successfully');
    } catch (err) {
      setFormatError(err.message);
      toast.error('Formatting failed: ' + err.message);
    } finally {
      setFormatting(false);
    }
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    if (!slugEdited) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise(resolve => { img.onload = resolve; });
    const maxW = 1920, maxH = 1440;
    let w = img.width, h = img.height;
    if (w > maxW) { h = h * maxW / w; w = maxW; }
    if (h > maxH) { w = w * maxH / h; h = maxH; }
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, w, h);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCoverPreview(dataUrl);
    setUploadingCover(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/blog/image/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ dataUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setCoverUrl(data.url);
    } catch (err) {
      toast.error('Failed to upload cover image: ' + err.message);
      setCoverPreview('');
    } finally {
      setUploadingCover(false);
    }
  };

  const clearCover = () => {
    setCoverUrl('');
    setCoverPreview('');
  };

  const handleSubmit = () => {
    if (!body.trim()) { toast.error('Please format the article first'); return; }
    onSave({ id: post?.id, title, slug, body, excerpt, cover_url: coverUrl, published });
  };

  const fileInputRef = useRef(null);

  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-6">
        {post?.id ? 'Edit Post' : 'New Post'}
      </h3>

      {step === 'write' && (
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Category <span className="text-gray-400 normal-case">(optional)</span>
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition-shadow text-sm"
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Write your article
            </label>
            <textarea
              ref={rawInputRef}
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              rows={18}
              placeholder="Write your article in plain text...&#10;&#10;Example:&#10;Plant Early Blight&#10;&#10;Early blight is one of the most common fungal diseases affecting tomatoes.&#10;&#10;Symptoms&#10;Brown circular lesions appear on leaves.&#10;Yellowing of surrounding tissue.&#10;&#10;Causes&#10;High humidity and poor ventilation."
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition-shadow text-sm font-['Cairo',sans-serif] leading-relaxed resize-y"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleFormat}
              disabled={formatting || !rawText.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all shadow-sm"
            >
              {formatting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Formatting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Format with AI
                </>
              )}
            </button>
          </div>

          {formatError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {formatError}
              <button
                onClick={() => setFormatError('')}
                className="mr-3 text-red-400 hover:text-red-600 underline"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}

      {step === 'preview' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Formatted
            </span>
            <button
              onClick={() => setStep('write')}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
            >
              Edit Raw Text
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition-shadow text-sm"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition-shadow text-sm font-mono text-xs"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Excerpt</label>
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief preview of the post"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition-shadow text-sm"
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Cover Image</label>
            {uploadingCover ? (
              <div className="w-full h-32 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-2" />
                <span className="text-sm text-gray-400">Uploading cover image...</span>
              </div>
            ) : coverPreview ? (
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
                <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className="text-sm text-gray-400">Click to upload cover image</span>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          </div>

          {/* HTML Preview */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Preview</label>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 prose prose-sm prose-emerald dark:prose-invert max-w-none overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(body) }}
            />
          </div>

          {/* Actions */}
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
              <button
                onClick={handleFormat}
                disabled={formatting || !rawText.trim()}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Format Again
              </button>
              {post?.id && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  Delete
                </button>
              )}
              <button
                onClick={handleSubmit}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                {post?.id ? 'Update' : published ? 'Publish' : 'Save Draft'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-sm mx-4 animate-[slideUp_0.3s_ease]" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Delete post?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">This action cannot be undone. The post will be permanently removed.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors">Cancel</button>
                <button onClick={() => { setShowDeleteModal(false); onDelete(post.id); }} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogEditor;
