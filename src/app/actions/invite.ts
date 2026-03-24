'use server'

import { createClient } from '@/lib/supabase/server'

export async function sendTripInviteEmail(tripId: string, email: string): Promise<{ token: string; error?: string }> {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { token: '', error: 'Not authenticated' }

  // Check if invite already exists for this email+trip
  const { data: existing } = await supabase
    .from('trip_invites')
    .select('token')
    .eq('trip_id', tripId)
    .eq('email', email.toLowerCase())
    .maybeSingle()

  if (existing) return { token: existing.token }

  // Create new invite record
  const { data: invite, error: dbError } = await supabase
    .from('trip_invites')
    .insert({ trip_id: tripId, email: email.toLowerCase(), invited_by: user.id, status: 'pending' })
    .select()
    .single()

  if (dbError || !invite) {
    console.error('[invite] DB error:', dbError)
    return { token: '', error: dbError?.message || 'Failed to create invite' }
  }

  // No email sending — user copies the invite link and shares it manually.
  // Supabase inviteUserByEmail is unreliable (rate limits, existing users, SMTP issues).
  // The /invite/accept page handles signup + joining the trip via the token.
  return { token: invite.token }
}
