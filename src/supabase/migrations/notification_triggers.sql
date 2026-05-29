-- =============================================================================
-- PUSH NOTIFICATION TRIGGERS
-- =============================================================================
-- Prerequisites:
--   1. pg_net extension enabled (Database → Extensions in Supabase dashboard)
--   2. Replace the two placeholder values in _send_push below before running
--   3. send-notification edge function deployed
--
-- Both values are in Supabase Dashboard → Project Settings → API
-- =============================================================================

create extension if not exists pg_net;

-- =============================================================================
-- HELPER: central function that calls the edge function
-- Replace the two placeholder strings before running.
-- =============================================================================

create or replace function _send_push(
  p_user_id uuid,
  p_title   text,
  p_body    text,
  p_route   text default null
) 
returns void as $$
declare
  v_url      constant text := 'https://hnfgivfqprqpeiwfwdcw.supabase.co/functions/v1/send-notification';
  v_key      constant text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuZmdpdmZxcHJxcGVpd2Z3ZGN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzc2NTEyOSwiZXhwIjoyMDkzMzQxMTI5fQ.pkZnXQgFyPIajeLq_4N1f9iMl47RW-AtSpn7LTi5hRA';
begin
  perform net.http_post(
    url     := v_url,
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    body    := jsonb_build_object(
      'user_id', p_user_id,
      'title',   p_title,
      'body',    p_body,
      'route',   p_route
    )
  );
exception when others then
  -- Never let notification failure break the main transaction
  raise warning '[push] _send_push failed: %', sqlerrm;
end;
$$ language plpgsql security definer;

-- =============================================================================
-- 1. NEW LEAD CREATED → notify the business unit manager
--    Assumes: leads.business_unit_id, business_units.manager_id
-- =============================================================================

create or replace function _notify_on_new_lead()
returns trigger as $$
declare
  v_manager_id uuid;
begin
  select manager_id into v_manager_id
  from business_units
  where id = NEW.business_unit_id;

  if v_manager_id is null then return NEW; end if;

  perform _send_push(
    v_manager_id,
    'New Lead',
    'A new lead has been submitted to your business',
    '/business/leads'
  );

  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists on_lead_created on leads;
create trigger on_lead_created
  after insert on leads
  for each row
  execute function _notify_on_new_lead();

-- =============================================================================
-- 2. LEAD STATUS CHANGED → notify the agent
--    Covers: approved, rejected, and any other status change
--    Assumes: leads.status, leads.agent_id
-- =============================================================================

create or replace function _notify_on_lead_status_change()
returns trigger as $$
declare
  v_title text;
  v_body  text;
begin
  if OLD.status is not distinct from NEW.status then return NEW; end if;

  case NEW.status
    when 'approved' then
      v_title := 'Lead Approved';
      v_body  := 'Your lead has been approved';
    when 'rejected' then
      v_title := 'Lead Rejected';
      v_body  := 'Your lead was not approved';
    else
      v_title := 'Lead Updated';
      v_body  := 'Your lead status changed to ' || NEW.status;
  end case;

  perform _send_push(
    NEW.agent_id,
    v_title,
    v_body,
    '/agent/history'
  );

  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists on_lead_status_changed on leads;
create trigger on_lead_status_changed
  after update of status on leads
  for each row
  execute function _notify_on_lead_status_change();

-- =============================================================================
-- 3. CREDITS VERIFIED → notify the agent
--    Assumes: credits.agent_id (or user_id), credits.status
--    Adjust column names to match your actual credits table
-- =============================================================================

create or replace function _notify_on_credits_verified()
returns trigger as $$
begin
  if OLD.status is not distinct from NEW.status then return NEW; end if;
  if NEW.status <> 'verified' then return NEW; end if;

  perform _send_push(
    NEW.agent_id,   -- change to NEW.user_id if that is your column name
    'Credits Verified',
    'Your credit submission has been verified',
    '/agent/wallet'
  );

  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists on_credits_verified on credits;
create trigger on_credits_verified
  after update of status on credits
  for each row
  execute function _notify_on_credits_verified();

-- =============================================================================
-- 4. WITHDRAWAL APPROVED or REJECTED → notify the user
--    Assumes: withdrawals.user_id, withdrawals.status
-- =============================================================================

create or replace function _notify_on_withdrawal_update()
returns trigger as $$
declare
  v_title text;
  v_body  text;
begin
  if OLD.status is not distinct from NEW.status then return NEW; end if;

  case NEW.status
    when 'approved' then
      v_title := 'Withdrawal Approved';
      v_body  := 'Your withdrawal request has been approved';
    when 'rejected' then
      v_title := 'Withdrawal Rejected';
      v_body  := 'Your withdrawal request was rejected';
    else
      return NEW;
  end case;

  perform _send_push(
    NEW.user_id,
    v_title,
    v_body,
    '/agent/wallet'
  );

  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists on_withdrawal_updated on withdrawals;
create trigger on_withdrawal_updated
  after update of status on withdrawals
  for each row
  execute function _notify_on_withdrawal_update();

-- =============================================================================
-- 5. ADMIN ANNOUNCEMENT → notify all users with a given role
--    Assumes an announcements table: (id, title, body, target_role, route)
--    target_role: 'agent' | 'business' | 'all'
--    When a row is inserted the trigger fans out to every matching user.
-- =============================================================================

create or replace function _notify_on_announcement()
returns trigger as $$
declare
  v_user record;
begin
  for v_user in
    select id from users
    where NEW.target_role = 'all' or role = NEW.target_role
  loop
    perform _send_push(
      v_user.id,
      NEW.title,
      NEW.body,
      coalesce(NEW.route, '/')
    );
  end loop;

  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists on_announcement_created on announcements;
create trigger on_announcement_created
  after insert on announcements
  for each row
  execute function _notify_on_announcement();
