'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Upload, Trash2, Loader2, X } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Photo {
  id: string
  url: string
  caption: string | null
  day_number: number | null
  created_at: string
  user_id: string
  profiles?: { full_name: string | null } | null
}

interface Props {
  tripId: string
  currentUserId: string
  initialPhotos: Photo[]
  tripDays: number
}

export default function GalleryClient({ tripId, currentUserId, initialPhotos, tripDays }: Props) {
  const supabase = createClient()
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [uploading, setUploading] = useState(false)
  const [selected, setSelected] = useState<Photo | null>(null)
  const [dayFilter, setDayFilter] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)

    // Try to get GPS location once for the whole batch
    const location = await new Promise<{ lat: number; lng: number } | null>(resolve => {
      if (!navigator.geolocation) return resolve(null)
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { timeout: 6000, maximumAge: 60000 }
      )
    })

    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `${tripId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage.from('trip-photos').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })

      if (uploadError) { toast.error(`Upload failed: ${uploadError.message}`); continue }

      const { data: { publicUrl } } = supabase.storage.from('trip-photos').getPublicUrl(path)

      const { data: photo, error: dbError } = await supabase.from('photos').insert({
        trip_id: tripId,
        user_id: currentUserId,
        url: publicUrl,
        lat: location?.lat ?? null,
        lng: location?.lng ?? null,
      }).select('*, profiles(full_name)').single()

      if (!dbError && photo) setPhotos(prev => [photo as any, ...prev])
    }

    setUploading(false)
    toast.success(`${files.length} photo${files.length > 1 ? 's' : ''} uploaded`)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function deletePhoto(photo: Photo) {
    await supabase.from('photos').delete().eq('id', photo.id)
    setPhotos(prev => prev.filter(p => p.id !== photo.id))
    if (selected?.id === photo.id) setSelected(null)
    toast.success('Photo deleted')
  }

  const filtered = dayFilter !== null ? photos.filter(p => p.day_number === dayFilter) : photos

  return (
    <div className="space-y-4">
      {/* Upload */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {uploading ? 'Uploading...' : 'Upload photos'}
        </button>
        <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />

        {/* Day filter */}
        <div className="flex gap-1 overflow-x-auto">
          <button
            onClick={() => setDayFilter(null)}
            className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${dayFilter === null ? 'bg-[#1a4731] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
          >
            All
          </button>
          {Array.from({ length: tripDays }, (_, i) => i + 1).map(d => (
            <button
              key={d}
              onClick={() => setDayFilter(dayFilter === d ? null : d)}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${dayFilter === d ? 'bg-[#1a4731] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
            >
              Day {d}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <span className="text-5xl block mb-3">📸</span>
          <p className="font-medium">No photos yet</p>
          <p className="text-sm mt-1">Upload some memories</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
          {filtered.map(photo => (
            <button
              key={photo.id}
              onClick={() => setSelected(photo)}
              className="aspect-square overflow-hidden rounded-xl"
            >
              <img src={photo.url} alt={photo.caption || ''} className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selected && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="relative max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <img src={selected.url} alt={selected.caption || ''} className="w-full rounded-2xl max-h-[70vh] object-contain" />
            <div className="bg-white rounded-2xl p-4 mt-2">
              <div className="flex items-start justify-between">
                <div>
                  {selected.profiles?.full_name && (
                    <p className="text-sm font-medium text-gray-900">{selected.profiles.full_name}</p>
                  )}
                  <p className="text-xs text-gray-500">{formatDate(selected.created_at)}</p>
                  {selected.caption && <p className="text-sm text-gray-700 mt-1">{selected.caption}</p>}
                </div>
                <div className="flex gap-2">
                  {selected.user_id === currentUserId && (
                    <button onClick={() => deletePhoto(selected)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={18} />
                    </button>
                  )}
                  <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                    <X size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
