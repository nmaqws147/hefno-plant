export default function ProfileInfoCard({ icon, title, children }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800">
        {icon && (
          <span className="text-gray-400 dark:text-gray-500 flex-shrink-0">{icon}</span>
        )}
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      </div>
      <div className="px-5 py-4 space-y-0 divide-y divide-gray-50 dark:divide-gray-800/50">
        {children}
      </div>
    </div>
  );
}
