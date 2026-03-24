import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import GalleryClient from './GalleryClient'
import { differenceInDays, parseISO } from 'date-fns'

export default async function GalleryPage({ params }: { params: { tripId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: trip } = await supabase.from('trips').select('name, start_date, end_date').eq('id', params.tripId).single()
  if (!trip) notFound()

  const { data: photos } = await supabase
    .from('photos')
    .select('*, profiles(full_name)')
    .eq('trip_id', params.tripId)
    .order('created_at', { ascending: false })

  const tripDays = trip.start_date && trip.end_date
    ? differenceInDays(parseISO(trip.end_date), parseISO(trip.start_date)) + 1
    : 5

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Photo Wall</h1>
        <p className="text-sm text-gray-500">{trip.name} · {photos?.length || 0} photos</p>
      </div>
      <GalleryClient
        tripId={params.tripId}
        currentUserId={user!.id}
        initialPhotos={(photos || []) as any}
        tripDays={tripDays}
      />
    </div>
  )
}
