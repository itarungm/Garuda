'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Home, Map, CheckSquare, Wallet, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AppBottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [pendingHref, setPendingHref] = useState<string | null>(null)
  const [barWidth, setBarWidth] = useState(0)
  const barTimer = useRef<ReturnType<typeof setTimeout>>()

  // Clear pending once the pathname actually changes (navigation settled)
  useEffect(() => {
    setPendingHref(null)
  }, [pathname])

  // Animate the top progress bar
  useEffect(() => {
    clearTimeout(barTimer.current)
    if (isPending) {
      setBarWidth(0)
      const t1 = setTimeout(() => setBarWidth(35), 40)
      const t2 = setTimeout(() => setBarWidth(65), 250)
      const t3 = setTimeout(() => setBarWidth(83), 700)
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
    } else if (barWidth > 0) {
      setBarWidth(100)
      barTimer.current = setTimeout(() => setBarWidth(0), 300)
    }
  }, [isPending])

  function navigate(href: string) {
    if (href === '#' || href === (pendingHref ?? pathname)) return
    setPendingHref(href)
    startTransition(() => router.push(href))
  }

  // Use the optimistic pending href for tripId so tabs update instantly
  const activePathForNav = pendingHref ?? pathname
  const tripMatch = activePathForNav.match(/^\/trips\/([^/]+)/)
  // Fallback to the real pathname's tripId if pending doesn't have one
  const realTripMatch = pathname.match(/^\/trips\/([^/]+)/)
  const tripId = tripMatch?.[1] ?? realTripMatch?.[1]

  const navItems = tripId
    ? [
        { href: '/dashboard', icon: Home, label: 'Home' },
        { href: `/trips/${tripId}/map`, icon: Map, label: 'Map' },
        { href: `/trips/${tripId}/todos`, icon: CheckSquare, label: 'Tasks' },
        { href: `/trips/${tripId}/expenses`, icon: Wallet, label: 'Expenses' },
        { href: `/trips/${tripId}/chat`, icon: MessageCircle, label: 'Chat' },
      ]
    : [
        { href: '/dashboard', icon: Home, label: 'Home' },
        { href: '#', icon: Map, label: 'Map' },
        { href: '#', icon: CheckSquare, label: 'Tasks' },
        { href: '#', icon: Wallet, label: 'Expenses' },
        { href: '#', icon: MessageCircle, label: 'Chat' },
      ]

  const isActive = (href: string) =>
    href !== '#' && (activePathForNav === href || activePathForNav.startsWith(href + '/'))

  return (
    <>
      {/* Top progress bar */}
      <div
        className="fixed top-0 left-0 z-50 h-0.5 bg-emerald-500 pointer-events-none"
        style={{
          width: `${barWidth}%`,
          transition: barWidth === 0 ? 'none' : barWidth === 100 ? 'width 150ms ease-in' : 'width 400ms ease-out',
          opacity: barWidth === 0 ? 0 : 1,
        }}
      />

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-40">
        <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-2">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = isActive(href)
            const disabled = href === '#'
            return (
              <button
                key={label}
                onClick={() => navigate(href)}
                disabled={disabled}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors',
                  active ? 'text-emerald-700' : disabled ? 'text-gray-200' : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <Icon size={22} />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
