const Block = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`} />
);

export default function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <Block className="h-7 w-36 mb-6" />

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <Block className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex-shrink-0" />
            <div className="flex-1 w-full space-y-3">
              <Block className="h-6 w-44" />
              <Block className="h-4 w-32" />
              <Block className="h-4 w-56" />
              <div className="flex gap-3 pt-1">
                <Block className="h-9 w-36 rounded-lg" />
                <Block className="h-4 w-20" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[1, 2].map((card) => (
            <div key={card} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
              <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-gray-100 dark:border-gray-800">
                <Block className="w-4 h-4" />
                <Block className="h-4 w-28" />
              </div>
              {[1, 2, 3].map((row) => (
                <div key={row} className="py-3 first:pt-0 last:pb-0">
                  <Block className="h-3 w-16 mb-1.5" />
                  <Block className="h-4 w-full" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
