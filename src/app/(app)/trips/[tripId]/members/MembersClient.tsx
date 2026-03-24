'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, X, Mail, Copy, Check, ChevronDown, UserMinus, Shield, Eye, Loader2 } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { sendTripInviteEmail } from '@/app/actions/invite'

interface Member {
  id: string
  user_id: string
  role: string
  profiles: { full_name: string | null; avatar_url: string | null } | null
}

interface Invite {
  id: string
  email: string
  token?: string
  status: string
  created_at: string
}

interface Props {
  tripId: string
  currentUserId: string
  isOwner: boolean
  initialMembers: Member[]
  initialInvites: Invite[]
}

const ROLE_OPTIONS = [
  { value: 'co-planner', label: 'Co-planner', icon: Shield, desc: 'Can edit itinerary & manage todos' },
  { value: 'viewer', label: 'Viewer', icon: Eye, desc: 'Can view everything, add todos & photos' },
]

const roleColors: Record<string, string> = {
  owner: 'bg-amber-100 text-amber-700',
  'co-planner': 'bg-blue-100 text-blue-700',
  viewer: 'bg-gray-100 text-gray-600',
}

export default function MembersClient({ tripId, currentUserId, isOwner, initialMembers, initialInvites }: Props) {
  const supabase = createClient()
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [invites, setInvites] = useState<Invite[]>(initialInvites)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [roleDropdown, setRoleDropdown] = useState<string | null>(null) // member.id
  const [confirmRemove, setConfirmRemove] = useState<Member | null>(null)
  const [removing, setRemoving] = useState(false)
  const [savingRole, setSavingRole] = useState<string | null>(null)

  async function sendInvite() {
    if (!email.includes('@')) { toast.error('Invalid email'); return }
    setSending(true)
    const { token, error } = await sendTripInviteEmail(tripId, email)
    if (token) {
      const newInvite: Invite = { id: token, email, token, status: 'pending', created_at: new Date().toISOString() }
      setInvites(prev => [newInvite, ...prev.filter(i => i.email !== email)])
      setEmail('')
      toast.success('Invite link created! Copy it below and share on WhatsApp 👇')
    } else {
      toast.error(error || 'Failed to create invite')
    }
    setSending(false)
  }

  async function copyLink(token: string) {
    const url = `${window.location.origin}/invite/accept?token=${token}`
    await navigator.clipboard.writeText(url)
    setCopiedToken(token)
    toast.success('Invite link copied!')
    setTimeout(() => setCopiedToken(null), 2000)
  }

  async function revokeInvite(id: string) {
    await supabase.from('trip_invites').delete().eq('id', id)
    setInvites(prev => prev.filter(i => i.id !== id))
  }

  async function changeRole(member: Member, newRole: string) {
    setSavingRole(member.id)
    setRoleDropdown(null)
    const { error } = await supabase
      .from('trip_members')
      .update({ role: newRole })
      .eq('id', member.id)
    if (error) {
      toast.error('Failed to update role')
    } else {
      setMembers(prev => prev.map(m => m.id === member.id ? { ...m, role: newRole } : m))
      toast.success(`${member.profiles?.full_name || 'Member'} is now ${newRole}`)
    }
    setSavingRole(null)
  }

  async function removeMember() {
    if (!confirmRemove) return
    setRemoving(true)
    const { error } = await supabase
      .from('trip_members')
      .delete()
      .eq('id', confirmRemove.id)
    if (error) {
      toast.error('Failed to remove member')
    } else {
      setMembers(prev => prev.filter(m => m.id !== confirmRemove.id))
      toast.success(`${confirmRemove.profiles?.full_name || 'Member'} removed`)
    }
    setConfirmRemove(null)
    setRemoving(false)
  }

  return (
    <div className="space-y-4">
      {/* Members list */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4">
        <h2 className="font-semibold text-gray-900 mb-3">Members ({members.length})</h2>
        <div className="space-y-1">
          {members.map(m => {
            const name = m.profiles?.full_name || 'User'
            const isMe = m.user_id === currentUserId
            const isThisOwner = m.role === 'owner'
            const canManage = isOwner && !isMe && !isThisOwner

            return (
              <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 relative">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 overflow-hidden">
                  {m.profiles?.avatar_url
                    ? <img src={m.profiles.avatar_url} alt={name} className="w-full h-full object-cover" />
                    : getInitials(name)
                  }
                </div>

                {/* Name + "you" hint */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {name} {isMe && <span className="text-xs text-gray-400">(you)</span>}
                  </p>
                </div>

                {/* Role badge / dropdown for owner */}
                {canManage ? (
                  <div className="relative">
                    <button
                      onClick={() => setRoleDropdown(prev => prev === m.id ? null : m.id)}
                      className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium border transition-colors ${roleColors[m.role] || roleColors.viewer} hover:opacity-80`}
                    >
                      {savingRole === m.id
                        ? <Loader2 size={11} className="animate-spin" />
                        : <>{m.role} <ChevronDown size={10} /></>
                      }
                    </button>

                    {roleDropdown === m.id && (
                      <div className="absolute right-0 top-7 bg-white border border-gray-200 rounded-xl shadow-lg z-20 w-52 overflow-hidden">
                        {ROLE_OPTIONS.map(opt => {
                          const Icon = opt.icon
                          return (
                            <button
                              key={opt.value}
                              onClick={() => changeRole(m, opt.value)}
                              className={`w-full flex items-start gap-3 px-3 py-2.5 hover:bg-gray-50 text-left transition-colors ${m.role === opt.value ? 'bg-gray-50' : ''}`}
                            >
                              <Icon size={15} className="mt-0.5 text-gray-500 shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{opt.label}</p>
                                <p className="text-xs text-gray-400">{opt.desc}</p>
                              </div>
                              {m.role === opt.value && <Check size={13} className="ml-auto mt-1 text-emerald-500" />}
                            </button>
                          )
                        })}
                        <div className="border-t border-gray-100">
                          <button
                            onClick={() => { setRoleDropdown(null); setConfirmRemove(m) }}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <UserMinus size={14} /> Remove from trip
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[m.role] || roleColors.viewer}`}>
                    {m.role}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Invite section — owner only */}
      {isOwner && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <h2 className="font-semibold text-gray-900 mb-1">Invite someone</h2>
          <p className="text-xs text-gray-400 mb-3">Enter their email → copy the link → share on WhatsApp</p>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendInvite()}
              placeholder="friend@example.com"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={sendInvite}
              disabled={sending}
              className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-60 flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus size={15} /> {sending ? 'Sending…' : 'Send invite'}
            </button>
          </div>

          {invites.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-gray-500 font-medium">Pending invites</p>
              {invites.map(inv => (
                <div key={inv.id} className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail size={14} className="text-yellow-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700 truncate">{inv.email}</span>
                    <span className="text-xs text-yellow-600 font-medium flex-shrink-0">Pending</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {inv.token && (
                      <button
                        onClick={() => copyLink(inv.token!)}
                        className="text-gray-400 hover:text-emerald-600 transition-colors"
                        title="Copy invite link"
                      >
                        {copiedToken === inv.token ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    )}
                    <button onClick={() => revokeInvite(inv.id)} className="text-gray-400 hover:text-red-500">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Click-away to close dropdown */}
      {roleDropdown && (
        <div className="fixed inset-0 z-10" onClick={() => setRoleDropdown(null)} />
      )}

      {/* Remove member confirmation modal */}
      {confirmRemove && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <UserMinus size={18} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Remove member?</h3>
                <p className="text-sm text-gray-500">{confirmRemove.profiles?.full_name || 'This member'}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              They&apos;ll lose access to this trip immediately. You can invite them again later.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmRemove(null)}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={removeMember}
                disabled={removing}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-1"
              >
                {removing ? <Loader2 size={14} className="animate-spin" /> : <UserMinus size={14} />} Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
