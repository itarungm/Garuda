'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Map, Users, CheckSquare, MessageCircle, Wallet, Camera, Shield, BookOpen, ChevronRight, ChevronLeft } from 'lucide-react'

const slides = [
  {
    icon: '🦅',
    title: 'Welcome to Garuda',
    desc: 'Your ultimate trip companion. Everything your group needs — in one app, works offline.',
    color: 'from-[#0d2b1d] to-[#1a4731]',
  },
  {
    icon: <BookOpen size={48} className="text-blue-400" />,
    title: 'Smart Itinerary',
    desc: 'Day-by-day timeline with stops, tips, entry fees, dietary notes, and weather advisories.',
    color: 'from-blue-900 to-blue-700',
  },
  {
    icon: <Map size={48} className="text-emerald-400" />,
    title: 'Offline Maps',
    desc: 'Download your destination map. Navigate and find all trip stops even without signal.',
    color: 'from-emerald-900 to-emerald-700',
  },
  {
    icon: <CheckSquare size={48} className="text-purple-400" />,
    title: 'To-Do Board',
    desc: 'Drag-and-drop Kanban board for packing, bookings, and prep tasks. With subtasks.',
    color: 'from-purple-900 to-purple-700',
  },
  {
    icon: <Wallet size={48} className="text-amber-400" />,
    title: 'Expense Splitter',
    desc: 'Log expenses, split bills among the group, and see who owes whom at a glance.',
    color: 'from-amber-900 to-amber-700',
  },
  {
    icon: <MessageCircle size={48} className="text-teal-400" />,
    title: 'Group Chat',
    desc: 'Real-time messaging with your travel group. Threaded by day or topic.',
    color: 'from-teal-900 to-teal-700',
  },
  {
    icon: <Camera size={48} className="text-pink-400" />,
    title: 'Photo Wall + Tickets',
    desc: 'Shared photo gallery organized by day, plus a vault for all your tickets and documents.',
    color: 'from-pink-900 to-pink-700',
  },
  {
    icon: <Users size={48} className="text-orange-400" />,
    title: 'Invite Your Group',
    desc: 'Send invite links by email. Everyone gets access to the same trip in real-time.',
    color: 'from-orange-900 to-orange-700',
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)

  const slide = slides[current]
  const isLast = current === slides.length - 1

  async function finish() {
    router.push('/dashboard')
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${slide.color} text-white flex flex-col items-center justify-between p-8 transition-all duration-500`}>
      {/* Skip */}
      <div className="w-full flex justify-end">
        <button onClick={finish} className="text-white/60 hover:text-white text-sm">Skip</button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm">
        <div className="mb-8 flex items-center justify-center h-24">
          {typeof slide.icon === 'string'
            ? <span className="text-7xl">{slide.icon}</span>
            : slide.icon
          }
        </div>
        <h1 className="text-2xl font-bold mb-4">{slide.title}</h1>
        <p className="text-white/80 text-base leading-relaxed">{slide.desc}</p>
      </div>

      {/* Navigation */}
      <div className="w-full space-y-4">
        {/* Dots */}
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-white w-6' : 'bg-white/30'}`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          {current > 0 && (
            <button
              onClick={() => setCurrent(c => c - 1)}
              className="flex-none border border-white/30 text-white px-4 py-3 rounded-xl flex items-center gap-1"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <button
            onClick={isLast ? finish : () => setCurrent(c => c + 1)}
            className="flex-1 bg-white text-gray-900 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
          >
            {isLast ? '🚀 Start exploring' : <>Next <ChevronRight size={18} /></>}
          </button>
        </div>
      </div>
    </div>
  )
}
