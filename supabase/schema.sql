-- =============================================
-- GARUDA TRIP COMPANION APP - DATABASE SCHEMA
-- Run this in the Supabase SQL Editor
-- =============================================

-- PROFILES (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  onboarded boolean default false,
  updated_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- TRIPS
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  destination text,
  description text,
  start_date date,
  end_date date,
  owner_id uuid references auth.users(id) on delete cascade not null,
  cover_image_url text,
  status text default 'planning' check (status in ('planning', 'active', 'completed')),
  created_at timestamptz default now()
);
alter table public.trips enable row level security;

-- TRIP MEMBERS
create table if not exists public.trip_members (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text default 'viewer' check (role in ('owner', 'co-planner', 'viewer')),
  joined_at timestamptz default now(),
  unique(trip_id, user_id)
);
alter table public.trip_members enable row level security;

-- TRIP INVITES
create table if not exists public.trip_invites (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade not null,
  email text not null,
  invited_by uuid references auth.users(id) not null,
  token text unique default gen_random_uuid()::text,
  status text default 'pending' check (status in ('pending', 'accepted', 'expired')),
  created_at timestamptz default now()
);
alter table public.trip_invites enable row level security;

-- ITINERARY DAYS
create table if not exists public.itinerary_days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade not null,
  day_number int not null,
  date date,
  theme text,
  created_at timestamptz default now()
);
alter table public.itinerary_days enable row level security;

-- ITINERARY STOPS
create table if not exists public.itinerary_stops (
  id uuid primary key default gen_random_uuid(),
  day_id uuid references public.itinerary_days(id) on delete cascade not null,
  trip_id uuid references public.trips(id) on delete cascade not null,
  name text not null,
  time_label text,
  lat double precision,
  lng double precision,
  description text,
  tips text,
  entry_fee text,
  category text,
  dietary_note text,
  order_index int default 0,
  created_at timestamptz default now()
);
alter table public.itinerary_stops enable row level security;

-- ACTIVITIES (per user, per stop)
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade not null,
  stop_id uuid references public.itinerary_stops(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade not null,
  status text default 'planned' check (status in ('planned', 'done', 'skipped')),
  rating int check (rating >= 1 and rating <= 5),
  note text,
  photo_url text,
  updated_at timestamptz default now()
);
alter table public.activities enable row level security;

-- EXPENSES
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade not null,
  paid_by uuid references auth.users(id) not null,
  amount numeric(10,2) not null,
  category text check (category in ('transport','food','accommodation','adventure','spiritual','shopping','other')),
  description text,
  split_with uuid[] default '{}',
  created_at timestamptz default now()
);
alter table public.expenses enable row level security;

-- TODOS
create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade not null,
  title text not null,
  assigned_to uuid references auth.users(id),
  status text default 'todo' check (status in ('todo', 'in_progress', 'done')),
  order_index float default 0,
  parent_id uuid references public.todos(id) on delete cascade,
  created_at timestamptz default now()
);
alter table public.todos enable row level security;

-- TICKETS
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  type text check (type in ('flight','train','hotel','temple','adventure','other')),
  title text not null,
  file_url text,
  metadata jsonb default '{}',
  travel_date date,
  created_at timestamptz default now()
);
alter table public.tickets enable row level security;

-- PHOTOS
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  url text not null,
  thumbnail_url text,
  lat double precision,
  lng double precision,
  day_number int,
  caption text,
  created_at timestamptz default now()
);
alter table public.photos enable row level security;

-- MESSAGES
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  thread_id text default 'general',
  content text,
  type text default 'text' check (type in ('text', 'photo', 'file', 'system')),
  file_url text,
  created_at timestamptz default now()
);
alter table public.messages enable row level security;

-- CONTACTS
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade not null,
  name text not null,
  phone text,
  role text,
  notes text,
  is_emergency boolean default false,
  created_at timestamptz default now()
);
alter table public.contacts enable row level security;

-- =============================================
-- RLS POLICIES (all tables exist at this point)
-- =============================================

-- TRIPS policies
create policy "Trip members can view trips" on public.trips for select
  using (auth.uid() = owner_id or exists (
    select 1 from public.trip_members where trip_id = trips.id and user_id = auth.uid()
  ));
create policy "Owners can insert trips" on public.trips for insert with check (auth.uid() = owner_id);
create policy "Owners can update trips" on public.trips for update using (auth.uid() = owner_id);
create policy "Owners can delete trips" on public.trips for delete using (auth.uid() = owner_id);

-- TRIP MEMBERS policies
create policy "Members can view trip members" on public.trip_members for select
  using (
    auth.uid() = user_id
    or exists (select 1 from public.trips where id = trip_members.trip_id and owner_id = auth.uid())
  );
create policy "Owners can manage members" on public.trip_members for all
  using (exists (select 1 from public.trips where id = trip_id and owner_id = auth.uid()));
create policy "Users can insert own membership" on public.trip_members for insert with check (auth.uid() = user_id);

-- TRIP INVITES policies
create policy "Trip owners/co-planners can manage invites" on public.trip_invites for all
  using (exists (
    select 1 from public.trip_members where trip_id = trip_invites.trip_id and user_id = auth.uid() and role in ('owner','co-planner')
  ));
create policy "Anyone can view invite by token" on public.trip_invites for select using (true);

