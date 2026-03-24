export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="pt-2">
        <div className="h-8 bg-gray-200 rounded-lg w-48 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-36" />
      </div>
      <div className="h-20 bg-gray-200 rounded-2xl" />
      <div>
        <div className="h-4 bg-gray-100 rounded w-24 mb-3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2].map(i => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="h-28 bg-gray-200 rounded-xl mb-3" />
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
