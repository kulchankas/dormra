# Supabase setup guide

Step-by-step guide for applying migrations and seeds to your production Supabase project.

**Two ways to run SQL — pick one:**

| Method | When to use |
|--------|-------------|
| **SQL Editor** (recommended) | No terminal, no `psql` — copy file contents, paste, Run |
| **Terminal + `psql`** | You have the repo cloned and `DATABASE_URL` set |

Both do the same thing. **Do not mix `psql` shell commands into SQL Editor** — lines like `psql "$DATABASE_URL" -f …` only work in a terminal.

---

## Before you start

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project
2. Confirm baseline is already applied (you likely did this earlier):
   - `00000000000000_schema.sql`
   - `20260605120000_enable_rls.sql`
   - `20260701120000_user_alerts_locale.sql`
   - `20260701130000_snapshot_rpc_and_retention.sql`
   - `20260701140000_alert_log_dedup.sql`

If unsure, run the verification queries in [§ Verify](#verify) at the end.

---

## Part A — Migrations (required)

Run **in this order**, one file per query. Each file lives in `supabase/migrations/` in the repo.

### SQL Editor

1. **SQL Editor** → **New query**
2. Open the migration file in GitHub or your editor → select all → paste
3. Click **Run**
4. Repeat for each file below

### Terminal

```bash
cd /path/to/dormra
export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres"
```

Get the URI from Supabase → **Project Settings** → **Database** → **Connection string** (URI).

```bash
psql "$DATABASE_URL" -f supabase/migrations/20260702150000_dorm_coordinates.sql
psql "$DATABASE_URL" -f supabase/migrations/20260702160000_dorm_images.sql
psql "$DATABASE_URL" -f supabase/migrations/20260702220000_cron_runs.sql
psql "$DATABASE_URL" -f supabase/migrations/20260702220100_alert_log_alert_id.sql
```

| # | File | What it does |
|---|------|--------------|
| 1 | `20260702150000_dorm_coordinates.sql` | Adds `lat` / `lng` columns for the map |
| 2 | `20260702160000_dorm_images.sql` | Creates `dorm_images` table for photo galleries |
| 3 | `20260702220000_cron_runs.sql` | Cron job history for `/admin` widget |
| 4 | `20260702220100_alert_log_alert_id.sql` | Per-alert email dedup |

All migrations use `IF NOT EXISTS` / `IF NOT EXISTS` patterns — **safe to re-run**.

---

## Part B — Seeds (required for map)

After **step 1** (coordinates migration), re-run the three provider seeds. They upsert dorms by `slug` and **backfill `lat` / `lng`**.

### SQL Editor

Paste the **full contents** of each seed file (not `psql` commands):

| # | File | Dorms |
|---|------|-------|
| 1 | `supabase/seeds/stuwo_vienna.sql` | 12 |
| 2 | `supabase/seeds/oead_vienna.sql` | 26 |
| 3 | `supabase/seeds/home4students_vienna.sql` | 11 |

### Terminal

```bash
psql "$DATABASE_URL" -f supabase/seeds/stuwo_vienna.sql
psql "$DATABASE_URL" -f supabase/seeds/oead_vienna.sql
psql "$DATABASE_URL" -f supabase/seeds/home4students_vienna.sql
```

**Optional one-off fix** (if home4students scrape URL is wrong):

```sql
UPDATE public.dorms
SET scrape_url = 'https://www.home4students.at/en/vacancy/'
WHERE provider = 'home4students';
```

---

## Part C — Seeds (optional)

Run after Part A + B. Not launch-blocking.

| File | Purpose | Requires |
|------|---------|----------|
| `supabase/seeds/ojab_vienna.sql` | +15 ÖJAB dorms (no scraper yet) | coordinates migration |
| `supabase/seeds/dorm_images.sql` | Hero thumbnail on each dorm card | — |
| `supabase/seeds/dorm_image_galleries.sql` | Multi-photo carousel on detail page | `dorm_images` table migration + dorms exist |

### Terminal (optional)

```bash
psql "$DATABASE_URL" -f supabase/seeds/ojab_vienna.sql
psql "$DATABASE_URL" -f supabase/seeds/dorm_images.sql
psql "$DATABASE_URL" -f supabase/seeds/dorm_image_galleries.sql
```

---

## Verify

Run these in SQL Editor after Part A + B:

```sql
-- Map: how many dorms have coordinates?
SELECT count(*) AS mapped FROM public.dorms WHERE lat IS NOT NULL;
-- Expected: ~49 (or ~64 if you ran ÖJAB seed)

-- Any scraper dorms still missing coordinates?
SELECT slug, provider FROM public.dorms
WHERE lat IS NULL AND provider IN ('OeAD', 'STUWO', 'home4students');
-- Expected: 0 rows

-- Migrations applied?
SELECT column_name FROM information_schema.columns
WHERE table_name = 'dorms' AND column_name IN ('lat', 'lng');
-- Expected: lat, lng

SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'cron_runs'
) AS cron_runs_exists;
-- Expected: true

SELECT column_name FROM information_schema.columns
WHERE table_name = 'alert_log' AND column_name = 'alert_id';
-- Expected: alert_id
```

**Site check:** open [dormra.eu/dorms](https://dormra.eu/dorms) → switch to map view → pins should appear (not “No mapped locations”).

---

## Common mistakes

| Mistake | Fix |
|---------|-----|
| Pasting `psql "$DATABASE_URL" -f …` into SQL Editor | Use terminal for those lines, or paste the **file contents** instead |
| Running seeds before coordinates migration | Run migration #1 first, then seeds |
| Running `dorm_image_galleries.sql` before `dorm_images` migration | Run migration #2 first |
| Old hero image URLs from chat | Use `supabase/seeds/dorm_images.sql` from the repo (URLs may differ from older copies) |

---

## What’s next

After Supabase is done, continue with [`YOUR_TODO.md`](./YOUR_TODO.md):

1. Fix auth URLs (Site URL → `https://dormra.eu`)
2. Enable cron-job.org (3 jobs)
3. RLS smoke test
4. Resend domain verify

Full operator checklist: [`MANUAL_TASKS.md`](./MANUAL_TASKS.md)
