-- ============================================================================
-- Seed: STUWO student housing — Vienna (12 residences)
-- ============================================================================
-- SOURCE: https://www.stuwo.at/en/dormitories/vienna/
-- APPLY: psql $DATABASE_URL -f supabase/seeds/stuwo_vienna.sql
-- Idempotent: upserts on slug.
-- ============================================================================

insert into public.dorms (
  slug, provider, name, address, district,
  price_min, deposit_months,
  website_url, apply_url, scrape_url, scrape_type,
  pets, couples, furnished, active
)
values
  ('stuwo-arsenal', 'STUWO', 'STUWO Arsenal', 'Gänsbachergasse 10, 1030 Wien', 3,
   455, 3,
   'https://www.stuwo.at/en/dormitories/vienna/stuwo-arsenal/',
   'https://reservation.stuwo.at/en/',
   'https://www.stuwo.at/en/dormitories/vienna/stuwo-arsenal/', 'cheerio',
   false, true, true, true),

  ('stuwo-seestadt-aspern', 'STUWO', 'STUWO Seestadt Aspern', 'Sonnenallee 24, 1220 Wien', 22,
   592, 3,
   'https://www.stuwo.at/en/dormitories/vienna/seestadt-aspern/',
   'https://reservation.stuwo.at/en/',
   'https://www.stuwo.at/en/dormitories/vienna/seestadt-aspern/', 'cheerio',
   false, false, true, true),

  ('stuwo-dueckegasse', 'STUWO', 'STUWO Dückegasse', 'Dückegasse 3, 1220 Wien', 22,
   598, 3,
   'https://www.stuwo.at/en/dormitories/vienna/dueckegasse/',
   'https://reservation.stuwo.at/en/',
   'https://www.stuwo.at/en/dormitories/vienna/dueckegasse/', 'cheerio',
   true, false, true, true),

  ('stuwo-triester-strasse', 'STUWO', 'STUWO Triester Straße', 'Triester Straße 40, 1100 Wien', 10,
   586, 3,
   'https://www.stuwo.at/en/dormitories/vienna/triester-strasse/',
   'https://reservation.stuwo.at/en/',
   'https://www.stuwo.at/en/dormitories/vienna/triester-strasse/', 'cheerio',
   false, false, true, true),

  ('stuwo-kenyongasse', 'STUWO', 'STUWO Kenyongasse', 'Kenyongasse 23-25, 1070 Wien', 7,
   430, 3,
   'https://www.stuwo.at/en/dormitories/vienna/kenyongasse/',
   'https://reservation.stuwo.at/en/',
   'https://www.stuwo.at/en/dormitories/vienna/kenyongasse/', 'cheerio',
   false, false, true, true),

  ('stuwo-strozzigasse', 'STUWO', 'STUWO Strozzigasse', 'Strozzigasse 6-8, 1080 Wien', 8,
   540, 3,
   'https://www.stuwo.at/en/dormitories/vienna/strozzigasse/',
   'https://reservation.stuwo.at/en/',
   'https://www.stuwo.at/en/dormitories/vienna/strozzigasse/', 'cheerio',
   false, true, true, true),

  ('stuwo-strudlhofgasse', 'STUWO', 'STUWO Strudlhofgasse', 'Strudlhofgasse 5, 1090 Wien', 9,
   629, 3,
   'https://www.stuwo.at/en/dormitories/vienna/strudlhofgasse/',
   'https://reservation.stuwo.at/en/',
   'https://www.stuwo.at/en/dormitories/vienna/strudlhofgasse/', 'cheerio',
   false, false, true, true),

  ('stuwo-simmering', 'STUWO', 'STUWO Simmering', 'Rautenstrauchgasse 5, 1110 Wien', 11,
   598, 3,
   'https://www.stuwo.at/en/dormitories/vienna/simmering/',
   'https://reservation.stuwo.at/en/',
   'https://www.stuwo.at/en/dormitories/vienna/simmering/', 'cheerio',
   false, false, true, true),

  ('stuwo-spengergasse', 'STUWO', 'STUWO Spengergasse', 'Spengergasse 27, 1050 Wien', 5,
   555, 3,
   'https://www.stuwo.at/en/dormitories/vienna/spengergasse/',
   'https://reservation.stuwo.at/en/',
   'https://www.stuwo.at/en/dormitories/vienna/spengergasse/', 'cheerio',
   false, false, true, true),

  ('stuwo-vorgartenstrasse', 'STUWO', 'STUWO Vorgartenstraße', 'Vorgartenstrasse 110A, 1020 Wien', 2,
   642, 3,
   'https://www.stuwo.at/en/dormitories/vienna/vorgartenstrasse/',
   'https://reservation.stuwo.at/en/',
   'https://www.stuwo.at/en/dormitories/vienna/vorgartenstrasse/', 'cheerio',
   false, false, true, true),

  ('stuwo-schmelz', 'STUWO', 'STUWO Auf der Schmelz', 'Auf der Schmelz 12, 1150 Wien', 15,
   629, 3,
   'https://www.stuwo.at/en/dormitories/vienna/schmelz/',
   'https://reservation.stuwo.at/en/',
   'https://www.stuwo.at/en/dormitories/vienna/schmelz/', 'cheerio',
   false, false, true, true),

  ('stuwo-donaufelder-strasse', 'STUWO', 'STUWO Donaufelder Straße', 'Donaufelder Straße 159, 1210 Wien', 21,
   725, 3,
   'https://www.stuwo.at/en/dormitories/vienna/donaufelder-strasse/',
   'https://reservation.stuwo.at/en/',
   'https://www.stuwo.at/en/dormitories/vienna/donaufelder-strasse/', 'cheerio',
   false, false, true, true)

on conflict (slug) do update set
  provider = excluded.provider,
  name = excluded.name,
  address = excluded.address,
  district = excluded.district,
  price_min = excluded.price_min,
  deposit_months = excluded.deposit_months,
  website_url = excluded.website_url,
  apply_url = excluded.apply_url,
  scrape_url = excluded.scrape_url,
  scrape_type = excluded.scrape_type,
  pets = excluded.pets,
  couples = excluded.couples,
  furnished = excluded.furnished,
  active = excluded.active;
