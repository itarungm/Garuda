export default function ChatLoading() {
  return (
    <div className="animate-pulse flex flex-col h-[calc(100vh-140px)]">
      <div className="flex-1 space-y-3 p-4 overflow-hidden">
        {[false, true, false, false, true].map((mine, i) => (
          <div key={i} className={`flex gap-2 ${mine ? 'flex-row-reverse' : ''}`}>
            {!mine && <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />}
            <div className={`h-10 bg-gray-200 rounded-2xl ${mine ? 'w-48' : 'w-56'}`} />
          </div>
        ))}
      </div>
      <div className="border-t p-3">
        <div className="h-11 bg-gray-100 rounded-xl" />
      </div>
    </div>
  )
}
