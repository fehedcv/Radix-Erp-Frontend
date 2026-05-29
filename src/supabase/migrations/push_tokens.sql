-- push_tokens table
-- Run this in your Supabase SQL Editor or add to your migration pipeline.

create table if not exists public.push_tokens (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  token       text not null unique,
  platform    text not null check (platform in ('web', 'android')),
  created_at  timestamptz not null default now()
);

-- Indexes
create index if not exists push_tokens_user_id_idx on public.push_tokens (user_id);
create index if not exists push_tokens_token_idx   on public.push_tokens (token);

-- Row Level Security
alter table public.push_tokens enable row level security;

-- Policy: users can insert their own tokens
create policy "push_tokens: insert own"
  on public.push_tokens for insert
  with check (auth.uid() = user_id);

-- Policy: users can view their own tokens
create policy "push_tokens: select own"
  on public.push_tokens for select
  using (auth.uid() = user_id);

-- Policy: users can update their own tokens
-- Required for upsert — the ON CONFLICT DO UPDATE path needs this
create policy "push_tokens: update own"
  on public.push_tokens for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policy: users can delete their own tokens
create policy "push_tokens: delete own"
  on public.push_tokens for delete
  using (auth.uid() = user_id);
