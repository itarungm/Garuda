'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, FileText, Upload, Loader2, X, Calendar, ExternalLink, Maximize2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

function getFileType(url: string) {
  const lower = url.toLowerCase().split('?')[0]
  if (/\.(jpg|jpeg|png|webp|gif|heic|avif)$/.test(lower)) return 'image'
  if (/\.pdf$/.test(lower)) return 'pdf'
  if (/\.(doc|docx|xls|xlsx|ppt|pptx)$/.test(lower)) return 'office'
  return 'other'
}

function FileViewer({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  const type = getFileType(url)
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`

  return (
    <div className="fixed inset-0 bg-black z-[70] flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-black/80 shrink-0">
        <p className="text-sm font-medium text-white truncate pr-4">{title}</p>
        <div className="flex items-center gap-3">
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
            <ExternalLink size={18} />
          </a>
          <button onClick={onClose} className="text-gray-300 hover:text-white"><X size={20} /></button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden bg-gray-900">
        {type === 'image' && (
          <img src={url} alt={title} className="w-full h-full object-contain" />
        )}
        {type === 'pdf' && (
          <iframe src={url} title={title} className="w-full h-full border-0" />
        )}
        {type === 'office' && (
          <iframe src={googleViewerUrl} title={title} className="w-full h-full border-0 bg-white" />
        )}
        {type === 'other' && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
            <FileText size={56} />
            <p className="text-sm">Preview not available</p>
            <a href={url} target="_blank" rel="noopener noreferrer"
              className="bg-white text-gray-900 text-sm font-medium px-5 py-2.5 rounded-xl flex items-center gap-2">
              <ExternalLink size={14} /> Open file
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

interface Ticket {
  id: string
  type: string | null
  title: string
  file_url: string | null
  travel_date: string | null
  metadata: any
  created_at: string
  user_id: string
}

const TICKET_TYPES = [
  { id: 'flight', label: '✈️ Flight', color: 'bg-sky-50 border-sky-200 text-sky-700' },
  { id: 'train', label: '🚂 Train', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { id: 'hotel', label: '🏨 Hotel', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { id: 'bus', label: '🚌 Bus', color: 'bg-cyan-50 border-cyan-200 text-cyan-700' },
  { id: 'temple', label: '🛕 Temple', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { id: 'adventure', label: '🧗 Adventure', color: 'bg-green-50 border-green-200 text-green-700' },
  { id: 'visa', label: '🛂 Visa / ID', color: 'bg-rose-50 border-rose-200 text-rose-700' },
  { id: 'insurance', label: '🛡️ Insurance', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { id: 'other', label: '📄 Other', color: 'bg-gray-50 border-gray-200 text-gray-700' },
]

const typeColors: Record<string, string> = Object.fromEntries(TICKET_TYPES.map(t => [t.id, t.color]))
const typeLabels: Record<string, string> = Object.fromEntries(TICKET_TYPES.map(t => [t.id, t.label]))

interface Props {
  tripId: string
  currentUserId: string
  initialTickets: Ticket[]
}

export default function TicketsClient({ tripId, currentUserId, initialTickets }: Props) {
  const supabase = createClient()
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'other', travel_date: '', notes: '' })
  const [file, setFile] = useState<File | null>(null)
  const [viewing, setViewing] = useState<Ticket | null>(null)
  const [viewingFile, setViewingFile] = useState<{ url: string; title: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('Title required'); return }
    setUploading(true)

    let file_url: string | null = null

    if (file) {
      const ext = file.name.split('.').pop()
      const path = `${tripId}/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('trip-tickets').upload(path, file)
      if (error) { toast.error(error.message); setUploading(false); return }
      const { data } = supabase.storage.from('trip-tickets').getPublicUrl(path)
      file_url = data.publicUrl
    }

    const { data: ticket, error } = await supabase.from('tickets').insert({
      trip_id: tripId,
      user_id: currentUserId,
      title: form.title,
      type: form.type,
      travel_date: form.travel_date || null,
      file_url,
      metadata: form.notes ? { notes: form.notes } : {},
    }).select().single()

    if (error) toast.error(error.message)
    else {
      setTickets(prev => [ticket as Ticket, ...prev])
      setShowForm(false)
      setForm({ title: '', type: 'other', travel_date: '', notes: '' })
      setFile(null)
      toast.success('Ticket saved')
    }
    setUploading(false)
  }

  async function deleteTicket(id: string) {
    await supabase.from('tickets').delete().eq('id', id)
    setTickets(prev => prev.filter(t => t.id !== id))
    if (viewing?.id === id) setViewing(null)
    toast.success('Deleted')
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full bg-amber-500 hover:bg-amber-400 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
      >
        <Plus size={16} /> Add ticket / document
      </button>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
          <h3 className="font-semibold text-gray-900">New ticket</h3>
          <input
            placeholder="Title (e.g. Vande Bharat Ticket)"
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            required
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.type}
              onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
            >
              {TICKET_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <input
              type="date"
              value={form.travel_date}
              onChange={e => setForm(p => ({ ...p, travel_date: e.target.value }))}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
            />
          </div>
          <textarea
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none"
          />
          <div>
            <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-2 border border-dashed border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-500 w-full hover:border-emerald-400 hover:text-emerald-600 transition-colors">
              <Upload size={15} />
              {file ? file.name : 'Attach file (PDF, image, Word, Excel…)'}
            </button>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm">Cancel</button>
            <button type="submit" disabled={uploading} className="flex-1 bg-emerald-600 text-white py-2 rounded-xl text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-1">
              {uploading && <Loader2 size={14} className="animate-spin" />} Save
            </button>
          </div>
        </form>
      )}

      {/* Tickets list */}
      {tickets.length === 0 && !showForm && (
        <div className="text-center py-16 text-gray-400">
          <FileText size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">No tickets yet</p>
          <p className="text-sm mt-1">Add boarding passes, hotel bookings, temple tickets</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tickets.map(ticket => (
          <div
            key={ticket.id}
            className={`border rounded-2xl p-4 cursor-pointer hover:shadow-sm transition-all ${typeColors[ticket.type || 'other']}`}
            onClick={() => setViewing(ticket)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium opacity-70">{typeLabels[ticket.type || 'other']}</p>
                <p className="font-semibold text-sm mt-0.5 truncate">{ticket.title}</p>
                {ticket.travel_date && (
                  <div className="flex items-center gap-1 text-xs opacity-70 mt-1">
                    <Calendar size={11} /> {formatDate(ticket.travel_date, 'dd MMM yyyy')}
                  </div>
                )}
              </div>
              {ticket.file_url && (
                <a
                  href={ticket.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="opacity-60 hover:opacity-100"
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Viewer modal */}
      {viewing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setViewing(null)}>
          <div className="bg-white rounded-2xl p-5 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-xs text-gray-500">{typeLabels[viewing.type || 'other']}</span>
                <h3 className="font-semibold text-gray-900">{viewing.title}</h3>
              </div>
              <button onClick={() => setViewing(null)}><X size={20} className="text-gray-400" /></button>
            </div>
            {viewing.travel_date && <p className="text-sm text-gray-600 mb-3">&#x1F4C5; {formatDate(viewing.travel_date, 'dd MMMM yyyy')}</p>}
            {viewing.metadata?.notes && <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 mb-3">{viewing.metadata.notes}</p>}
            {viewing.file_url && (() => {
              const type = getFileType(viewing.file_url)
              const isImage = type === 'image'
              return (
                <div
                  className="mb-3 rounded-xl overflow-hidden cursor-pointer relative group"
                  onClick={() => setViewingFile({ url: viewing.file_url!, title: viewing.title })}
                >
                  {isImage ? (
                    <>
                      <img src={viewing.file_url} alt={viewing.title} className="w-full max-h-48 object-cover bg-gray-50" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Maximize2 size={22} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl p-3">
                      <FileText size={28} className="text-gray-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-700 truncate">{viewing.file_url.split('/').pop()?.split('?')[0]}</p>
                        <p className="text-xs text-gray-400">
                          {type === 'pdf' ? 'PDF document' : type === 'office' ? 'Office document' : 'Attached file'} · tap to preview
                        </p>
                      </div>
                      <Maximize2 size={16} className="text-gray-400 shrink-0" />
                    </div>
                  )}
                </div>
              )
            })()}
            <div className="flex gap-2">
              {viewing.file_url && (
                <button
                  onClick={() => setViewingFile({ url: viewing.file_url!, title: viewing.title })}
                  className="flex-1 bg-emerald-600 text-white text-sm py-2.5 rounded-xl font-medium flex items-center justify-center gap-1"
                >
                  <Maximize2 size={14} /> Preview
                </button>
              )}
              {viewing.user_id === currentUserId && (
                <button onClick={() => deleteTicket(viewing.id)} className="px-4 py-2.5 text-sm text-red-600 border border-red-200 rounded-xl hover:bg-red-50">
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {viewingFile && (
        <FileViewer url={viewingFile.url} title={viewingFile.title} onClose={() => setViewingFile(null)} />
      )}
    </div>
  )
}
