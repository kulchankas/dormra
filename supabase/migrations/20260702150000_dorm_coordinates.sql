-- ============================================================================
-- Add lat/lng coordinates to dorms, for the /dorms map view.
-- ============================================================================
-- Idempotent: safe to re-run.
-- ============================================================================

alter table public.dorms
  add column if not exists lat double precision,
  add column if not exists lng double precision;

comment on column public.dorms.lat is 'Latitude, geocoded from address (Nominatim/OSM). Null until backfilled.';
comment on column public.dorms.lng is 'Longitude, geocoded from address (Nominatim/OSM). Null until backfilled.';

create index if not exists dorms_coordinates_idx
  on public.dorms (lat, lng)
  where lat is not null and lng is not null;
