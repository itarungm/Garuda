import { createClient, createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ChatClient from './ChatClient'

export default async function ChatPage({ params, searchParams }: { params: { tripId: string }; searchParams: { thread?: string } }) {
  const supabase = createClient()
  const admin = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  const thread = searchParams.thread || 'general'

  const { data: trip } = await supabase.from('trips').select('name').eq('id', params.tripId).single()
  if (!trip) notFound()

  const { data: profile } = await admin.from('profiles').select('full_name, avatar_url').eq('id', user!.id).maybeSingle() as { data: { full_name: string | null; avatar_url: string | null } | null }
  const senderName = profile?.full_name || 'Someone'
  const senderAvatar = profile?.avatar_url ?? null

  // Fetch messages then enrich with profiles via admin (profiles RLS only shows own row)
  const { data: rawMessages } = await supabase
    .from('messages')
    .select('*')
    .eq('trip_id', params.tripId)
    .eq('thread_id', thread)
    .order('created_at')
    .limit(100)

  const senderIds = [...new Set((rawMessages || []).map((m: any) => m.user_id))]
  const { data: profileRows } = (senderIds.length
    ? await admin.from('profiles').select('id, full_name, avatar_url').in('id', senderIds)
    : { data: [] }) as { data: { id: string; full_name: string | null; avatar_url: string | null }[] | null }
  const profileMap = Object.fromEntries((profileRows || []).map(p => [p.id, p]))
  const messages = (rawMessages || []).map((m: any) => ({ ...m, profiles: profileMap[m.user_id] || null }))

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Chat</h1>
        <p className="text-sm text-gray-500">{trip.name} · #{thread}</p>
      </div>
      <ChatClient
        tripId={params.tripId}
        currentUserId={user!.id}
        senderName={senderName}
        senderAvatar={senderAvatar}
        initialMessages={(messages || []) as any}
        initialProfilesMap={profileMap}
        thread={thread}
      />
    </div>
  )
}
