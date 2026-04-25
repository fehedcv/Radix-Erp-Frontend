#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   PROJECT_REF=xxxxx DB_PASSWORD=xxxxx ./supabase/setup_supabase_backend.sh
# Optional:
#   SUPABASE_ACCESS_TOKEN=... (if not already logged in via `supabase login`)

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SQL_FILE="${ROOT_DIR}/supabase/setup_supabase_backend.sql"

if ! command -v supabase >/dev/null 2>&1; then
  echo "❌ Supabase CLI is not installed. Install it first: https://supabase.com/docs/guides/cli"
  exit 1
fi

if [[ -n "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  export SUPABASE_ACCESS_TOKEN
fi

if [[ -z "${PROJECT_REF:-}" ]]; then
  echo "❌ PROJECT_REF is required (your Supabase project ref)."
  exit 1
fi

if [[ -z "${DB_PASSWORD:-}" ]]; then
  echo "❌ DB_PASSWORD is required (database password for project link)."
  exit 1
fi

cat > "${SQL_FILE}" <<'SQL'
-- ============================================================================
-- Radix ERP Supabase bootstrap SQL
-- Applies core tables, indexes, RLS, helper triggers, and storage bucket.
-- ============================================================================

create extension if not exists pgcrypto;

-- --------------------------------------------------------------------------
-- Profiles (maps to /resource/User)
-- --------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  phone text,
  avatar text,
  primary_role text check (primary_role in ('admin','agent','business')),
  roles text[] default '{}',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- --------------------------------------------------------------------------
-- Business Units (maps to /resource/Business Unit)
-- --------------------------------------------------------------------------
create table if not exists public.business_units (
  id text primary key,
  business_name text not null,
  category text,
  status text default 'Active',
  commision numeric(12,2) default 0,
  manager_name text,
  primary_phone text,
  whatsapp_number text,
  email text,
  website text,
  location text,
  address text,
  description text,
  logo text,
  facebook text,
  instagram text,
  linkedin text,
  services jsonb default '[]'::jsonb,
  gallery jsonb default '[]'::jsonb,
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- --------------------------------------------------------------------------
-- Leads (maps to /resource/Lead + methods)
-- --------------------------------------------------------------------------
create table if not exists public.leads (
  id text primary key,
  business_unit text references public.business_units(id) on delete set null,
  agent_id uuid references public.profiles(id) on delete set null,
  full_name text,
  phone text,
  email text,
  notes text,
  service text,
  status text default 'Pending',
  credit numeric(12,2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- --------------------------------------------------------------------------
-- Agent Credit Ledger (maps to /resource/Agent Credit Ledger)
-- --------------------------------------------------------------------------
create table if not exists public.agent_credit_ledger (
  id text primary key,
  agent_id uuid references public.profiles(id) on delete set null,
  lead_id text references public.leads(id) on delete set null,
  amount numeric(12,2) not null default 0,
  status text default 'Pending',
  remarks text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- --------------------------------------------------------------------------
-- Wallet + withdrawals (method endpoints)
-- --------------------------------------------------------------------------
create table if not exists public.agent_wallets (
  agent_id uuid primary key references public.profiles(id) on delete cascade,
  balance numeric(12,2) default 0,
  total_earned numeric(12,2) default 0,
  total_withdrawn numeric(12,2) default 0,
  updated_at timestamptz default now()
);

create table if not exists public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.profiles(id) on delete cascade,
  amount numeric(12,2) not null,
  status text default 'Pending',
  processed_by uuid references public.profiles(id) on delete set null,
  processed_at timestamptz,
  created_at timestamptz default now()
);

-- --------------------------------------------------------------------------
-- Updated-at trigger helper
-- --------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_set_updated_at on public.profiles;
create trigger trg_profiles_set_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();

drop trigger if exists trg_business_units_set_updated_at on public.business_units;
create trigger trg_business_units_set_updated_at before update on public.business_units for each row execute procedure public.set_updated_at();

drop trigger if exists trg_leads_set_updated_at on public.leads;
create trigger trg_leads_set_updated_at before update on public.leads for each row execute procedure public.set_updated_at();

drop trigger if exists trg_agent_credit_ledger_set_updated_at on public.agent_credit_ledger;
create trigger trg_agent_credit_ledger_set_updated_at before update on public.agent_credit_ledger for each row execute procedure public.set_updated_at();

-- --------------------------------------------------------------------------
-- Indexes
-- --------------------------------------------------------------------------
create index if not exists idx_profiles_primary_role on public.profiles(primary_role);
create index if not exists idx_business_units_status on public.business_units(status);
create index if not exists idx_leads_agent_id on public.leads(agent_id);
create index if not exists idx_leads_business_unit on public.leads(business_unit);
create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_agent_credit_ledger_agent_id on public.agent_credit_ledger(agent_id);
create index if not exists idx_withdrawal_requests_agent_id on public.withdrawal_requests(agent_id);

-- --------------------------------------------------------------------------
-- RLS
-- --------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.business_units enable row level security;
alter table public.leads enable row level security;
alter table public.agent_credit_ledger enable row level security;
alter table public.agent_wallets enable row level security;
alter table public.withdrawal_requests enable row level security;

-- Profiles policies
create policy if not exists profiles_select_own on public.profiles for select to authenticated using (auth.uid() = id);
create policy if not exists profiles_update_own on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Admin helper expression
-- (kept inline for simplicity; can be moved to a SQL function later)

-- Business Units policies
create policy if not exists business_units_select_all_authenticated
on public.business_units
for select
to authenticated
using (true);

create policy if not exists business_units_insert_admin
on public.business_units
for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.primary_role = 'admin'
  )
);

create policy if not exists business_units_update_admin_or_owner
on public.business_units
for update
to authenticated
using (
  owner_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.primary_role = 'admin'
  )
)
with check (
  owner_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.primary_role = 'admin'
  )
);

-- Leads policies
create policy if not exists leads_select_related
on public.leads
for select
to authenticated
using (
  agent_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.primary_role in ('admin','business')
  )
);

