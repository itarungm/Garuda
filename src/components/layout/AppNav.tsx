'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, User, Settings } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { useState } from 'react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface Props {
  user: SupabaseUser
  profile: { full_name: string | null; avatar_url: string | null } | null
}

export default function AppNav({ user, profile }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const name = profile?.full_name || user.email || 'Traveler'
  const initials = getInitials(name)

  return (
    <header className="bg-[#1a4731] text-white px-4 py-3 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl">🦅</span>
          <span className="font-bold text-lg tracking-tight">Garuda</span>
        </Link>

        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white font-semibold text-sm"
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={name} className="w-full h-full rounded-full object-cover" />
            ) : initials}
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <div className="absolute right-0 top-11 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 w-52 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <div className="py-1">
                  <Link href="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                    <User size={15} /> Profile
                  </Link>
                  <button onClick={signOut} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
