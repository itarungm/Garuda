export default function TodosLoading() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-3 gap-3 pb-24">
        {['To Do', 'In Progress', 'Done'].map(col => (
          <div key={col} className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-3 space-y-1.5">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
