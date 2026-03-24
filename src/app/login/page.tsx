'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

function LoginForm() {
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get('invite')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleGoogle() {
    setLoading(true)
    const redirectTo = inviteToken
      ? `${window.location.origin}/auth/callback?invite=${inviteToken}`
      : `${window.location.origin}/auth/callback`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
    if (error) { toast.error(error.message); setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#0d2b1d] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-4xl">&#x1F985;</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Garuda</h1>
          <p className="text-sm text-green-300 mt-2">
            {inviteToken ? 'Sign in to accept your trip invite' : 'Your trip companion'}
          </p>
        </div>

        <div className="bg-white/5 border border-green-800 rounded-2xl p-6 space-y-3">
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 disabled:opacity-60 text-gray-800 py-3 rounded-xl text-sm font-semibold transition-colors border border-gray-200"
          >
            {loading
              ? <Loader2 size={18} className="animate-spin text-gray-500" />
              : (
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
              )
            }
            {loading ? 'Redirecting...' : 'Continue with Google'}
          </button>

          <p className="text-center text-xs text-green-600 pt-1">
            New or existing &mdash; Google handles it all
          </p>
        </div>

        <p className="text-center text-xs text-green-700 mt-6">
          By continuing you agree to our terms of service
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d2b1d]" />}>
      <LoginForm />
    </Suspense>
  )
}
