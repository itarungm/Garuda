'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const STORAGE_KEY = 'garuda_last_route'
// Pages we never want to restore to (they are entry points, not deep states)
const SKIP_RESTORE = ['/', '/login', '/dashboard', '/invite']

export default function RouteTracker() {
  const pathname = usePathname()
  const router = useRouter()
  const blockerRef = useRef<HTMLDivElement | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // === Save last route whenever pathname changes ===
  useEffect(() => {
    if (!pathname) return
    const skip = SKIP_RESTORE.some(p => pathname === p || pathname.startsWith('/invite'))
    if (!skip) {
      localStorage.setItem(STORAGE_KEY, pathname)
    }
  }, [pathname])

  // === On cold PWA launch: if we land on /dashboard, redirect to last deep route ===
  useEffect(() => {
    if (pathname !== '/dashboard') return
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && saved !== '/dashboard') {
      router.replace(saved)
    }
  // Only run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // === Phantom-tap blocker: when app comes back from background ===
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState !== 'visible') return

      // Restore route if user was sent to dashboard by OS
      const saved = localStorage.getItem(STORAGE_KEY)
      if (pathname === '/dashboard' && saved && saved !== '/dashboard') {
        router.replace(saved)
        return
      }

      // Show a transparent full-screen overlay for 400ms to absorb the resume tap
      if (!blockerRef.current) {
        const el = document.createElement('div')
        el.style.cssText =
          'position:fixed;inset:0;z-index:9999;background:transparent;touch-action:none;pointer-events:all;'
        document.body.appendChild(el)
        blockerRef.current = el
      }

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        if (blockerRef.current) {
          document.body.removeChild(blockerRef.current)
          blockerRef.current = null
        }
      }, 400)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (timerRef.current) clearTimeout(timerRef.current)
      if (blockerRef.current) {
        document.body.removeChild(blockerRef.current)
        blockerRef.current = null
      }
    }
  }, [pathname, router])

  return null
}
