-- ============================================================================
-- The Grapevine — anonymous per-dorm reviews & ratings, plus reporting.
-- ============================================================================
-- Design notes (see docs/COMMUNITY_REVIEWS.md for full rationale):
--   * user_id ties a review to a real account (one review per user per dorm,
--     and lets us ban abusers) but is NEVER surfaced to the client — only the
--     `pseudonym` (generated fresh per review, not reused) is shown publicly.
--   * Reviews are publicly readable while `hidden = false`. Hiding a review
--     is an admin-only action performed with the service-role client, which
--     bypasses RLS — there is intentionally no "hide" RLS policy for authors.
--   * Reports are write-only from the client's perspective: anyone signed in
--     can insert a report, but only the service-role admin client can read
--     them, so a reporter's identity never leaks to the reviewed author.
-- Idempotent: safe to re-run.
-- ============================================================================

create table if not exists public.dorm_reviews (
  id            uuid primary key default gen_random_uuid(),
  dorm_id       uuid not null references public.dorms (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  pseudonym     text not null,
  rating        smallint not null check (rating between 1 and 5),
  body          text not null check (char_length(body) between 10 and 2000),
  hidden        boolean not null default false,
  hidden_reason text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (dorm_id, user_id)
);

create index if not exists dorm_reviews_dorm_visible_idx
  on public.dorm_reviews (dorm_id, created_at desc)
  where hidden = false;

create table if not exists public.dorm_review_reports (
  id                uuid primary key default gen_random_uuid(),
  review_id         uuid not null references public.dorm_reviews (id) on delete cascade,
  reporter_user_id  uuid not null references auth.users (id) on delete cascade,
  reason            text not null check (reason in ('spam', 'harassment', 'false_info', 'off_topic', 'other')),
  details           text,
  created_at        timestamptz not null default now(),
  unique (review_id, reporter_user_id)
);

create index if not exists dorm_review_reports_review_idx
  on public.dorm_review_reports (review_id);

alter table public.dorm_reviews        enable row level security;
alter table public.dorm_review_reports enable row level security;

drop policy if exists "public_read_visible_reviews" on public.dorm_reviews;
create policy "public_read_visible_reviews" on public.dorm_reviews
  for select
  to anon, authenticated
  using (hidden = false);

drop policy if exists "own_reviews_read" on public.dorm_reviews;
create policy "own_reviews_read" on public.dorm_reviews
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "own_reviews_insert" on public.dorm_reviews;
create policy "own_reviews_insert" on public.dorm_reviews
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "own_reviews_update" on public.dorm_reviews;
create policy "own_reviews_update" on public.dorm_reviews
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "own_reviews_delete" on public.dorm_reviews;
create policy "own_reviews_delete" on public.dorm_reviews
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Reports: insert-only from the client. Reading reports requires the
-- service-role admin client (moderation queue), so no select policy exists.
drop policy if exists "own_reports_insert" on public.dorm_review_reports;
create policy "own_reports_insert" on public.dorm_review_reports
  for insert
  to authenticated
  with check (auth.uid() = reporter_user_id);