create policy if not exists leads_insert_agent
on public.leads
for insert
to authenticated
with check (
  agent_id = auth.uid()
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.primary_role = 'agent'
  )
);

create policy if not exists leads_update_admin_or_business
on public.leads
for update
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.primary_role in ('admin','business')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.primary_role in ('admin','business')
  )
);

-- Ledger policies
create policy if not exists ledger_select_own_or_admin
on public.agent_credit_ledger
for select
to authenticated
using (
  agent_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.primary_role = 'admin'
  )
);

create policy if not exists ledger_mutate_admin
on public.agent_credit_ledger
for all
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.primary_role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.primary_role = 'admin'
  )
);

-- Wallet policies
create policy if not exists wallets_select_own
on public.agent_wallets
for select
to authenticated
using (agent_id = auth.uid());

create policy if not exists wallets_mutate_admin
on public.agent_wallets
for all
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.primary_role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.primary_role = 'admin'
  )
);

-- Withdrawal policies
create policy if not exists withdrawals_select_own_or_admin
on public.withdrawal_requests
for select
to authenticated
using (
  agent_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.primary_role = 'admin'
  )
);

create policy if not exists withdrawals_insert_own
on public.withdrawal_requests
for insert
to authenticated
with check (agent_id = auth.uid());

create policy if not exists withdrawals_update_admin
on public.withdrawal_requests
for update
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.primary_role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.primary_role = 'admin'
  )
);

-- --------------------------------------------------------------------------
-- Storage bucket (uploads)
-- --------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

-- storage policies
create policy if not exists uploads_public_read
on storage.objects
for select
to public
using (bucket_id = 'uploads');

create policy if not exists uploads_authenticated_insert
on storage.objects
for insert
to authenticated
with check (bucket_id = 'uploads');

create policy if not exists uploads_owner_update
on storage.objects
for update
to authenticated
using (bucket_id = 'uploads' and owner = auth.uid())
with check (bucket_id = 'uploads' and owner = auth.uid());

create policy if not exists uploads_owner_delete
on storage.objects
for delete
to authenticated
using (bucket_id = 'uploads' and owner = auth.uid());
SQL

echo "➡️ Linking to Supabase project ${PROJECT_REF}..."
supabase link --project-ref "${PROJECT_REF}" --password "${DB_PASSWORD}"

echo "➡️ Applying SQL schema and policies..."
supabase db execute --file "${SQL_FILE}"

EDGE_FUNCTIONS=(
  business_chain_api_admin_get_admin_dashboard_data
  business_chain_api_admin_get_team_data
  business_chain_api_admin_get_credit_settlement_data
  business_chain_api_admin_get_leads_business_units_services
  business_chain_api_admin_delete_business_unit
  business_chain_api_agent_get_agent_dashboard_data
  business_chain_api_agent_get_agent_profile
  business_chain_api_agent_update_agent_profile
  business_chain_api_api_get_my_lead_history
  business_chain_api_api_get_business_unit
  business_chain_api_leads_submit_lead
  business_chain_api_leads_get_business_leads
  business_chain_api_leads_get_business_lead_detail
  business_chain_api_leads_update_lead_status
  business_chain_api_leads_settle_agent_credit
  business_chain_api_wallet_get_agent_wallet
  business_chain_api_wallet_get_withdrawal_requests
  business_chain_api_wallet_request_withdrawal
  business_chain_api_business_dashboard_get_business_overview
  business_chain_api_business_unit_get_my_business_unit
  business_chain_api_business_unit_update_my_business_unit
)

echo "➡️ Scaffolding edge functions (skips existing names)..."
for fn in "${EDGE_FUNCTIONS[@]}"; do
  if [[ -d "${ROOT_DIR}/supabase/functions/${fn}" ]]; then
    echo "   - ${fn} (exists, skip)"
    continue
  fi
  supabase functions new "${fn}"
  cat > "${ROOT_DIR}/supabase/functions/${fn}/index.ts" <<'TS'
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}))
    return new Response(JSON.stringify({
      message: {
        success: true,
        function: import.meta.url,
        received: body,
      },
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
TS
  echo "   - ${fn} created"
done

echo "✅ Supabase bootstrap complete."
echo "Next: implement real business logic inside supabase/functions/*/index.ts and deploy with:"
echo "   supabase functions deploy <function_name> --project-ref ${PROJECT_REF}"
