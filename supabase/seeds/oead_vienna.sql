-- ============================================================================
-- Seed: OeAD student housing — Vienna (26 residences)
-- ============================================================================
-- SOURCE: https://www.oeadstudenthousing.at/en/accommodation/vienna/
--         Metadata extracted 2026-07-02 (name, path, min monthly price)
--
-- APPLY (Supabase SQL editor or CLI):
--   psql $DATABASE_URL -f supabase/seeds/oead_vienna.sql
--
-- REQUIRES: public.dorms table with unique slug column.
-- PREREQUISITE for cron: merge PR #5 (OeAD Playwright scraper) + set env vars.
--
-- Idempotent: safe to re-run (upserts on slug).
-- ============================================================================

insert into public.dorms (
  slug,
  provider,
  name,
  price_min,
  website_url,
  apply_url,
  scrape_url,
  scrape_type,
  active
)
values
  ('oead-guesthouse-gasgasse', 'OeAD', 'Gasgasse', 723,
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/oead-guesthouse-gasgasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/oead-guesthouse-gasgasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/oead-guesthouse-gasgasse/', 'playwright', true),

  ('oead-guesthouse-kandlgasse', 'OeAD', 'Kandlgasse', 676,
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/oead-guesthouse-kandlgasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/oead-guesthouse-kandlgasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/oead-guesthouse-kandlgasse/', 'playwright', true),

  ('oead-guesthouse-molkereistrasse', 'OeAD', 'Molkereistrasse', 666,
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/oead-guesthouse-molkereistrasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/oead-guesthouse-molkereistrasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/oead-guesthouse-molkereistrasse/', 'playwright', true),

  ('oead-guesthouse-sechshauser-strasse', 'OeAD', 'Sechshauser Strasse', 446,
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/oead-guesthouse-sechshauser-strasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/oead-guesthouse-sechshauser-strasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/oead-guesthouse-sechshauser-strasse/', 'playwright', true),

  ('oead-guesthouse-simmeringer-hauptstrasse', 'OeAD', 'Simmeringer Hauptstrasse', 603,
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/oead-guesthouse-simmeringer-hauptstrasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/oead-guesthouse-simmeringer-hauptstrasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/oead-guesthouse-simmeringer-hauptstrasse/', 'playwright', true),

  ('oead-guesthouse-tigergasse', 'OeAD', 'Tigergasse', 446,
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/oead-guesthouse-tigergasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/oead-guesthouse-tigergasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/oead-guesthouse-tigergasse/', 'playwright', true),

  ('oead-apartment-auf-der-schmelz', 'OeAD', 'Auf der Schmelz', 666,
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/oead-apartment-auf-der-schmelz/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/oead-apartment-auf-der-schmelz/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/oead-apartment-auf-der-schmelz/', 'playwright', true),

  ('oead-apartment-hafnersteig', 'OeAD', 'Hafnersteig', 1290,
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/oead-apartment-hafnersteig/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/oead-apartment-hafnersteig/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/oead-apartment-hafnersteig/', 'playwright', true),

  ('oead-apartment-obermuellnerstrasse', 'OeAD', 'Obermuellnerstrasse', 437,
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/oead-apartment-obermuellnerstrasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/oead-apartment-obermuellnerstrasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/oead-apartment-obermuellnerstrasse/', 'playwright', true),

  ('oead-apartment-poetzleinsdorfer-strasse', 'OeAD', 'Poetzleinsdorfer Strasse', 978,
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/oead-apartment-poetzleinsdorfer-strasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/oead-apartment-poetzleinsdorfer-strasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/oead-apartment-poetzleinsdorfer-strasse/', 'playwright', true),

  ('popup-dorms', 'OeAD', 'PopUp dorms', 439,
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/popup-dorms/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/popup-dorms/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/popup-dorms/', 'playwright', true),

  ('sonnenallee', 'OeAD', 'Sonnenallee', 416,
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/sonnenallee/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/sonnenallee/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/sonnenallee/', 'playwright', true),

  ('adelheid-popp-gasse', 'OeAD', 'Adelheid-Popp-Gasse', 638,
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/adelheid-popp-gasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/adelheid-popp-gasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/adelheid-popp-gasse/', 'playwright', true),

  ('brigittenauer-laende', 'OeAD', 'Brigittenauer Laende', 372,
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/brigittenauer-laende/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/brigittenauer-laende/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/brigittenauer-laende/', 'playwright', true),

  ('donaufelderstrasse', 'OeAD', 'Donaufelder Strasse', 560,
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/donaufelderstrasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/donaufelderstrasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/donaufelderstrasse/', 'playwright', true),

  ('dueckegasse', 'OeAD', 'Dueckegasse', 620,
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/dueckegasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/dueckegasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/dueckegasse/', 'playwright', true),

  ('forsthausgasse', 'OeAD', 'Forsthausgasse', 459,
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/forsthausgasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/forsthausgasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/forsthausgasse/', 'playwright', true),

  ('garnisongasse', 'OeAD', 'Garnisongasse', 493,
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/garnisongasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/garnisongasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/garnisongasse/', 'playwright', true),

  ('gumpendorferstrasse', 'OeAD', 'Gumpendorferstrasse', 340,
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/gumpendorferstrasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/gumpendorferstrasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/gumpendorferstrasse/', 'playwright', true),

  ('gymnasiumstrasse', 'OeAD', 'Gymnasiumstrasse', 539,
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/gymnasiumstrasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/gymnasiumstrasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/gymnasiumstrasse/', 'playwright', true),

  ('josef-baumann-gasse', 'OeAD', 'Josef-Baumann-Gasse', 551,
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/josef-baumann-gasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/josef-baumann-gasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/josef-baumann-gasse/', 'playwright', true),

  ('kaisermuehlenstrasse', 'OeAD', 'Kaisermuehlenstrasse', 657,
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/kaisermuehlenstrasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/kaisermuehlenstrasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/kaisermuehlenstrasse/', 'playwright', true),

  ('lorenz-mueller-gasse', 'OeAD', 'Lorenz-Mueller-Gasse 1A', 459,
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/lorenz-mueller-gasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/lorenz-mueller-gasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/lorenz-mueller-gasse/', 'playwright', true),

  ('medwedweg', 'OeAD', 'Medwedweg', 644,
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/medwedweg/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/medwedweg/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/medwedweg/', 'playwright', true),

  ('peter-jordan-strasse', 'OeAD', 'Peter-Jordan-Strasse', 628,
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/peter-jordan-strasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/peter-jordan-strasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/peter-jordan-strasse/', 'playwright', true),

  ('tuerkenstrasse', 'OeAD', 'Tuerkenstrasse', 449,
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/tuerkenstrasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/tuerkenstrasse/',
   'https://www.oeadstudenthousing.at/en/accommodation/vienna/tuerkenstrasse/', 'playwright', true)

on conflict (slug) do update set
  provider    = excluded.provider,
  name        = excluded.name,
  price_min   = excluded.price_min,
  website_url = excluded.website_url,
  apply_url   = excluded.apply_url,
  scrape_url  = excluded.scrape_url,
  scrape_type = excluded.scrape_type,
  active      = excluded.active;
