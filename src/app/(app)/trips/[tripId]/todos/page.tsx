import { createClient, createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import TodoBoard from './TodoBoard'

export default async function TodosPage({ params }: { params: { tripId: string } }) {
  const supabase = createClient()
  const admin = createAdminClient()
  const [{ data: trip }, { data: { user } }] = await Promise.all([
    supabase.from('trips').select('name').eq('id', params.tripId).single(),
    supabase.auth.getUser(),
  ])
  if (!trip || !user) notFound()

  const { data: todos } = await supabase
    .from('todos')
    .select('*')
    .eq('trip_id', params.tripId)
    .order('order_index')

  // Use admin to bypass RLS on trip_members and profiles
  const { data: memberRows } = await admin
    .from('trip_members')
    .select('user_id, role')
    .eq('trip_id', params.tripId) as { data: { user_id: string; role: string }[] | null }

  const userIds = (memberRows || []).map(m => m.user_id)
  const { data: profileRows } = (userIds.length
    ? await admin.from('profiles').select('id, full_name, avatar_url').in('id', userIds)
    : { data: [] }) as { data: { id: string; full_name: string | null; avatar_url: string | null }[] | null }
  const profileMap = Object.fromEntries((profileRows || []).map(p => [p.id, p]))
  const members = (memberRows || []).map(m => ({
    user_id: m.user_id, role: m.role,
    profiles: profileMap[m.user_id] || null,
  }))

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">To-Do Board</h1>
        <p className="text-sm text-gray-500">{trip.name}</p>
      </div>
      <TodoBoard tripId={params.tripId} initialTodos={todos || []} members={members || []} currentUserId={user.id} />
    </div>
  )
}
