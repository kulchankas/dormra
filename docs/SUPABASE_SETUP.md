# Supabase setup guide

Step-by-step guide for applying migrations and seeds to your production Supabase project.

**Two ways to run SQL — pick one:**

| Method | When to use |
|--------|-------------|
| **SQL Editor** (recommended) | No terminal — copy file contents, paste, Run |
| **Terminal + `psql`** | Repo cloned locally + `DATABASE_URL` set |

**Do not paste `psql "$DATABASE_URL" -f …` into SQL Editor** — those are shell commands only.

---

## Part A — Migrations (required if not applied)

Run **one file per query**, in order:

| # | File | What it does |
|---|------|--------------|
| 1 | `20260702150000_dorm_coordinates.sql` | Map `lat` / `lng` |
| 2 | `20260702160000_dorm_images.sql` | Photo gallery table |
| 3 | `20260702220000_cron_runs.sql` | Admin cron widget |
| 4 | `20260702220100_alert_log_alert_id.sql` | Per-alert email dedup |

**Terminal:**
```bash
export DATABASE_URL="postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres"
psql "$DATABASE_URL" -f supabase/migrations/20260702150000_dorm_coordinates.sql
psql "$DATABASE_URL" -f supabase/migrations/20260702160000_dorm_images.sql
psql "$DATABASE_URL" -f supabase/migrations/20260702220000_cron_runs.sql
psql "$DATABASE_URL" -f supabase/migrations/20260702220100_alert_log_alert_id.sql
```

---

## Part B — Seeds (required for map)

After migration #1, run provider seeds (paste **full file contents** in SQL Editor, or `psql -f`):

1. `supabase/seeds/stuwo_vienna.sql`
2. `supabase/seeds/oead_vienna.sql`
3. `supabase/seeds/home4students_vienna.sql`

---

## Part C — Optional seeds

| File | Purpose |
|------|---------|
| `ojab_vienna.sql` | +15 ÖJAB dorms (no scraper yet) |
| `ojab_dorm_images.sql` | ÖJAB hero thumbnails |
| `dorm_images.sql` | Card hero images (all providers) |
| `dorm_image_galleries.sql` | Detail-page carousel (OeAD) |

---

## Verify

```sql
SELECT count(*) AS mapped FROM public.dorms WHERE lat IS NOT NULL;
-- Expected: ~49 (or ~64 with ÖJAB)

SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'cron_runs'
);
-- Expected: true
```

Then open [dormra.eu/dorms](https://dormra.eu/dorms) → map view → pins should appear.

---

## Next steps

[`YOUR_TODO.md`](./YOUR_TODO.md) — cron-job.org, auth URLs, RLS smoke test, Resend domain.
