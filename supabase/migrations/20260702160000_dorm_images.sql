-- ============================================================================
-- Add dorm_images — multi-photo galleries for the dorm detail page.
-- ============================================================================
-- dorms.image_url remains the single card/hero thumbnail (fast, no join
-- needed for the directory grid). dorm_images is additional detail-page-only
-- content, publicly readable like dorms/availability_snapshots (scraped
-- content, no user ownership — writes happen via service-role seeds/scripts).
-- Idempotent: safe to re-run.
-- ============================================================================

create table if not exists public.dorm_images (
  id         uuid primary key default gen_random_uuid(),
  dorm_id    uuid not null references public.dorms (id) on delete cascade,
  url        text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (dorm_id, url)
);

create index if not exists dorm_images_dorm_sort_idx
  on public.dorm_images (dorm_id, sort_order);

alter table public.dorm_images enable row level security;

drop policy if exists "public_read_dorm_images" on public.dorm_images;
create policy "public_read_dorm_images" on public.dorm_images
  for select
  to anon, authenticated
  using (true);
