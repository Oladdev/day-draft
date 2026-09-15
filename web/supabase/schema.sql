-- ==========================================================
-- DAY DRAFT DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- Run this in Supabase SQL Editor: https://app.supabase.com
-- ==========================================================

-- 1. USER PROFILES TABLE
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'User',
  email text not null,
  avatar_emoji text not null default '👨‍💻',
  settings jsonb not null default '{"dayStart": 360, "dayEnd": 1380, "targetFreeMin": 120, "endOfDayReviewAt": 1320, "onboardingComplete": true}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_profiles enable row level security;

create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = id);

-- 2. SCHEDULE ITEMS TABLE (Classes, Routines, Meetings, Reading, Events)
create table if not exists public.schedule_items (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  start_time text,
  duration integer not null default 60,
  date text,
  recurrence jsonb,
  preferred_start text,
  preferred_end text,
  location text,
  notes text,
  color text not null default 'emerald',
  version integer not null default 1,
  created_at bigint not null,
  updated_at bigint not null
);

alter table public.schedule_items enable row level security;

create policy "Users can view own schedule items"
  on public.schedule_items for select
  using (auth.uid() = user_id);

create policy "Users can insert own schedule items"
  on public.schedule_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update own schedule items"
  on public.schedule_items for update
  using (auth.uid() = user_id);

create policy "Users can delete own schedule items"
  on public.schedule_items for delete
  using (auth.uid() = user_id);

-- 3. TASKS TABLE
create table if not exists public.tasks (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  notes text,
  priority text not null default 'medium',
  estimate integer,
  status text not null default 'todo',
  column_id text not null default 'backlog',
  scheduled_date text,
  board_order integer not null default 0,
  tags text[],
  from_capture boolean default false,
  version integer not null default 1,
  created_at bigint not null,
  updated_at bigint not null
);

alter table public.tasks enable row level security;

create policy "Users can view own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- 4. RECURRENCE OVERRIDES TABLE
create table if not exists public.recurrence_overrides (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null references public.schedule_items(id) on delete cascade,
  date text not null,
  action text not null,
  new_start_time text,
  new_duration integer
);

alter table public.recurrence_overrides enable row level security;

create policy "Users can view own overrides"
  on public.recurrence_overrides for select
  using (auth.uid() = user_id);

create policy "Users can manage own overrides"
  on public.recurrence_overrides for all
  using (auth.uid() = user_id);

-- 5. REALTIME REPLICATION CONFIGURATION
-- Enable Supabase Realtime broadcast for multi-device sync
alter publication supabase_realtime add table public.schedule_items;
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.recurrence_overrides;
alter publication supabase_realtime add table public.user_profiles;
