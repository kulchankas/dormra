-- ============================================================================
-- Baseline schema for Dormra (idempotent)
-- ============================================================================
-- Inferred from the live production database. Sorts before RLS migration
-- (20260605120000_enable_rls.sql) via timestamp prefix.
--
-- Safe to re-run: uses IF NOT EXISTS throughout.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ── dorms ─────────────────────────────────────────────────────────────────────

create table if not exists public.dorms (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  provider      text not null,
  name          text not null,
  address       text,
  district      smallint,
  price_min     integer,
  price_max     integer,
  deposit_eur   integer,
  deposit_months integer,
  website_url   text,
  apply_url     text,
  scrape_url    text,
  scrape_type   text,
  pets          boolean,
  couples       boolean,
  furnished     boolean,
  min_stay_months integer,
  max_stay_months integer,
  notes         text,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  image_url     text
);

create index if not exists dorms_provider_idx on public.dorms (provider);
create index if not exists dorms_active_idx on public.dorms (active) where active = true;

-- ── availability_snapshots ────────────────────────────────────────────────────

create table if not exists public.availability_snapshots (
  id          uuid primary key default gen_random_uuid(),
  dorm_id     uuid not null references public.dorms (id) on delete cascade,
  available   boolean not null default false,
  rooms_count integer,
  raw_text    text not null default '',
  scrape_ok   boolean not null default true,
  error_msg   text,
  scraped_at  timestamptz not null default now()
);

create index if not exists availability_snapshots_dorm_scraped_idx
  on public.availability_snapshots (dorm_id, scraped_at desc);

-- ── user_alerts ───────────────────────────────────────────────────────────────

create table if not exists public.user_alerts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  price_max        integer,
  districts        smallint[],
  move_in_before   date,
  pets_required    boolean not null default false,
  couples          boolean not null default false,
  deposit_max      integer,
  notify_email     boolean not null default true,
  notify_telegram  boolean not null default false,
  telegram_chat_id text,
  active           boolean not null default true,
  created_at       timestamptz not null default now()
);

create index if not exists user_alerts_user_active_idx
  on public.user_alerts (user_id) where active = true;

-- ── alert_log ─────────────────────────────────────────────────────────────────
-- NOTE: no alert_id column — dedup is keyed on user_id + dorm_id.

create table if not exists public.alert_log (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  dorm_id     uuid not null references public.dorms (id) on delete cascade,
  sent_at     timestamptz not null default now(),
  channel     text not null default 'email',
  snapshot_id uuid references public.availability_snapshots (id) on delete set null
);

create index if not exists alert_log_user_dorm_sent_idx
  on public.alert_log (user_id, dorm_id, sent_at desc);

-- ── tracker (application kanban — schema only, UI not shipped) ────────────────

create table if not exists public.tracker (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  dorm_id    uuid not null references public.dorms (id) on delete cascade,
  status     text not null default 'interested',
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tracker_user_idx on public.tracker (user_id);
