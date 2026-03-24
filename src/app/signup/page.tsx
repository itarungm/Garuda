import { redirect } from 'next/navigation'

// No separate signup page - Google OAuth handles both new and existing users
export default function SignupPage({ searchParams }: { searchParams: { invite?: string } }) {
  const invite = searchParams.invite
  redirect(invite ? `/login?invite=${invite}` : '/login')
}
