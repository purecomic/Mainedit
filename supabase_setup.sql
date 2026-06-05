-- =============================================
-- MAIN EDIT — Supabase Database Setup
-- Run this in your Supabase SQL Editor
-- =============================================

-- PROFILES table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  balance numeric default 0,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Admin can view all profiles" on profiles for select using (
  auth.jwt() ->> 'email' = 'admin@mainedit.com'
);
-- Allow insert during signup
create policy "Allow insert own profile" on profiles for insert with check (auth.uid() = id);

-- DOWNLOADS table
create table if not exists public.downloads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  effect_id text,
  effect_name text,
  price numeric default 0,
  created_at timestamptz default now()
);
alter table public.downloads enable row level security;
create policy "Users can view own downloads" on downloads for select using (auth.uid() = user_id);
create policy "Users can insert own downloads" on downloads for insert with check (auth.uid() = user_id);
create policy "Admin can view all downloads" on downloads for select using (
  auth.jwt() ->> 'email' = 'admin@mainedit.com'
);

-- TRANSACTIONS table
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  type text check (type in ('deposit', 'withdrawal')),
  amount numeric,
  currency text default 'USD',
  display_amount text,
  method text,
  status text default 'pending' check (status in ('pending', 'completed', 'rejected')),
  created_at timestamptz default now()
);
alter table public.transactions enable row level security;
create policy "Users can view own transactions" on transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on transactions for insert with check (auth.uid() = user_id);
create policy "Admin can manage all transactions" on transactions for all using (
  auth.jwt() ->> 'email' = 'admin@mainedit.com'
);

-- NOTIFICATIONS table
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  message text,
  read boolean default false,
  created_at timestamptz default now()
);
alter table public.notifications enable row level security;
create policy "Users can view own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Users can update own notifications" on notifications for update using (auth.uid() = user_id);
create policy "Admin can insert notifications" on notifications for insert with check (
  auth.jwt() ->> 'email' = 'admin@mainedit.com'
);
-- Enable realtime for notifications
alter publication supabase_realtime add table notifications;

-- LESSON CONTACTS table
create table if not exists public.lesson_contacts (
  id uuid default gen_random_uuid() primary key,
  platform text,
  handle text,
  link text,
  created_at timestamptz default now()
);
alter table public.lesson_contacts enable row level security;
create policy "Everyone can view contacts" on lesson_contacts for select using (true);
create policy "Admin can manage contacts" on lesson_contacts for all using (
  auth.jwt() ->> 'email' = 'admin@mainedit.com'
);

-- =============================================
-- Done! Your database is ready.
-- =============================================
