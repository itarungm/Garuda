import { createClient, createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate, tripCountdown } from '@/lib/utils'
import { MapPin, Calendar, Users, BookOpen, Map, CheckSquare, Wallet, MessageCircle, Camera, Shield, Phone } from 'lucide-react'
import CoverUpload from './CoverUpload'

export default async function TripPage({ params }: { params: { tripId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: trip } = await supabase
    .from('trips')
    .select('*')
    .eq('id', params.tripId)
    .single()

  if (!trip) notFound()

  const admin = createAdminClient()
  const { data: memberRows } = await admin
    .from('trip_members')
    .select('id, user_id, role, joined_at')
    .eq('trip_id', params.tripId) as { data: { id: string; user_id: string; role: string; joined_at: string }[] | null }

  // Fetch profiles separately to avoid PostgREST join issues (no direct FK trip_members->profiles)
  const userIds = (memberRows || []).map(m => m.user_id)
  const { data: profileRows } = (userIds.length
    ? await admin.from('profiles').select('id, full_name, avatar_url').in('id', userIds)
    : { data: [] }) as { data: { id: string; full_name: string | null; avatar_url: string | null }[] | null }
  const profileMap: Record<string, { id: string; full_name: string | null; avatar_url: string | null }> =
    Object.fromEntries((profileRows || []).map(p => [p.id, p]))
  const members = (memberRows || []).map(m => ({ ...m, profiles: profileMap[m.user_id] || null }))

  const { data: days } = await supabase
    .from('itinerary_days')
    .select('id, day_number, date, theme, itinerary_stops(count)')
    .eq('trip_id', params.tripId)
    .order('day_number')

  const countdown = trip.start_date ? tripCountdown(trip.start_date) : null

  const quickLinks = [
    { href: `/trips/${trip.id}/itinerary`, icon: BookOpen, label: 'Itinerary', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { href: `/trips/${trip.id}/map`, icon: Map, label: 'Map', color: 'bg-green-50 text-green-700 border-green-200' },
    { href: `/trips/${trip.id}/todos`, icon: CheckSquare, label: 'To-Dos', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { href: `/trips/${trip.id}/expenses`, icon: Wallet, label: 'Expenses', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { href: `/trips/${trip.id}/chat`, icon: MessageCircle, label: 'Chat', color: 'bg-teal-50 text-teal-700 border-teal-200' },
    { href: `/trips/${trip.id}/gallery`, icon: Camera, label: 'Gallery', color: 'bg-pink-50 text-pink-700 border-pink-200' },
    { href: `/trips/${trip.id}/tickets`, icon: Shield, label: 'Tickets', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { href: `/trips/${trip.id}/contacts`, icon: Phone, label: 'Contacts', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  ]

  return (
    <div className="space-y-5">
      {/* Header with cover image */}
      <div className="relative bg-[#1a4731] rounded-2xl overflow-hidden text-white">
        {/* Cover image low opacity background */}
        {trip.cover_image_url && (
          <img
            src={trip.cover_image_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
          />
        )}
        <div className="relative p-5">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold">{trip.name}</h1>
              {trip.destination && (
                <div className="flex items-center gap-1 text-green-300 text-sm mt-1">
                  <MapPin size={13} /> {trip.destination}
                </div>
              )}
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
              trip.status === 'active' ? 'bg-green-400 text-green-900' :
              trip.status === 'completed' ? 'bg-gray-300 text-gray-700' :
              'bg-amber-400 text-amber-900'
            }`}>
              {trip.status === 'active' ? 'Active' : trip.status === 'completed' ? 'Done' : 'Planning'}
            </span>
          </div>

          {trip.start_date && (
            <div className="flex items-center gap-1 text-green-300 text-sm mt-2">
              <Calendar size={13} />
              <span>{formatDate(trip.start_date, 'dd MMM')} – {trip.end_date ? formatDate(trip.end_date, 'dd MMM yyyy') : 'TBD'}</span>
            </div>
          )}

          {countdown !== null && countdown > 0 && (
            <div className="mt-3 bg-white/10 rounded-xl px-4 py-2 inline-block">
              <span className="text-2xl font-bold">{countdown}</span>
              <span className="text-green-300 text-sm ml-1">days to go</span>
            </div>
          )}
          {countdown !== null && countdown <= 0 && countdown > -30 && (
            <div className="mt-3 bg-amber-400/20 rounded-xl px-4 py-2 inline-block">
              <span className="text-amber-300 font-semibold text-sm">&#x1F6EB; Trip is underway!</span>
            </div>
          )}

          {/* Cover image upload button */}
          <CoverUpload tripId={trip.id} hasCover={!!trip.cover_image_url} />
        </div>
      </div>

      {/* Quick actions grid */}
      <div className="grid grid-cols-4 gap-2">
        {quickLinks.map(({ href, icon: Icon, label, color }) => (
          <Link
            key={href}
            href={href}
            className={`border rounded-2xl p-3 flex flex-col items-center gap-2 hover:shadow-sm transition-all ${color}`}
          >
            <Icon size={20} />
            <span className="text-xs font-medium text-center leading-tight">{label}</span>
          </Link>
        ))}
      </div>

      {/* Members */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Users size={16} /> Group
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
              {(members || []).length}
            </span>
          </h2>
          <Link href={`/trips/${trip.id}/members`} className="text-xs text-emerald-600 font-medium">Manage</Link>
        </div>
        <div className="flex -space-x-2">
          {(members || []).slice(0, 8).map(m => {
            const p = m.profiles as any
            const name = p?.full_name || 'User'
            return (
              <div
                key={m.id}
                title={name}
                className="w-9 h-9 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
              >
                {p?.avatar_url ? (
                  <img src={p.avatar_url} alt={name} className="w-full h-full rounded-full object-cover" />
                ) : name.slice(0, 2).toUpperCase()}
              </div>
            )
          })}
          {(members || []).length === 0 && (
            <p className="text-sm text-gray-500">No members yet</p>
          )}
        </div>
      </div>

      {/* Itinerary preview */}
      {days && days.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Itinerary</h2>
            <Link href={`/trips/${trip.id}/itinerary`} className="text-xs text-emerald-600 font-medium">View all</Link>
          </div>
          <div className="space-y-2">
            {days.slice(0, 4).map(day => (
              <Link
                key={day.id}
                href={`/trips/${trip.id}/itinerary?day=${day.day_number}`}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
                  D{day.day_number}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{day.theme || `Day ${day.day_number}`}</p>
                  {day.date && <p className="text-xs text-gray-500">{formatDate(day.date, 'EEE, dd MMM')}</p>}
                </div>
                <span className="text-xs text-gray-400">{(day.itinerary_stops as any)?.[0]?.count || 0} stops</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