-- ITINERARY DAYS policies
create policy "Trip members can view itinerary days" on public.itinerary_days for select
  using (exists (select 1 from public.trip_members where trip_id = itinerary_days.trip_id and user_id = auth.uid())
    or exists (select 1 from public.trips where id = itinerary_days.trip_id and owner_id = auth.uid()));
create policy "Planners can manage itinerary days" on public.itinerary_days for all
  using (exists (
    select 1 from public.trip_members where trip_id = itinerary_days.trip_id and user_id = auth.uid() and role in ('owner','co-planner')
  ) or exists (select 1 from public.trips where id = itinerary_days.trip_id and owner_id = auth.uid()));

-- ITINERARY STOPS policies
create policy "Trip members can view stops" on public.itinerary_stops for select
  using (exists (select 1 from public.trip_members where trip_id = itinerary_stops.trip_id and user_id = auth.uid())
    or exists (select 1 from public.trips where id = itinerary_stops.trip_id and owner_id = auth.uid()));
create policy "Planners can manage stops" on public.itinerary_stops for all
  using (exists (
    select 1 from public.trip_members where trip_id = itinerary_stops.trip_id and user_id = auth.uid() and role in ('owner','co-planner')
  ) or exists (select 1 from public.trips where id = itinerary_stops.trip_id and owner_id = auth.uid()));

-- ACTIVITIES policies
create policy "Members can view activities" on public.activities for select
  using (exists (select 1 from public.trip_members where trip_id = activities.trip_id and user_id = auth.uid())
    or exists (select 1 from public.trips where id = activities.trip_id and owner_id = auth.uid()));
create policy "Users can manage own activities" on public.activities for all using (auth.uid() = user_id);

-- EXPENSES policies
create policy "Members can view expenses" on public.expenses for select
  using (exists (select 1 from public.trip_members where trip_id = expenses.trip_id and user_id = auth.uid())
    or exists (select 1 from public.trips where id = expenses.trip_id and owner_id = auth.uid()));
create policy "Members can insert expenses" on public.expenses for insert
  with check (exists (select 1 from public.trip_members where trip_id = expenses.trip_id and user_id = auth.uid())
    or exists (select 1 from public.trips where id = expenses.trip_id and owner_id = auth.uid()));
create policy "Payer can update/delete own expense" on public.expenses for update using (auth.uid() = paid_by);
create policy "Payer can delete own expense" on public.expenses for delete using (auth.uid() = paid_by);

-- TODOS policies
create policy "Members can view todos" on public.todos for select
  using (exists (select 1 from public.trip_members where trip_id = todos.trip_id and user_id = auth.uid())
    or exists (select 1 from public.trips where id = todos.trip_id and owner_id = auth.uid()));
create policy "Members can manage todos" on public.todos for all
  using (exists (select 1 from public.trip_members where trip_id = todos.trip_id and user_id = auth.uid())
    or exists (select 1 from public.trips where id = todos.trip_id and owner_id = auth.uid()));

-- TICKETS policies
create policy "Members can view tickets" on public.tickets for select
  using (exists (select 1 from public.trip_members where trip_id = tickets.trip_id and user_id = auth.uid())
    or exists (select 1 from public.trips where id = tickets.trip_id and owner_id = auth.uid()));
create policy "Members can manage own tickets" on public.tickets for all using (auth.uid() = user_id);

-- PHOTOS policies
create policy "Members can view photos" on public.photos for select
  using (exists (select 1 from public.trip_members where trip_id = photos.trip_id and user_id = auth.uid())
    or exists (select 1 from public.trips where id = photos.trip_id and owner_id = auth.uid()));
create policy "Members can upload photos" on public.photos for insert
  with check (exists (select 1 from public.trip_members where trip_id = photos.trip_id and user_id = auth.uid())
    or exists (select 1 from public.trips where id = photos.trip_id and owner_id = auth.uid()));
create policy "Owners can delete own photos" on public.photos for delete using (auth.uid() = user_id);

-- MESSAGES policies
create policy "Members can view messages" on public.messages for select
  using (exists (select 1 from public.trip_members where trip_id = messages.trip_id and user_id = auth.uid())
    or exists (select 1 from public.trips where id = messages.trip_id and owner_id = auth.uid()));
create policy "Members can send messages" on public.messages for insert
  with check (exists (select 1 from public.trip_members where trip_id = messages.trip_id and user_id = auth.uid())
    or exists (select 1 from public.trips where id = messages.trip_id and owner_id = auth.uid()));

-- CONTACTS policies
create policy "Members can view contacts" on public.contacts for select
  using (exists (select 1 from public.trip_members where trip_id = contacts.trip_id and user_id = auth.uid())
    or exists (select 1 from public.trips where id = contacts.trip_id and owner_id = auth.uid()));
create policy "Planners can manage contacts" on public.contacts for all
  using (exists (
    select 1 from public.trip_members where trip_id = contacts.trip_id and user_id = auth.uid() and role in ('owner','co-planner')
  ) or exists (select 1 from public.trips where id = contacts.trip_id and owner_id = auth.uid()));

-- Enable realtime for chat and activities
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.activities;
alter publication supabase_realtime add table public.todos;

-- Storage buckets (run these via Supabase dashboard or CLI)
-- insert into storage.buckets (id, name, public) values ('trip-photos', 'trip-photos', true);
-- insert into storage.buckets (id, name, public) values ('trip-tickets', 'trip-tickets', false);
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
