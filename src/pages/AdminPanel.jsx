import { useState } from 'react';
import { BarChart3, FileText } from 'lucide-react';
import AdminBlogPage from './blog/AdminBlogPage';
import ActionStatsScreen from '../component/admin-stats';
import SEO from '../component/SEO';

const AdminPanel = () => {
  const [tab, setTab] = useState('blog');

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 pt-[80px]" dir="rtl">
      <SEO title="لوحة التحكم" description="لوحة التحكم الخاصة بمنصة Hefno-Plant — إدارة المحتوى والمقالات والإحصائيات." url="/admin-panel" noindex={true} />

      <div className="shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTab('blog')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                tab === 'blog'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <FileText size={16} />
              المقالات
            </button>
            <button
              onClick={() => setTab('stats')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                tab === 'stats'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <BarChart3 size={16} />
              الإحصائيات
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'blog' ? (
          <AdminBlogPage inPanel />
        ) : (
          <ActionStatsScreen inPanel />
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
