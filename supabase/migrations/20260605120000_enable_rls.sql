-- ============================================================================
-- Enable Row Level Security + policies
-- ============================================================================
-- CONTEXT
--   Every public table currently has RLS DISABLED. Because the anon key ships
--   to the browser (NEXT_PUBLIC_SUPABASE_ANON_KEY), anyone can read/write every
--   row via the PostgREST API today. This migration locks that down.
--
-- PREREQUISITE — READ BEFORE APPLYING
--   The cron/scraper (lib/supabase.ts -> lib/diff.ts) writes snapshots and
--   reads user_alerts. It must use the SERVICE-ROLE key, which bypasses RLS.
--   Set SUPABASE_SERVICE_ROLE_KEY in the deployment env BEFORE applying this,
--   otherwise the scraper will start failing its inserts.
--
-- APPLY
--   supabase db push        (CLI)   — or paste into the SQL editor / dashboard.
-- ============================================================================

-- ── User-owned tables ───────────────────────────────────────────────────────
-- Each user may only see and manage their own rows.

alter table public.user_alerts enable row level security;
alter table public.tracker     enable row level security;
alter table public.alert_log   enable row level security;

drop policy if exists "own_alerts" on public.user_alerts;
create policy "own_alerts" on public.user_alerts
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "own_tracker" on public.tracker;
create policy "own_tracker" on public.tracker
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- alert_log is written by the cron (service role, bypasses RLS).
-- Users only need to read their own delivery history.
drop policy if exists "own_alert_log" on public.alert_log;
create policy "own_alert_log" on public.alert_log
  for select
  to authenticated
  using (auth.uid() = user_id);

-- ── Public catalog tables ───────────────────────────────────────────────────
-- Readable by anyone (anon + authenticated). Writes happen only via the
-- service-role cron, which bypasses RLS — so no write policy is granted here.

alter table public.dorms                  enable row level security;
alter table public.availability_snapshots enable row level security;

drop policy if exists "public_read_dorms" on public.dorms;
create policy "public_read_dorms" on public.dorms
  for select
  to anon, authenticated
  using (true);

drop policy if exists "public_read_snapshots" on public.availability_snapshots;
create policy "public_read_snapshots" on public.availability_snapshots
  for select
  to anon, authenticated
  using (true);
