import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import TicketsClient from './TicketsClient'

export default async function TicketsPage({ params }: { params: { tripId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: trip } = await supabase.from('trips').select('name').eq('id', params.tripId).single()
  if (!trip) notFound()

  const { data: tickets } = await supabase
    .from('tickets')
    .select('*')
    .eq('trip_id', params.tripId)
    .order('travel_date', { ascending: true, nullsFirst: false })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Ticket Vault</h1>
        <p className="text-sm text-gray-500">{trip.name}</p>
      </div>
      <TicketsClient tripId={params.tripId} currentUserId={user!.id} initialTickets={(tickets || []) as any} />
    </div>
  )
}
