-- =============================================
-- PUSH SUBSCRIPTIONS: Store Web Push subscriptions per device
-- =============================================
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  endpoint text not null,
  subscription jsonb not null,
  created_at timestamptz default now(),
  unique(endpoint)
);
alter table public.push_subscriptions enable row level security;

-- Users can manage their own subscriptions; server reads via service role key
create policy "Users can manage own push subscriptions" on public.push_subscriptions
  for all using (auth.uid() = user_id);

-- =============================================
-- PROFILES FIX: Allow all authenticated users to view any profile
-- Needed for: chat avatars/names, todo assignee names, expense member names
-- =============================================
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Authenticated users can view all profiles" on public.profiles
  for select to authenticated using (true);

-- =============================================
-- RLS FIX: Break circular dependency between trips <-> trip_members
-- Run this in the Supabase SQL Editor
-- =============================================

-- Drop the recursive policies on both tables
drop policy if exists "Trip members can view trips" on public.trips;
drop policy if exists "Members can view trip members" on public.trip_members;

-- Security definer function: queries trip_members WITHOUT triggering its RLS,
-- breaking the cycle. Runs as the DB owner, not the calling user.
create or replace function public.is_trip_member(p_trip_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.trip_members
    where trip_id = p_trip_id and user_id = auth.uid()
  );
$$;

-- trips SELECT: owner OR member (via security definer — no RLS cycle)
create policy "Trip members can view trips" on public.trips for select
  using (auth.uid() = owner_id or public.is_trip_member(id));

-- trip_members SELECT: any member of the trip can see all other members
-- Uses is_trip_member (security definer) to avoid RLS recursion
create policy "Members can view trip members" on public.trip_members for select
  using (public.is_trip_member(trip_id));

-- =============================================
-- AUTH LOOKUP: Lookup auth.users by email (used for invite reconciliation)
-- Call via .rpc('get_auth_user_id_by_email', { p_email: '...' })
-- =============================================
create or replace function public.get_auth_user_id_by_email(p_email text)
returns uuid
language sql
security definer
stable
set search_path = auth, public
as $$
  select id from auth.users where email = p_email limit 1;
$$;

-- =============================================
-- INVITE FIX: Allow invited user to accept their own invite
-- (Needed if not using admin/service-role client for the accept flow)
-- =============================================
drop policy if exists "Invited user can accept invite" on public.trip_invites;
create policy "Invited user can accept invite" on public.trip_invites for update
  using (auth.email() = email)
  with check (status = 'accepted');
