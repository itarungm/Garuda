import Link from 'next/link'
import { MapPin, Users, CheckSquare, MessageCircle, Camera, Shield, Download, Star, Wallet, BookOpen } from 'lucide-react'

const features = [
  { icon: MapPin, title: 'Offline Maps', desc: 'Download maps for your destination. Navigate even without signal.' },
  { icon: Users, title: 'Group Collaboration', desc: 'Invite friends, share photos, chat, and plan together in real-time.' },
  { icon: CheckSquare, title: 'Smart To-Dos', desc: 'Drag-and-drop kanban board with subtasks, assignments, and reminders.' },
  { icon: BookOpen, title: 'Smart Itinerary', desc: 'Day-by-day planner with weather alerts, dietary notes, and tips.' },
  { icon: Wallet, title: 'Expense Splitter', desc: 'Track group spending, split bills, and settle up at trip end.' },
  { icon: MessageCircle, title: 'Group Chat', desc: 'Threaded conversations per day or location. Works offline too.' },
  { icon: Camera, title: 'Photo Wall', desc: 'Shared gallery organized by day and location. One-tap memory slideshow.' },
  { icon: Shield, title: 'Ticket Vault', desc: 'Store and view boarding passes, hotel bookings, temple tickets securely.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0d2b1d] text-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🦅</span>
          <span className="text-xl font-bold tracking-tight">Garuda</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-green-200 hover:text-white transition-colors">Sign in</Link>
          <Link href="/signup" className="text-sm bg-amber-500 hover:bg-amber-400 text-white px-4 py-2 rounded-full font-medium transition-colors">Get started</Link>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto text-center px-6 py-20 md:py-32">
        <div className="inline-flex items-center gap-2 bg-green-900/50 border border-green-700 rounded-full px-4 py-1.5 text-sm text-green-300 mb-8">
          <Star size={12} className="fill-current" />
          <span>Built for the Meghalaya-Assam expedition, 2026</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
          Your journey, <span className="text-amber-400">elevated.</span>
        </h1>
        <p className="text-lg md:text-xl text-green-200 max-w-2xl mx-auto mb-10">
          Garuda consolidates your itinerary, maps, expenses, group chat, and memories in one app. Works offline.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/signup" className="bg-amber-500 hover:bg-amber-400 text-white px-8 py-3.5 rounded-full font-semibold text-base transition-colors">
            Start your trip free
          </Link>
          <Link href="/login" className="border border-green-600 hover:bg-green-900/50 text-white px-8 py-3.5 rounded-full font-semibold text-base transition-colors">
            Sign in
          </Link>
        </div>
        <p className="mt-4 text-sm text-green-400 flex items-center justify-center gap-1.5">
          <Download size={14} /> Install as an app on your phone
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-green-900/30 border border-green-800 rounded-2xl p-6 hover:bg-green-900/50 transition-colors">
              <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center mb-4">
                <Icon size={20} className="text-amber-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-green-300 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-green-900 px-6 py-8 text-center text-sm text-green-600">
        <span>🦅 Garuda 2026 - Your journey, elevated</span>
      </footer>
    </div>
  )
}
