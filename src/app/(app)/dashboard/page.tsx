import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, MapPin, Calendar, Users } from 'lucide-react'
import { formatDate, tripCountdown } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get all trips the user is owner or member of
  const { data: ownedTrips } = await supabase
    .from('trips')
    .select('*')
    .eq('owner_id', user!.id)
    .order('start_date', { ascending: true })

  const { data: memberTrips } = await supabase
    .from('trip_members')
    .select('trip_id, trips(*)')
    .eq('user_id', user!.id)
    .neq('role', 'owner')

  const allTrips: any[] = [
    ...(ownedTrips || []).map((t: any) => ({ ...t, isOwner: true })),
    ...(memberTrips || []).filter(m => m.trips).map(m => ({ ...(m.trips as any), isOwner: false })),
  ]

  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user!.id).single()

  const name = profile?.full_name?.split(' ')[0] || 'Traveler'

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-gray-900">Hey {name} 👋</h1>
        <p className="text-gray-500 text-sm mt-0.5">Your trips and adventures</p>
      </div>

      {/* CTA */}
      <Link
        href="/trips/new"
        className="flex items-center gap-3 bg-[#1a4731] text-white rounded-2xl p-5 hover:bg-[#15392a] transition-colors"
      >
        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <Plus size={20} />
        </div>
        <div>
          <p className="font-semibold">Plan a new trip</p>
          <p className="text-green-300 text-xs mt-0.5">Add destinations, invite friends, track everything</p>
        </div>
      </Link>

      {/* Trips */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Your Trips</h2>
        {allTrips.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <span className="text-5xl block mb-3">🗺️</span>
            <p className="font-medium">No trips yet</p>
            <p className="text-sm mt-1">Create your first trip above</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allTrips.map((trip: any) => {
              const days = trip.start_date ? tripCountdown(trip.start_date) : null
              return (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all hover:border-emerald-300 block"
                >
                  {/* Cover image or gradient */}
                  <div className="h-28 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 mb-3 flex items-end p-3 overflow-hidden relative">
                    {trip.cover_image_url && (
                      <img src={trip.cover_image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                    )}
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full relative z-10 ${
                      trip.status === 'active' ? 'bg-green-400 text-green-900' :
                      trip.status === 'completed' ? 'bg-gray-300 text-gray-700' :
                      'bg-amber-400 text-amber-900'
                    }`}>
                      {trip.status === 'active' ? '🟢 Active' : trip.status === 'completed' ? '✓ Done' : '📋 Planning'}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-900 truncate">{trip.name}</h3>
                  <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                    <MapPin size={11} />
                    <span className="truncate">{trip.destination || 'Destination TBD'}</span>
                  </div>
                  {trip.start_date && (
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-gray-500 text-xs">
                        <Calendar size={11} />
                        <span>{formatDate(trip.start_date, 'dd MMM')}</span>
                        {trip.end_date && <><span>–</span><span>{formatDate(trip.end_date, 'dd MMM yyyy')}</span></>}
                      </div>
                      {days !== null && days > 0 && (
                        <span className="text-xs text-amber-600 font-medium">{days}d away</span>
                      )}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
