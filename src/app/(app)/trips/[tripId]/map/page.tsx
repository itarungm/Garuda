import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import TripMap from './TripMap'

export default async function MapPage({ params }: { params: { tripId: string } }) {
  const supabase = createClient()
  const { data: trip } = await supabase.from('trips').select('*').eq('id', params.tripId).single()
  if (!trip) notFound()

  const [{ data: stops }, { data: photoStops }] = await Promise.all([
    supabase
      .from('itinerary_stops')
      .select('id, name, lat, lng, category, time_label, description')
      .eq('trip_id', params.tripId)
      .not('lat', 'is', null)
      .not('lng', 'is', null),
    supabase
      .from('photos')
      .select('id, url, lat, lng, caption')
      .eq('trip_id', params.tripId)
      .not('lat', 'is', null)
      .not('lng', 'is', null),
  ])

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold text-gray-900">Map — {trip.name}</h1>
      <TripMap stops={stops || []} tripName={trip.name} photos={photoStops || []} />
    </div>
  )
}
