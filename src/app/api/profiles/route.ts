import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// GET /api/profiles?ids=uid1,uid2,uid3
// Uses admin client to bypass RLS — safe because we only expose name + avatar
export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get('ids')
  if (!ids) return NextResponse.json([])

  const idList = ids.split(',').filter(Boolean).slice(0, 50) // cap at 50
  if (!idList.length) return NextResponse.json([])

  const admin = createAdminClient()
  const { data } = await admin
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', idList)

  return NextResponse.json(data || [])
}
