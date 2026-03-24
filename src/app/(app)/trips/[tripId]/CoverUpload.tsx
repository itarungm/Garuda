'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ImagePlus, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CoverUpload({ tripId, hasCover }: { tripId: string; hasCover: boolean }) {
  const supabase = createClient()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)

    const ext = file.name.split('.').pop()
    const path = `covers/${tripId}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('trip-photos')
      .upload(path, file, { upsert: true, cacheControl: '3600' })

    if (uploadError) { toast.error(uploadError.message); setUploading(false); return }

    const { data: { publicUrl } } = supabase.storage.from('trip-photos').getPublicUrl(path)

    const { error: dbError } = await supabase
      .from('trips')
      .update({ cover_image_url: publicUrl })
      .eq('id', tripId)

    if (dbError) toast.error(dbError.message)
    else { toast.success('Cover photo updated!'); router.refresh() }

    setUploading(false)
    if (e.target) e.target.value = ''
  }

  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="mt-3 flex items-center gap-1.5 text-xs text-white/60 hover:text-white/90 transition-colors disabled:opacity-40"
      >
        {uploading
          ? <Loader2 size={12} className="animate-spin" />
          : <ImagePlus size={12} />
        }
        {uploading ? 'Uploading...' : hasCover ? 'Change cover photo' : 'Add cover photo'}
      </button>
    </>
  )
}
