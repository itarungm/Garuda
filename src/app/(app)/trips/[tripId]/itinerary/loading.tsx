export default function ItineraryLoading() {
  return (
    <div className="animate-pulse space-y-4 pb-24">
      {/* Day tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-9 w-16 bg-gray-200 rounded-full flex-shrink-0" />
        ))}
      </div>
      {/* Stops */}
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
          <div className="h-4 bg-gray-100 rounded w-full" />
        </div>
      ))}
    </div>
  )
}
