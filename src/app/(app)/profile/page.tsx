import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Ensure profile row exists (Google OAuth users may not have one)
  const nameFromMeta = user.user_metadata?.full_name || user.user_metadata?.name || null
  const avatarFromMeta = user.user_metadata?.avatar_url || user.user_metadata?.picture || null

  const { data: profile } = await supabase
    .from('profiles')
    .upsert({ id: user.id, full_name: nameFromMeta, avatar_url: avatarFromMeta }, { onConflict: 'id', ignoreDuplicates: true })
    .select()
    .single()

  // Fall back to a fresh select if upsert returned nothing
  const { data: freshProfile } = profile
    ? { data: profile }
    : await supabase.from('profiles').select('*').eq('id', user.id).single()

  return <ProfileClient user={user} profile={freshProfile} />
}
