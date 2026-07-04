-- ============================================================================
-- Seed: ÖJAB student housing — Vienna (15 residences)
-- ============================================================================
-- SOURCE: https://www.oejab.at/en/students/dormitories (filtered: Vienna)
--         Metadata extracted 2026-07-03 (name, address, min monthly price)
-- COORDINATES: geocoded via Nominatim/OpenStreetMap
--
-- APPLY: psql $DATABASE_URL -f supabase/seeds/ojab_vienna.sql
-- NOTE: No scraper registered yet — availability status will be "unknown".
-- Idempotent: safe to re-run (upserts on slug).
-- ============================================================================

insert into public.dorms (
  slug, provider, name, address, district,
  price_min, deposit_months,
  website_url, apply_url,
  pets, couples, furnished, min_stay_months,
  notes, active, lat, lng
)
values
  ('ojab-europahaus-buchwieser', 'ÖJAB', 'ÖJAB-Europahaus Dr. Bruno Buchwieser',
   'Linzer Straße 429, 1140 Wien', 14, 366, 3,
   'https://www.oejab.at/en/students/dormitories',
   'https://www.oejab.at/en/students/application',
   false, false, true, 6,
   '448 places. Gym and sauna on site.', true, 48.2031228, 16.2506857),

  ('ojab-greenhouse', 'ÖJAB', 'ÖJAB-GreenHouse',
   'Sonnenallee 41, 1220 Wien', 22, 416, 3,
   'https://www.oejab.at/en/students/dormitories',
   'https://www.oejab.at/en/students/application',
   false, false, true, 6,
   '313 places. Seestadt Aspern location.', true, 48.2253941, 16.5016183),

  ('ojab-haus-burgenland-1', 'ÖJAB', 'ÖJAB-Haus Burgenland 1',
   'Wilhelm Exner-Gasse 4, 1090 Wien', 9, 372, 3,
   'https://www.oejab.at/en/students/dormitories',
   'https://www.oejab.at/en/students/application',
   false, false, true, 6,
   '116 places. Near Alsergrund universities.', true, 48.2211782, 16.3509479),

  ('ojab-haus-burgenland-2', 'ÖJAB', 'ÖJAB-Haus Burgenland 2',
   'Mittelgasse 18, 1060 Wien', 6, 355, 3,
   'https://www.oejab.at/en/students/dormitories',
   'https://www.oejab.at/en/students/application',
   false, false, true, 6,
   '229 places.', true, 48.1931678, 16.3414155),

  ('ojab-haus-burgenland-3', 'ÖJAB', 'ÖJAB-Haus Burgenland 3',
   'Bürgerspitalgasse 19, 1060 Wien', 6, 373, 3,
   'https://www.oejab.at/en/students/dormitories',
   'https://www.oejab.at/en/students/application',
   false, false, true, 6,
   '234 places.', true, 48.1940271, 16.3412618),

  ('ojab-haus-donaufeld', 'ÖJAB', 'ÖJAB-Haus Donaufeld',
   'Donaufelder Straße 54, 1210 Wien', 21, 347, 3,
   'https://www.oejab.at/en/students/dormitories',
   'https://www.oejab.at/en/students/application',
   false, false, true, 6,
   '318 places.', true, 48.2521054, 16.4158876),

  ('ojab-haus-kirchschlaeger', 'ÖJAB', 'ÖJAB-Haus Dr. Rudolf Kirchschläger',
   'Schelleingasse 36, 1040 Wien', 4, 399, 3,
   'https://www.oejab.at/en/students/dormitories',
   'https://www.oejab.at/en/students/application',
   false, false, true, 6,
   '216 places.', true, 48.1862292, 16.3708915),

  ('ojab-haus-johannesgasse', 'ÖJAB', 'ÖJAB-Haus Johannesgasse',
   'Johannesgasse 8, 1010 Wien', 1, 460, 3,
   'https://www.oejab.at/en/students/dormitories',
   'https://www.oejab.at/en/students/application',
   false, false, true, 6,
   '120 places. Central 1st district.', true, 48.2044909, 16.3729636),

  ('ojab-haus-liesing', 'ÖJAB', 'ÖJAB-Haus Liesing',
   'Elisenstraße 1, 1230 Wien', 23, 362, 3,
   'https://www.oejab.at/en/students/dormitories',
   'https://www.oejab.at/en/students/application',
   false, false, true, 6,
   '202 places.', true, 48.1338411, 16.2785202),

  ('ojab-haus-meidling', 'ÖJAB', 'ÖJAB-Haus Meidling & ÖJAB WG',
   'Eichenstraße 46, 1120 Wien', 12, 420, 3,
   'https://www.oejab.at/en/students/dormitories',
   'https://www.oejab.at/en/students/application',
   false, false, true, 6,
   '162 places.', true, 48.1757273, 16.3362510),

  ('ojab-haus-niederoesterreich-1', 'ÖJAB', 'ÖJAB-Haus Niederösterreich 1',
   'Untere Augartenstraße 31, 1020 Wien', 2, 458, 3,
   'https://www.oejab.at/en/students/dormitories',
   'https://www.oejab.at/en/students/application',
   false, false, true, 6,
   '256 places. Near Prater.', true, 48.2220236, 16.3739438),

  ('ojab-haus-niederoesterreich-2', 'ÖJAB', 'ÖJAB-Haus Niederösterreich 2',
   'Brigittaplatz 14, 1200 Wien', 20, 366, 3,
   'https://www.oejab.at/en/students/dormitories',
   'https://www.oejab.at/en/students/application',
   false, false, true, 6,
   '123 places.', true, 48.2330970, 16.3719533),

  ('ojab-haus-peter-jordan', 'ÖJAB', 'ÖJAB-Haus Peter Jordan',
   'Peter-Jordan-Straße 29, 1190 Wien', 19, 301, 3,
   'https://www.oejab.at/en/students/dormitories',
   'https://www.oejab.at/en/students/application',
   false, false, true, 6,
   '33 places. Smallest Vienna ÖJAB dorm.', true, 48.2369415, 16.3439597),

  ('ojab-haus-remise', 'ÖJAB', 'ÖJAB-Haus Remise',
   'Hermi-Hirsch-Weg 4, 1120 Wien', 12, 658, 3,
   'https://www.oejab.at/en/students/dormitories',
   'https://www.oejab.at/en/students/application',
   false, false, true, 6,
   '87 places. Premium pricing tier.', true, 48.1800962, 16.3472408),

  ('ojab-haus-salzburg-wien', 'ÖJAB', 'ÖJAB-Haus Salzburg (in Vienna)',
   'Mollardgasse 16, 1060 Wien', 6, 369, 3,
   'https://www.oejab.at/en/students/dormitories',
   'https://www.oejab.at/en/students/application',
   false, false, true, 6,
   '120 places. Named after Salzburg chapter, located in Mariahilf.', true, 48.1922346, 16.3519904)

on conflict (slug) do update set
  provider = excluded.provider,
  name = excluded.name,
  address = excluded.address,
  district = excluded.district,
  price_min = excluded.price_min,
  deposit_months = excluded.deposit_months,
  website_url = excluded.website_url,
  apply_url = excluded.apply_url,
  pets = excluded.pets,
  couples = excluded.couples,
  furnished = excluded.furnished,
  min_stay_months = excluded.min_stay_months,
  notes = excluded.notes,
  active = excluded.active,
  lat = excluded.lat,
  lng = excluded.lng;
