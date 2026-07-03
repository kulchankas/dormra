-- ============================================================================
-- Add quick-select tags to dorm_reviews.
-- ============================================================================
-- Informed by docs/RESEARCH_STUDENT_VOICE.md: the same handful of complaints
-- and compliments (thin walls, slow repairs, WiFi reliability, shared-kitchen
-- mess, party vs. quiet, room size...) show up almost verbatim across every
-- Vienna student housing review source. Tags make reviews faster to write
-- (lower friction than free text) and let a dorm page surface a scannable
-- "frequently mentioned" summary instead of requiring readers to skim every
-- review body.
--
-- The allowed-values list is enforced both here (defense in depth) and in
-- lib/review-tags.ts (REVIEW_TAGS) — keep the two in sync.
-- Idempotent: safe to re-run.
-- ============================================================================

alter table public.dorm_reviews
  add column if not exists tags text[] not null default '{}';

alter table public.dorm_reviews
  drop constraint if exists dorm_reviews_tags_allowed;
alter table public.dorm_reviews
  add constraint dorm_reviews_tags_allowed
  check (
    tags <@ array[
      'thin_walls',
      'slow_repairs',
      'responsive_staff',
      'unreliable_wifi',
      'reliable_wifi',
      'messy_kitchen',
      'clean',
      'great_location',
      'party_dorm',
      'quiet_dorm',
      'friendly_community',
      'small_rooms'
    ]::text[]
  );
