-- ============================================================================
-- Seed: home4students — Vienna (11 locations)
-- ============================================================================
-- SOURCE: https://www.home4students.at/en/our-dormitories/dormitories-vienna/
--         Prices from Home4students 2026/27 PDF (minimum monthly rent)
-- COORDINATES: geocoded from address via Nominatim/OpenStreetMap (scripts/geocode-dorms.mjs)
-- APPLY: psql $DATABASE_URL -f supabase/seeds/home4students_vienna.sql
-- Scrape URL: shared vacancy page; scraper matches by address per slug.
-- ============================================================================

insert into public.dorms (
  slug, provider, name, address, district,
  price_min, price_max, deposit_months,
  website_url, apply_url, scrape_url, scrape_type,
  furnished, active, lat, lng
)
values
  ('h4s-grosse-schiffgasse', 'home4students', 'Große Schiffgasse 12', 'Große Schiffgasse 12, 1020 Wien', 2,
   465, 530, 2,
   'https://www.home4students.at/en/our-dormitories/dormitories-vienna/',
   'https://www.home4students.at/en/registration/',
   'https://www.home4students.at/en/vacancy/', 'cheerio',
   true, true, 48.216481, 16.3759935),

  ('h4s-schaeffergasse', 'home4students', 'Schäffergasse 2', 'Schäffergasse 2, 1040 Wien', 4,
   469, 489, 2,
   'https://www.home4students.at/en/our-dormitories/dormitories-vienna/',
   'https://www.home4students.at/en/registration/',
   'https://www.home4students.at/en/vacancy/', 'cheerio',
   true, true, 48.194896, 16.365405),

  ('h4s-neudeggergasse', 'home4students', 'Neudeggergasse 21', 'Neudeggergasse 21, 1080 Wien', 8,
   469, 469, 2,
   'https://www.home4students.at/en/our-dormitories/dormitories-vienna/',
   'https://www.home4students.at/en/registration/',
   'https://www.home4students.at/en/vacancy/', 'cheerio',
   true, true, 48.2077851, 16.3514504),

  ('h4s-boltzmanngasse', 'home4students', 'Boltzmanngasse 10', 'Boltzmanngasse 10, 1090 Wien', 9,
   469, 492, 2,
   'https://www.home4students.at/en/our-dormitories/dormitories-vienna/',
   'https://www.home4students.at/en/registration/',
   'https://www.home4students.at/en/vacancy/', 'cheerio',
   true, true, 48.2218615, 16.3565043),

  ('h4s-hofergasse', 'home4students', 'Höfergasse 13', 'Höfergasse 13, 1090 Wien', 9,
   489, 489, 2,
   'https://www.home4students.at/en/our-dormitories/dormitories-vienna/',
   'https://www.home4students.at/en/registration/',
   'https://www.home4students.at/en/vacancy/', 'cheerio',
   true, true, 48.2175335, 16.3498042),

  ('h4s-sensengasse', 'home4students', 'Sensengasse 2b', 'Sensengasse 2b, 1090 Wien', 9,
   499, 535, 2,
   'https://www.home4students.at/en/our-dormitories/dormitories-vienna/',
   'https://www.home4students.at/en/registration/',
   'https://www.home4students.at/en/vacancy/', 'cheerio',
   true, true, 48.2198836, 16.354717),

  ('h4s-erlachplatz', 'home4students', 'Erlachplatz 5', 'Erlachplatz 5, 1100 Wien', 10,
   415, 439, 2,
   'https://www.home4students.at/en/our-dormitories/dormitories-vienna/',
   'https://www.home4students.at/en/registration/',
   'https://www.home4students.at/en/vacancy/', 'cheerio',
   true, true, 48.1773427, 16.3691471),

  ('h4s-ullmannstrasse', 'home4students', 'Ullmannstraße 54', 'Ullmannstraße 54, 1150 Wien', 15,
   395, 522, 2,
   'https://www.home4students.at/en/our-dormitories/dormitories-vienna/',
   'https://www.home4students.at/en/registration/',
   'https://www.home4students.at/en/vacancy/', 'cheerio',
   true, true, 48.1852841, 16.3298434),

  ('h4s-doebling-front', 'home4students', 'Döblinger Hauptstraße 55 (Front)', 'Döblinger Hauptstraße 55, 1190 Wien', 19,
   492, 492, 2,
   'https://www.home4students.at/en/our-dormitories/dormitories-vienna/',
   'https://www.home4students.at/en/registration/',
   'https://www.home4students.at/en/vacancy/', 'cheerio',
   true, true, 48.2393774, 16.3546418),

  ('h4s-doebling-back', 'home4students', 'Döblinger Hauptstraße 55 (Back)', 'Döblinger Hauptstraße 55, 1190 Wien', 19,
   465, 530, 2,
   'https://www.home4students.at/en/our-dormitories/dormitories-vienna/',
   'https://www.home4students.at/en/registration/',
   'https://www.home4students.at/en/vacancy/', 'cheerio',
   true, true, 48.2393774, 16.3546418),

  ('h4s-popup-seestadt', 'home4students', 'PopUp Seestadt Aspern', 'Sonnenallee 105, 1220 Wien', 22,
   439, 439, 2,
   'https://www.home4students.at/en/our-dormitories/dormitories-vienna/',
   'https://www.home4students.at/en/registration/',
   'https://www.home4students.at/en/vacancy/', 'cheerio',
   true, true, 48.2328498, 16.5099047)

on conflict (slug) do update set
  provider = excluded.provider,
  name = excluded.name,
  address = excluded.address,
  district = excluded.district,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  deposit_months = excluded.deposit_months,
  website_url = excluded.website_url,
  apply_url = excluded.apply_url,
  scrape_url = excluded.scrape_url,
  scrape_type = excluded.scrape_type,
  furnished = excluded.furnished,
  active = excluded.active,
  lat = excluded.lat,
  lng = excluded.lng;
