'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Loader2, Smile } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { format, parseISO } from 'date-fns'

const EMOJI_LIST = [
  '😀','😂','😍','🥰','🤩','😎','🥳','😊','😅','🤣','😭','😘','😏','🙄','😤',
  '👍','👎','❤️','🔥','✨','💯','🎉','🙏','💪','👏','🤝','🫶','💬','📸','🎒',
  '✈️','🚂','🏔️','🌊','🌿','⛺','🗺️','🌙','🌄','🛕','🧗','🍜','🍲','☕','🥘',
  '😆','🤔','😴','🫡','🥹','🫠','😵','🤯','🥶','🥵','😱','🤗','🫶','✅','🚀',
]

interface Message {
  id: string
  user_id: string
  content: string | null
  type: string
  created_at: string
  thread_id: string
  profiles?: { full_name: string | null; avatar_url: string | null }
}

interface Props {
  tripId: string
  currentUserId: string
  senderName: string
  senderAvatar?: string | null
  initialMessages: Message[]
  initialProfilesMap: Record<string, { full_name: string | null; avatar_url: string | null }>
  thread?: string
}

export default function ChatClient({ tripId, currentUserId, senderName, senderAvatar, initialMessages, initialProfilesMap, thread = 'general' }: Props) {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  // Profile cache seeded from server-rendered data — avoids async fetch on every realtime message
  const profileCache = useRef<Record<string, { full_name: string | null; avatar_url: string | null }>>(
    // Seed with server data AND current user's own profile so their name always appears
    { ...initialProfilesMap, [currentUserId]: { full_name: senderName, avatar_url: senderAvatar ?? null } }
  )
  // Track optimistically-added message IDs to avoid duplicates from realtime
  const optimisticIds = useRef<Set<string>>(new Set())

  function insertEmoji(emoji: string) {
    const el = inputRef.current
    const start = el?.selectionStart ?? input.length
    const end = el?.selectionEnd ?? input.length
    const next = input.slice(0, start) + emoji + input.slice(end)
    setInput(next)
    setShowEmoji(false)
    setTimeout(() => {
      el?.focus()
      el?.setSelectionRange(start + emoji.length, start + emoji.length)
    }, 0)
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const channel = supabase
      .channel(`chat:${tripId}:${thread}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `trip_id=eq.${tripId}`,
      }, async (payload) => {
        const uid = payload.new.user_id as string
        const msgId = payload.new.id as string
        // Skip if we already added this message optimistically
        if (optimisticIds.current.has(msgId)) {
          optimisticIds.current.delete(msgId)
          return
        }
        // Check in-memory cache first — instant, no network round-trip
        let profile = profileCache.current[uid]
        if (!profile) {
          // Fetch via API route (uses admin client, bypasses RLS)
          const res = await fetch(`/api/profiles?ids=${uid}`)
          const rows: { id: string; full_name: string | null; avatar_url: string | null }[] = await res.json()
          profile = rows[0] || { full_name: null, avatar_url: null }
          profileCache.current[uid] = profile
        }
        setMessages(prev => [...prev, { ...payload.new as Message, profiles: profile }])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [tripId, thread])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || sending) return
    setSending(true)
    const text = input.trim()
    setInput('')

    // Generate client-side UUID so we can dedup the realtime echo
    const msgId = crypto.randomUUID()
    optimisticIds.current.add(msgId)

    // Optimistic update — show own message instantly before DB confirms
    const optimisticMsg: Message = {
      id: msgId,
      user_id: currentUserId,
      content: text,
      type: 'text',
      created_at: new Date().toISOString(),
      thread_id: thread,
      profiles: profileCache.current[currentUserId],
    }
    setMessages(prev => [...prev, optimisticMsg])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('messages').insert({
      id: msgId,
      trip_id: tripId,
      user_id: currentUserId,
      content: text,
      thread_id: thread,
      type: 'text',
    })
    setSending(false)

    // Fire-and-forget push to other trip members
    fetch('/api/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tripId,
        title: `💬 ${senderName}`,
        body: text.length > 80 ? text.slice(0, 80) + '…' : text,
        url: `/trips/${tripId}/chat`,
      }),
    }).catch(() => { /* ignore push errors */ })
  }

  const grouped = messages.reduce<{ date: string; msgs: Message[] }[]>((acc, msg) => {
    const d = format(parseISO(msg.created_at), 'dd MMM yyyy')
    const last = acc[acc.length - 1]
    if (last?.date === d) last.msgs.push(msg)
    else acc.push({ date: d, msgs: [msg] })
    return acc
  }, [])

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-2">
        {messages.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <span className="text-4xl block mb-2">💬</span>
            <p className="text-sm">No messages yet. Say hello!</p>
          </div>
        )}

        {grouped.map(group => (
          <div key={group.date}>
            <div className="text-center mb-3">
              <span className="text-xs bg-gray-200 text-gray-500 px-3 py-1 rounded-full">{group.date}</span>
            </div>

            {group.msgs.map((msg, i) => {
              const isMine = msg.user_id === currentUserId
              const name = msg.profiles?.full_name || 'User'
              const initials = getInitials(name)
              const showAvatar = !isMine && (i === 0 || group.msgs[i-1].user_id !== msg.user_id)

              return (
                <div key={msg.id} className={cn('flex items-end gap-2 mb-1', isMine && 'flex-row-reverse')}>
                  {!isMine && (
                    <div className={cn('w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0', !showAvatar && 'opacity-0')}>
                      {msg.profiles?.avatar_url
                        ? <img src={msg.profiles.avatar_url} className="w-full h-full rounded-full object-cover" alt={name} />
                        : initials
                      }
                    </div>
                  )}
                  <div className={cn('max-w-[75%]', isMine && 'items-end')}>
                    {!isMine && showAvatar && (
                      <p className="text-xs text-gray-500 mb-1 ml-1">{name}</p>
                    )}
                    <div className={cn(
                      'px-3.5 py-2 rounded-2xl text-sm',
                      isMine
                        ? 'bg-[#1a4731] text-white rounded-br-sm'
                        : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
                    )}>
                      {msg.content}
                    </div>
                    <p className={cn('text-[10px] text-gray-400 mt-0.5', isMine ? 'text-right' : 'text-left ml-1')}>
                      {format(parseISO(msg.created_at), 'HH:mm')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex gap-2 pt-3 border-t border-gray-200 bg-[#f8f7f4]">
        <div className="relative flex-1 flex gap-2">
          <button
            type="button"
            onClick={() => setShowEmoji(p => !p)}
            className="text-gray-400 hover:text-amber-500 transition-colors flex-shrink-0 self-center"
          >
            <Smile size={20} />
          </button>

          {showEmoji && (
            <div className="absolute bottom-12 left-0 bg-white border border-gray-200 rounded-2xl shadow-lg p-3 w-72 z-10">
              <div className="grid grid-cols-10 gap-1">
                {EMOJI_LIST.map(e => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => insertEmoji(e)}
                    className="text-xl leading-none hover:bg-gray-100 rounded-lg p-1 transition-colors"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}

          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="w-10 h-10 bg-[#1a4731] hover:bg-[#15392a] disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-colors"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </form>
    </div>
  )
}
