import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppNav from '@/components/layout/AppNav'
import AppBottomNav from '@/components/layout/AppBottomNav'
import PushSubscriber from '@/components/PushSubscriber'
import RouteTracker from '@/components/RouteTracker'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-[#f8f7f4] flex flex-col">
      <AppNav user={user} profile={profile} />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pb-24 pt-4">
        {children}
      </main>
      <AppBottomNav />
      <PushSubscriber />
      <RouteTracker />
    </div>
  )
}
