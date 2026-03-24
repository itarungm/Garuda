import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:garuda@tripapp.in',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { tripId, title, body, url } = await req.json()
  if (!tripId) return NextResponse.json({ error: 'tripId required' }, { status: 400 })

  const admin = createAdminClient()

  // All trip members except the sender
  const { data: members } = await admin
    .from('trip_members')
    .select('user_id')
    .eq('trip_id', tripId)
    .neq('user_id', user.id) as { data: { user_id: string }[] | null }

  if (!members?.length) return NextResponse.json({ ok: true, sent: 0 })

  const memberIds = members.map(m => m.user_id)

  // Their push subscriptions (one or more devices per user)
  const { data: subs } = await admin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from('push_subscriptions' as string as any)
    .select('endpoint, subscription')
    .in('user_id', memberIds) as { data: { endpoint: string; subscription: webpush.PushSubscription }[] | null }

  if (!subs?.length) return NextResponse.json({ ok: true, sent: 0 })

  const payload = JSON.stringify({ title, body, url })
  const staleEndpoints: string[] = []

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(sub.subscription, payload)
      } catch (err: unknown) {
        // 410 Gone / 404 = subscription expired, clean it up
        const status = (err as { statusCode?: number }).statusCode
        if (status === 410 || status === 404) {
          staleEndpoints.push(sub.endpoint)
        }
      }
    })
  )

  if (staleEndpoints.length) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await admin.from('push_subscriptions' as string as any).delete().in('endpoint', staleEndpoints)
  }

  return NextResponse.json({ ok: true, sent: subs.length - staleEndpoints.length })
}
