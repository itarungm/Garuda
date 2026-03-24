import { createClient, createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import MembersClient from './MembersClient'

export default async function MembersPage({ params }: { params: { tripId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: trip } = await supabase.from('trips').select('name, owner_id').eq('id', params.tripId).single()
  if (!trip) notFound()

  const admin = createAdminClient()

  // Fetch pending invites
  const { data: pendingInvites } = await admin
    .from('trip_invites')
    .select('*')
    .eq('trip_id', params.tripId)
    .eq('status', 'pending')

  // Reconcile: if an invited email already has an account, add them as member + mark accepted
  const trulyPending = []
  for (const invite of (pendingInvites || [])) {
    if (!invite.email) { trulyPending.push(invite); continue }
    const { data: authUserId } = await admin.rpc('get_auth_user_id_by_email', { p_email: invite.email })
    const authUser = authUserId ? { id: authUserId as string } : null
    if (authUser) {
      // User has an account — ensure they're a member
      await admin.from('trip_members').upsert(
        { trip_id: params.tripId, user_id: authUser.id, role: 'viewer' },
        { onConflict: 'trip_id,user_id' }
      )
      // Clear the pending invite
      await admin.from('trip_invites').update({ status: 'accepted' }).eq('id', invite.id)
    } else {
      trulyPending.push(invite)
    }
  }

  // Re-fetch members after reconciliation (may have added new ones above)
  const { data: memberRows } = await admin
    .from('trip_members')
    .select('id, user_id, role, joined_at')
    .eq('trip_id', params.tripId) as { data: { id: string; user_id: string; role: string; joined_at: string }[] | null }

  // Fetch profiles separately to avoid PostgREST join issues (no direct FK)
  const userIds = (memberRows || []).map(m => m.user_id)
  const { data: profileRows } = (userIds.length
    ? await admin.from('profiles').select('id, full_name, avatar_url').in('id', userIds)
    : { data: [] }) as { data: { id: string; full_name: string | null; avatar_url: string | null }[] | null }
  const profileMap: Record<string, { id: string; full_name: string | null; avatar_url: string | null }> =
    Object.fromEntries((profileRows || []).map(p => [p.id, p]))

  const members = (memberRows || []).map(m => ({
    ...m,
    profiles: profileMap[m.user_id] || null,
  }))

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Group Members</h1>
        <p className="text-sm text-gray-500">{trip.name}</p>
      </div>
      <MembersClient
        tripId={params.tripId}
        currentUserId={user!.id}
        isOwner={trip.owner_id === user!.id}
        initialMembers={(members || []) as any}
        initialInvites={trulyPending as any}
      />
    </div>
  )
}
