'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { CheckCircle2, Circle, ChevronDown, ChevronUp, MapPin, Clock, DollarSign, AlertTriangle, Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import { cn, formatDate, STOP_CATEGORY_ICONS } from '@/lib/utils'
import Link from 'next/link'

interface Props {
  trip: any
  days: any[]
  userActivities: any[]
  userId: string
}

const CATEGORIES = ['transport','hotel','restaurant','viewpoint','waterfall','cave','adventure','river','temple','village']

const emptyStop = { name: '', time_label: '', description: '', tips: '', entry_fee: '', category: 'viewpoint', dietary_note: '' }

export default function ItineraryClient({ trip, days: initialDays, userActivities, userId }: Props) {
  const supabase = createClient()
  const [activeDay, setActiveDay] = useState(0)
  const [expandedStop, setExpandedStop] = useState<string | null>(null)
  const [days, setDays] = useState<any[]>(initialDays)
  const [activities, setActivities] = useState<Record<string, string>>(
    Object.fromEntries(userActivities.map(a => [a.stop_id, a.status]))
  )
  const [editingStop, setEditingStop] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, any>>({})
  const [adding, setAdding] = useState(false)
  const [newStop, setNewStop] = useState(emptyStop)
  const [saving, setSaving] = useState(false)

  async function toggleActivity(stopId: string, currentStatus: string) {
    const next = currentStatus === 'done' ? 'planned' : 'done'
    setActivities(p => ({ ...p, [stopId]: next }))
    const existing = userActivities.find(a => a.stop_id === stopId)
    if (existing) {
      await supabase.from('activities').update({ status: next, updated_at: new Date().toISOString() }).eq('id', existing.id)
    } else {
      await supabase.from('activities').insert({ trip_id: trip.id, stop_id: stopId, user_id: userId, status: next })
    }
    if (next === 'done') toast.success('Marked as done! ✓')
  }

  async function saveEdit(stopId: string) {
    const vals = editValues[stopId]
    if (!vals?.name?.trim()) { toast.error('Stop name required'); return }
    setSaving(true)
    const { error } = await supabase.from('itinerary_stops').update({
      name: vals.name, time_label: vals.time_label, description: vals.description,
      tips: vals.tips, entry_fee: vals.entry_fee, category: vals.category, dietary_note: vals.dietary_note,
    }).eq('id', stopId)
    if (error) { toast.error(error.message); setSaving(false); return }
    setDays(prev => prev.map(d => ({
      ...d, itinerary_stops: (d.itinerary_stops || []).map((s: any) =>
        s.id === stopId ? { ...s, ...vals } : s
      )
    })))
    setEditingStop(null)
    setSaving(false)
    toast.success('Stop updated')
  }

  async function deleteStop(stopId: string) {
    if (!confirm('Delete this stop?')) return
    await supabase.from('itinerary_stops').delete().eq('id', stopId)
    setDays(prev => prev.map(d => ({
      ...d, itinerary_stops: (d.itinerary_stops || []).filter((s: any) => s.id !== stopId)
    })))
    toast.success('Stop removed')
  }

  async function addStop() {
    if (!newStop.name.trim()) { toast.error('Stop name required'); return }
    const currentDay = days[activeDay]
    setSaving(true)
    const nextOrder = (currentDay.itinerary_stops || []).length
    const { data, error } = await supabase.from('itinerary_stops').insert({
      trip_id: trip.id, day_id: currentDay.id,
      name: newStop.name, time_label: newStop.time_label, description: newStop.description,
      tips: newStop.tips, entry_fee: newStop.entry_fee, category: newStop.category,
      dietary_note: newStop.dietary_note, order_index: nextOrder,
    }).select().single()
    if (error) { toast.error(error.message); setSaving(false); return }
    setDays(prev => prev.map((d, i) => i === activeDay
      ? { ...d, itinerary_stops: [...(d.itinerary_stops || []), data] }
      : d
    ))
    setNewStop(emptyStop)
    setAdding(false)
    setSaving(false)
    toast.success('Stop added!')
  }

  const currentDay = days[activeDay]
  const totalStops = days.reduce((acc, d) => acc + (d.itinerary_stops?.length || 0), 0)
  const doneCount = Object.values(activities).filter(s => s === 'done').length

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Itinerary</h1>
          <p className="text-sm text-gray-500">{trip.name}</p>
        </div>
        <Link href={`/trips/${trip.id}/map`} className="flex items-center gap-1 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-full font-medium">
          <MapPin size={12} /> View map
        </Link>
      </div>

      {/* Progress */}
      {totalStops > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Your progress</span>
            <span className="text-sm font-bold text-emerald-600">{doneCount}/{totalStops} stops</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: totalStops ? `${(doneCount / totalStops) * 100}%` : '0%' }}
            />
          </div>
        </div>
      )}

      {/* Day tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {days.map((day, i) => (
          <button
            key={day.id}
            onClick={() => setActiveDay(i)}
            className={cn(
              'flex-shrink-0 flex flex-col items-center px-4 py-2.5 rounded-xl border transition-all text-sm',
              activeDay === i
                ? 'bg-[#1a4731] text-white border-[#1a4731]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
            )}
          >
            <span className="font-bold text-xs">D{day.day_number}</span>
            {day.date && <span className="text-xs opacity-75">{formatDate(day.date, 'dd MMM')}</span>}
          </button>
        ))}
      </div>

      {/* Day content */}
      {currentDay ? (
        <div className="space-y-3 pb-24">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-start justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">{currentDay.theme || `Day ${currentDay.day_number}`}</h2>
              {currentDay.date && <p className="text-sm text-gray-500">{formatDate(currentDay.date, 'EEEE, dd MMMM yyyy')}</p>}
            </div>
            <button
              onClick={() => { setAdding(true); setEditingStop(null) }}
              className="flex items-center gap-1 text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-full font-medium"
            >
              <Plus size={12} /> Add stop
            </button>
          </div>

          {/* Add stop form */}
          {adding && (
            <div className="bg-white border-2 border-emerald-300 rounded-2xl p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-900">New stop for Day {currentDay.day_number}</p>
              <div className="grid grid-cols-2 gap-2">
                <input value={newStop.name} onChange={e => setNewStop(p => ({...p, name: e.target.value}))} placeholder="Stop name *" className="col-span-2 input-field" />
                <input value={newStop.time_label} onChange={e => setNewStop(p => ({...p, time_label: e.target.value}))} placeholder="Time (e.g. 09:00)" className="input-field" />
                <select value={newStop.category} onChange={e => setNewStop(p => ({...p, category: e.target.value}))} className="input-field">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input value={newStop.entry_fee} onChange={e => setNewStop(p => ({...p, entry_fee: e.target.value}))} placeholder="Entry fee" className="input-field" />
                <input value={newStop.dietary_note} onChange={e => setNewStop(p => ({...p, dietary_note: e.target.value}))} placeholder="Dietary note" className="input-field" />
                <textarea value={newStop.description} onChange={e => setNewStop(p => ({...p, description: e.target.value}))} placeholder="Description" rows={2} className="col-span-2 input-field resize-none" />
                <textarea value={newStop.tips} onChange={e => setNewStop(p => ({...p, tips: e.target.value}))} placeholder="Tips" rows={2} className="col-span-2 input-field resize-none" />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setAdding(false)} className="text-sm text-gray-500 px-4 py-2 rounded-xl border border-gray-200">Cancel</button>
                <button onClick={addStop} disabled={saving} className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium disabled:opacity-60">
                  {saving ? 'Saving…' : 'Add stop'}
                </button>
              </div>
            </div>
          )}

          {(currentDay.itinerary_stops || []).length === 0 && !adding && (
            <div className="text-center py-12 text-gray-400">
              <span className="text-4xl block mb-2">📋</span>
              <p className="text-sm">No stops added yet — tap "Add stop" above</p>
            </div>
          )}

          {(currentDay.itinerary_stops || []).map((stop: any) => {
            const status = activities[stop.id] || 'planned'
            const isDone = status === 'done'
            const icon = STOP_CATEGORY_ICONS[stop.category || 'default'] || '📍'
            const isExpanded = expandedStop === stop.id
            const isEditing = editingStop === stop.id
            const ev = editValues[stop.id] || stop

            if (isEditing) {
              return (
                <div key={stop.id} className="bg-white border-2 border-amber-300 rounded-2xl p-4 space-y-3">
                  <p className="text-sm font-semibold text-gray-900">Edit stop</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input value={ev.name} onChange={e => setEditValues(p => ({...p, [stop.id]: {...ev, name: e.target.value}}))} placeholder="Stop name *" className="col-span-2 input-field" />
                    <input value={ev.time_label || ''} onChange={e => setEditValues(p => ({...p, [stop.id]: {...ev, time_label: e.target.value}}))} placeholder="Time (e.g. 09:00)" className="input-field" />
                    <select value={ev.category || 'viewpoint'} onChange={e => setEditValues(p => ({...p, [stop.id]: {...ev, category: e.target.value}}))} className="input-field">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input value={ev.entry_fee || ''} onChange={e => setEditValues(p => ({...p, [stop.id]: {...ev, entry_fee: e.target.value}}))} placeholder="Entry fee" className="input-field" />
                    <input value={ev.dietary_note || ''} onChange={e => setEditValues(p => ({...p, [stop.id]: {...ev, dietary_note: e.target.value}}))} placeholder="Dietary note" className="input-field" />
                    <textarea value={ev.description || ''} onChange={e => setEditValues(p => ({...p, [stop.id]: {...ev, description: e.target.value}}))} placeholder="Description" rows={2} className="col-span-2 input-field resize-none" />
                    <textarea value={ev.tips || ''} onChange={e => setEditValues(p => ({...p, [stop.id]: {...ev, tips: e.target.value}}))} placeholder="Tips" rows={2} className="col-span-2 input-field resize-none" />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingStop(null)} className="text-sm text-gray-500 px-4 py-2 rounded-xl border border-gray-200">Cancel</button>
                    <button onClick={() => saveEdit(stop.id)} disabled={saving} className="text-sm bg-amber-500 text-white px-4 py-2 rounded-xl font-medium disabled:opacity-60">
                      {saving ? 'Saving…' : 'Save changes'}
                    </button>
                  </div>
                </div>
              )
            }

            return (
              <div key={stop.id} className={cn('bg-white border rounded-2xl overflow-hidden transition-all', isDone ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-200')}>
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <button onClick={() => toggleActivity(stop.id, status)} className="mt-0.5 flex-shrink-0 transition-colors">
                      {isDone ? <CheckCircle2 size={22} className="text-emerald-500" /> : <Circle size={22} className="text-gray-300" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span>{icon}</span>
                        <h3 className={cn('font-semibold text-gray-900', isDone && 'line-through text-gray-400')}>{stop.name}</h3>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-1">
                        {stop.time_label && <span className="flex items-center gap-1 text-xs text-gray-500"><Clock size={11} /> {stop.time_label}</span>}
                        {stop.entry_fee && <span className="flex items-center gap-1 text-xs text-gray-500"><DollarSign size={11} /> {stop.entry_fee}</span>}
                        {stop.lat && stop.lng && (
                          <a href={`https://maps.google.com/?q=${stop.lat},${stop.lng}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-emerald-600">
                            <MapPin size={11} /> Maps
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => { setEditingStop(stop.id); setEditValues(p => ({...p, [stop.id]: {...stop}})); setAdding(false) }} className="text-gray-300 hover:text-amber-500 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => deleteStop(stop.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                      <button onClick={() => setExpandedStop(isExpanded ? null : stop.id)} className="text-gray-400">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pl-8 space-y-2 text-sm text-gray-600">
                      {stop.description && <p>{stop.description}</p>}
                      {stop.tips && (
                        <div className="flex gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                          <span>💡</span>
                          <p className="text-amber-800 text-xs">{stop.tips}</p>
                        </div>
                      )}
                      {stop.dietary_note && (
                        <div className="flex gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                          <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                          <p className="text-red-700 text-xs">{stop.dietary_note}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <span className="text-4xl block mb-2">🗓️</span>
          <p>No itinerary days found</p>
        </div>
      )}
    </div>
  )
}
