import { createClient, createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ExpensesClient from './ExpensesClient'

export default async function ExpensesPage({ params }: { params: { tripId: string } }) {
  const supabase = createClient()
  const admin = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: trip } = await supabase.from('trips').select('name').eq('id', params.tripId).single()
  if (!trip) notFound()

  // Use admin client to bypass RLS on trip_members and profiles
  const { data: memberRows } = await admin
    .from('trip_members')
    .select('user_id')
    .eq('trip_id', params.tripId) as { data: { user_id: string }[] | null }

  const userIds = (memberRows || []).map(m => m.user_id)
  const { data: profileRows } = (userIds.length
    ? await admin.from('profiles').select('id, full_name, avatar_url').in('id', userIds)
    : { data: [] }) as { data: { id: string; full_name: string | null; avatar_url: string | null }[] | null }
  const profileMap = Object.fromEntries((profileRows || []).map(p => [p.id, p]))
  const members = (memberRows || []).map(m => ({
    user_id: m.user_id,
    profiles: profileMap[m.user_id] || null,
  }))

  const { data: expenses } = await supabase
    .from('expenses').select('*').eq('trip_id', params.tripId).order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Expenses</h1>
        <p className="text-sm text-gray-500">{trip.name}</p>
      </div>
      <ExpensesClient
        tripId={params.tripId}
        currentUserId={user!.id}
        initialExpenses={(expenses || []) as any}
        members={(members || []) as any}
      />
    </div>
  )
}
