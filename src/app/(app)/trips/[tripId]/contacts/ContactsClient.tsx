'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, Phone, Trash2, AlertTriangle } from 'lucide-react'

interface Contact {
  id: string
  name: string
  phone: string | null
  role: string | null
  notes: string | null
  is_emergency: boolean
}

interface Props {
  tripId: string
  initialContacts: Contact[]
  isPlanner: boolean
}

export default function ContactsClient({ tripId, initialContacts, isPlanner }: Props) {
  const supabase = createClient()
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', role: '', notes: '', is_emergency: false })

  async function addContact(e: React.FormEvent) {
    e.preventDefault()
    const { data, error } = await supabase.from('contacts').insert({ trip_id: tripId, ...form }).select().single()
    if (error) toast.error(error.message)
    else {
      setContacts(prev => {
        const next = [data as Contact, ...prev]
        return next.sort((a, b) => Number(b.is_emergency) - Number(a.is_emergency))
      })
      setShowForm(false)
      setForm({ name: '', phone: '', role: '', notes: '', is_emergency: false })
      toast.success('Contact added')
    }
  }

  async function deleteContact(id: string) {
    await supabase.from('contacts').delete().eq('id', id)
    setContacts(prev => prev.filter(c => c.id !== id))
    toast.success('Deleted')
  }

  const emergency = contacts.filter(c => c.is_emergency)
  const regular = contacts.filter(c => !c.is_emergency)

  return (
    <div className="space-y-4">
      {/* Emergency contacts */}
      {emergency.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <h2 className="flex items-center gap-2 font-semibold text-red-800 mb-3">
            <AlertTriangle size={16} /> Emergency Contacts
          </h2>
          <div className="space-y-2">
            {emergency.map(c => (
              <div key={c.id} className="flex items-center justify-between bg-white border border-red-100 rounded-xl p-3">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                  {c.role && <p className="text-xs text-gray-500">{c.role}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {c.phone && (
                    <a href={`tel:${c.phone}`} className="flex items-center gap-1 bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium">
                      <Phone size={12} /> {c.phone}
                    </a>
                  )}
                  {isPlanner && (
                    <button onClick={() => deleteContact(c.id)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular contacts */}
      {regular.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <h2 className="font-semibold text-gray-900 mb-3">Contacts</h2>
          <div className="space-y-2">
            {regular.map(c => (
              <div key={c.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                  {c.role && <p className="text-xs text-gray-500">{c.role}</p>}
                  {c.notes && <p className="text-xs text-gray-500 mt-0.5">{c.notes}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  {c.phone && (
                    <a href={`tel:${c.phone}`} className="flex items-center gap-1 bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium">
                      <Phone size={12} /> Call
                    </a>
                  )}
                  {isPlanner && (
                    <button onClick={() => deleteContact(c.id)} className="text-gray-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {contacts.length === 0 && !showForm && (
        <div className="text-center py-12 text-gray-400">
          <Phone size={36} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">No contacts saved</p>
          <p className="text-sm mt-1">Add your driver, hotel, and emergency numbers</p>
        </div>
      )}

      {isPlanner && (
        <button onClick={() => setShowForm(!showForm)} className="w-full border border-dashed border-gray-300 text-gray-500 hover:border-emerald-400 hover:text-emerald-600 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors">
          <Plus size={16} /> Add contact
        </button>
      )}

      {showForm && (
        <form onSubmit={addContact} className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
          <h3 className="font-semibold text-gray-900">New contact</h3>
          <input
            placeholder="Name *"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            required
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Phone"
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
            />
            <input
              placeholder="Role (e.g. Driver)"
              value={form.role}
              onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
            />
          </div>
          <input
            placeholder="Notes"
            value={form.notes}
            onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
          />
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_emergency}
              onChange={e => setForm(p => ({ ...p, is_emergency: e.target.checked }))}
              className="accent-red-600"
            />
            Mark as emergency contact
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm">Cancel</button>
            <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded-xl text-sm font-medium">Save</button>
          </div>
        </form>
      )}
    </div>
  )
}
