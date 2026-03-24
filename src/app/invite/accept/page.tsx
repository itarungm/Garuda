import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function InviteAcceptPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token
  if (!token) redirect('/dashboard')

  const supabase = createClient()
  const admin = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/login?invite=${token}`)

  const { data: invite } = await supabase
    .from('trip_invites')
    .select('*')
    .eq('token', token)
    .maybeSingle()

  // If already accepted or not found, go to dashboard or the trip if we know it
  if (!invite) redirect('/dashboard')
  if (invite.status === 'accepted') redirect(`/trips/${invite.trip_id}`)

  // Add to trip members using admin to bypass RLS
  await admin.from('trip_members').upsert({
    trip_id: invite.trip_id,
    user_id: user.id,
    role: 'viewer',
  }, { onConflict: 'trip_id,user_id' })

  // Mark invite accepted using admin to bypass RLS (invited user has no role yet)
  await admin.from('trip_invites').update({ status: 'accepted' }).eq('id', invite.id)

  redirect(`/trips/${invite.trip_id}`)
}
