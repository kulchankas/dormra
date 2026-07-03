-- Persist cron scrape job results for in-app monitoring (admin dashboard).
create table if not exists public.cron_runs (
  id            uuid primary key default gen_random_uuid(),
  started_at    timestamptz not null default now(),
  duration_ms   integer not null,
  ok            boolean not null default true,
  error_message text,
  providers     text[] not null,
  batch         integer,
  batches       integer,
  scraped       integer not null default 0,
  errors        integer not null default 0,
  skipped       integer not null default 0,
  pruned        integer not null default 0,
  by_provider   jsonb
);

create index if not exists cron_runs_started_at_idx
  on public.cron_runs (started_at desc);

alter table public.cron_runs enable row level security;

-- No policies: only service role (cron route + admin stats) may read/write.
