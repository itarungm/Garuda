import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { STOP_CATEGORY_ICONS } from '@/lib/utils'
import ItineraryClient from './ItineraryClient'

export default async function ItineraryPage({ params }: { params: { tripId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: trip } = await supabase.from('trips').select('*').eq('id', params.tripId).single()
  if (!trip) notFound()

  const { data: days } = await supabase
    .from('itinerary_days')
    .select('*, itinerary_stops(*)')
    .eq('trip_id', params.tripId)
    .order('day_number')
    .order('order_index', { foreignTable: 'itinerary_stops', ascending: true })

  const { data: userActivities } = await supabase
    .from('activities')
    .select('*')
    .eq('trip_id', params.tripId)
    .eq('user_id', user!.id)

  return (
    <ItineraryClient
      trip={trip}
      days={days || []}
      userActivities={userActivities || []}
      userId={user!.id}
    />
  )
}
