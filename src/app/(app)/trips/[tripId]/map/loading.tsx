export default function MapLoading() {
  return (
    <div className="animate-pulse">
      <div className="w-full bg-gray-200 rounded-2xl" style={{ height: 'calc(100vh - 140px)' }}>
        <div className="h-full flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto" />
            <div className="h-4 bg-gray-300 rounded w-28 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  )
}
