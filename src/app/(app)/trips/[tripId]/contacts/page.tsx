import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ContactsClient from './ContactsClient'

export default async function ContactsPage({ params }: { params: { tripId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: trip } = await supabase.from('trips').select('name, owner_id').eq('id', params.tripId).single()
  if (!trip) notFound()

  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .eq('trip_id', params.tripId)
    .order('is_emergency', { ascending: false })

  const isPlanner = trip.owner_id === user!.id

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Contacts & Emergency</h1>
        <p className="text-sm text-gray-500">{trip.name}</p>
      </div>
      <ContactsClient tripId={params.tripId} initialContacts={contacts || []} isPlanner={isPlanner} />
    </div>
  )
}
