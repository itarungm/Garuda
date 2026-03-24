'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Save, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getInitials } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'

interface Props {
  user: User
  profile: { full_name: string | null; avatar_url: string | null } | null
}

export default function ProfileClient({ user, profile }: Props) {
  const supabase = createClient()
  const router = useRouter()

  // Resolve name: profiles table → Google metadata → email prefix
  const resolvedName =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Traveler'

  const [fullName, setFullName] = useState(resolvedName)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, full_name: fullName.trim() }, { onConflict: 'id' })
    if (error) toast.error(error.message)
    else { toast.success('Name updated!'); router.refresh() }
    setSaving(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture

  return (
    <div className="space-y-4 max-w-sm mx-auto">
      <h1 className="text-xl font-bold text-gray-900">Profile</h1>

      {/* Avatar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-full bg-amber-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
          {avatarUrl
            ? <img src={avatarUrl} alt={resolvedName} className="w-full h-full object-cover" />
            : getInitials(resolvedName)
          }
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-900">{resolvedName}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      {/* Edit name */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
        <h2 className="font-semibold text-gray-900 text-sm">Edit profile</h2>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Display name</label>
          <input
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Your name"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button
          onClick={save}
          disabled={saving || !fullName.trim()}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Save changes
        </button>
      </div>

      {/* Account info */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2">
        <h2 className="font-semibold text-gray-900 text-sm">Account</h2>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Email</span>
          <span className="text-gray-900">{user.email}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Sign-in method</span>
          <span className="text-gray-900 capitalize">
            {user.app_metadata?.provider === 'google' ? 'Google' : 'Email'}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Member since</span>
          <span className="text-gray-900">
            {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Sign out */}
      <button
        onClick={signOut}
        className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 py-2.5 rounded-2xl text-sm font-medium transition-colors"
      >
        <LogOut size={15} /> Sign out
      </button>
    </div>
  )
}
