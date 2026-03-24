// Generic card skeleton — shown instantly on any trip sub-page navigation
function SkeletonLine({ w = 'w-full', h = 'h-4' }: { w?: string; h?: string }) {
  return <div className={`${h} ${w} bg-gray-200 rounded`} />
}

export default function TripPageLoading() {
  return (
    <div className="animate-pulse space-y-4 pb-24">
      {/* Header bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gray-200 rounded-full" />
        <SkeletonLine w="w-40" h="h-6" />
      </div>

      {/* Two wide cards */}
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
          <SkeletonLine w="w-2/3" h="h-5" />
          <SkeletonLine w="w-full" h="h-4" />
          <SkeletonLine w="w-4/5" h="h-4" />
        </div>
      ))}
    </div>
  )
}
