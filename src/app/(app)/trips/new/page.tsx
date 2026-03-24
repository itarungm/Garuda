'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Plus, X } from 'lucide-react'

export default function NewTripPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    destination: '',
    description: '',
    start_date: '',
    end_date: '',
  })
  const [inviteEmails, setInviteEmails] = useState<string[]>([])
  const [emailInput, setEmailInput] = useState('')

  function addEmail() {
    const email = emailInput.trim().toLowerCase()
    if (!email.includes('@')) { toast.error('Invalid email'); return }
    if (inviteEmails.includes(email)) return
    setInviteEmails(prev => [...prev, email])
    setEmailInput('')
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Trip name required'); return }
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Not logged in'); setLoading(false); return }

    const { data: trip, error } = await supabase
      .from('trips')
      .insert({ ...form, owner_id: user.id })
      .select()
      .single()

    if (error || !trip) { toast.error(error?.message || 'Failed to create trip'); setLoading(false); return }

    // Add owner as member
    await supabase.from('trip_members').insert({ trip_id: trip.id, user_id: user.id, role: 'owner' })

    // Send invites
    if (inviteEmails.length > 0) {
      await Promise.all(inviteEmails.map(email =>
        supabase.from('trip_invites').insert({ trip_id: trip.id, email, invited_by: user.id })
      ))
    }

    toast.success('Trip created!')
    router.push(`/trips/${trip.id}`)
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">New Trip</h1>

      <form onSubmit={handleCreate} className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trip name *</label>
            <input
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Meghalaya 2026"
              required
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
            <input
              value={form.destination}
              onChange={e => setForm(p => ({ ...p, destination: e.target.value }))}
              placeholder="Shillong, Meghalaya"
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="A 5-day expedition through the Abode of Clouds..."
              rows={3}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start date</label>
              <input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End date</label>
              <input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
        </div>

        {/* Invite friends */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Invite friends</h2>
          <div className="flex gap-2">
            <input
              type="email"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addEmail())}
              placeholder="friend@example.com"
              className="flex-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button type="button" onClick={addEmail} className="bg-emerald-600 text-white px-3 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors">
              <Plus size={18} />
            </button>
          </div>
          {inviteEmails.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {inviteEmails.map(email => (
                <span key={email} className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 text-xs text-emerald-700">
                  {email}
                  <button type="button" onClick={() => setInviteEmails(p => p.filter(e => e !== email))}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1a4731] hover:bg-[#15392a] disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Create trip
        </button>
      </form>
    </div>
  )
}
