export default function ExpensesLoading() {
  return (
    <div className="animate-pulse space-y-4 pb-24">
      <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-1/3" />
        <div className="h-8 bg-gray-100 rounded w-full" />
        <div className="h-8 bg-gray-100 rounded w-full" />
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 flex gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
          <div className="h-5 bg-gray-200 rounded w-16" />
        </div>
      ))}
    </div>
  )
}
