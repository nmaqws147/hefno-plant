import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BlogEditor from '../../component/blog/BlogEditor';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

const AdminBlogPage = ({ inPanel = false }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [mobileView, setMobileView] = useState('list');

  const authFetch = async (url, options = {}) => {
    const token = await user.getIdToken();
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  };

  const loadPosts = async () => {
    try {
      const data = await authFetch('/api/blog?all=1');
      setPosts(data.posts || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPosts(); }, [user]);

  const handleSave = async (postData) => {
    try {
      if (postData.id) {
        const data = await authFetch('/api/blog', { method: 'PUT', body: JSON.stringify(postData) });
        toast.success('Post updated');
        setSelected(data.post);
      } else {
        const data = await authFetch('/api/blog', { method: 'POST', body: JSON.stringify(postData) });
        toast.success('Post created');
        setSelected(data.post);
      }
      loadPosts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await authFetch(`/api/blog?id=${id}`, { method: 'DELETE' });
      toast.success('Post deleted');
      setSelected(null);
      loadPosts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filtered = posts.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()));
  const publishedCount = posts.filter(p => p.published).length;
  const draftCount = posts.filter(p => !p.published).length;

  return (
    <div className={inPanel ? '' : 'min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'}>
    <div className={`flex ${inPanel ? 'h-full' : 'h-screen'} overflow-hidden`}>
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            <span className="text-emerald-600">Hefno</span> CMS
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-medium text-sm transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
            Posts
          </button>
          <Link
            to="/blog"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 font-medium text-sm transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            View Site
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Posts</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setSelected(null); setMobileView('edit'); }}
                  className="md:hidden inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  New
                </button>
                <button
                  onClick={() => { setSelected(null); }}
                  className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  New Post
                </button>
              </div>
            </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Post list */}
          <div className={`w-full lg:w-80 xl:w-96 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden flex flex-col ${
            mobileView === 'edit' ? 'hidden lg:flex' : 'flex'
          }`}>
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{posts.length}</p>
                  <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">Total</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{publishedCount}</p>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Published</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{draftCount}</p>
                  <p className="text-xs text-amber-600/70 dark:text-amber-400/70">Drafts</p>
                </div>
              </div>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search posts..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition-shadow"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[1,2,3,4,5].map(n => (
                    <div key={n} className="h-20 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center">
                  <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                  <p className="text-sm text-gray-400 dark:text-gray-500">No posts found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                  {filtered.map(post => (
                    <button
                      key={post.id}
                      onClick={() => { setSelected(post); setMobileView('edit'); }}
                      className={`w-full text-left p-4 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/30 group ${
                        selected?.id === post.id
                          ? 'bg-emerald-50/80 dark:bg-emerald-900/15 border-l-2 border-emerald-500'
                          : 'border-l-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {post.title || 'Untitled'}
                        </p>
                        {selected?.id === post.id && (
                          <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          post.published
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${post.published ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(post.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric',
                          })}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Editor */}
          <div className={`flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-800/50 ${
            mobileView === 'list' ? 'hidden lg:block' : 'block'
          }`}>
            <div className="max-w-3xl mx-auto p-6">
              <button
                onClick={() => setMobileView('list')}
                className="lg:hidden inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back to posts
              </button>
              <BlogEditor
                key={selected?.id || 'new'}
                post={selected}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default AdminBlogPage;
