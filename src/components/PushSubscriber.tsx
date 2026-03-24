'use client'

import { useEffect, useState } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { toast } from 'sonner'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const output = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i)
  return output
}

export default function PushSubscriber() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

    const perm = Notification.permission
    setPermission(perm)

    if (perm === 'granted') {
      // Silently ensure subscription is saved on server
      ensureSubscriptionSaved()
    } else if (perm === 'default') {
      // Show banner after 3 s — not immediately
      const t = setTimeout(() => setShown(true), 3000)
      return () => clearTimeout(t)
    }
  }, [])

  async function ensureSubscriptionSaved() {
    try {
      const reg = await navigator.serviceWorker.getRegistration()
      if (!reg) return
      const sub = await reg.pushManager.getSubscription()
      if (!sub) return
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      })
    } catch { /* ignore */ }
  }

  async function subscribe() {
    try {
      const perm = await Notification.requestPermission()
      setPermission(perm)
      setShown(false)

      if (perm !== 'granted') {
        toast.error('Notifications blocked. Enable them in browser/Android settings.')
        return
      }

      const reg = await navigator.serviceWorker.getRegistration()
      if (!reg) {
        toast.error('Service worker not ready — try reloading the page.')
        return
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      })

      if (res.ok) toast.success('🔔 Notifications enabled!')
      else toast.error('Failed to save notification subscription')
    } catch {
      toast.error('Could not enable notifications')
    }
  }

  if (!shown || permission !== 'default') return null

  return (
    <div className="fixed bottom-24 left-4 right-4 z-40 max-w-md mx-auto">
      <div className="bg-[#1a4731] text-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl">
        <Bell size={20} className="shrink-0 text-green-300" />
        <p className="flex-1 text-sm leading-snug">
          Get notified when your group sends messages
        </p>
        <button
          onClick={subscribe}
          className="bg-white text-[#1a4731] text-xs font-semibold px-3 py-1.5 rounded-xl shrink-0"
        >
          Enable
        </button>
        <button onClick={() => setShown(false)} className="text-green-300 hover:text-white">
          <BellOff size={16} />
        </button>
      </div>
    </div>
  )
}
