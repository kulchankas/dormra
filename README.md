# Dormra

> Student housing aggregator for Vienna — finding a dorm room shouldn't require checking 8 websites every day.

[dormra.eu](https://dormra.eu)

## What it does

Dormra aggregates dorm availability across Vienna student housing providers into one searchable directory. Users filter by budget, district, deposit, and amenities, and get email alerts when matching rooms become available.

## Implemented vs planned

| Feature | Status | Notes |
|---------|--------|-------|
| Dorm directory + filters | ✅ Live | SSR at `/dorms`, shareable URL params |
| Email alerts | ✅ Live | Resend via `onboarding@resend.dev` until domain verified |
| OeAD scraper | ✅ Live | Playwright, 26 Vienna residences seeded |
| home4students scraper | ✅ Live | Cheerio |
| STUWO scraper | ✅ Live | Cheerio — category-level BOOK NOW detection |
| Other providers (ÖJAB, WIHAST, …) | ❌ Not started | No scraper registered yet |
| Telegram notifications | ❌ UI only | Form field disabled; no dispatcher |
| Application tracker (kanban) | ❌ UI only | Dashboard card shows "Coming soon" |
| `move_in_before` alert matching | ❌ Not matched | Stored in DB + shown in UI; providers don't expose move-in dates in scraped data |
| Stripe payments | ❌ Not started | — |

## Why it exists

Vienna has 70+ dorm buildings across 8+ providers. Each has its own website, application process, and availability calendar. Rooms appear and vanish within hours during peak intake (August–October). Dormra watches them so you don't have to.

## How it works

Scrapers visit each provider's website every 15 minutes and write availability snapshots to Supabase. A diff engine compares each new snapshot to the previous one — on a newly-available transition, it matches active user alerts and sends email via Resend.

## Tech stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Database & Auth**: Supabase (PostgreSQL, EU region)
- **Styling**: Tailwind CSS + shadcn/ui
- **Scraping**: Cheerio (static), Playwright (OeAD)
- **Cron**: cron-job.org → `GET /api/cron/scrape` every 15 min
- **Email**: Resend
- **Hosting**: Vercel

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Browser + RSC reads (RLS-protected) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Cron scraper + alert dispatch (bypasses RLS) |
| `CRON_SECRET` | Yes | Bearer token for `/api/cron/scrape` |
| `RESEND_API_KEY` | Yes | Email alert delivery |

See `.env.example` for a copy-paste template.

## Database setup

```bash
# 1. Apply baseline schema (idempotent)
psql $DATABASE_URL -f supabase/migrations/00000000000000_schema.sql

# 2. Enable RLS policies
psql $DATABASE_URL -f supabase/migrations/20260605120000_enable_rls.sql

# 3. Seed dorm listings
psql $DATABASE_URL -f supabase/seeds/oead_vienna.sql
psql $DATABASE_URL -f supabase/seeds/stuwo_vienna.sql
psql $DATABASE_URL -f supabase/seeds/home4students_vienna.sql
psql $DATABASE_URL -f supabase/seeds/dorm_images.sql
```

Regenerate TypeScript types after schema changes:

```bash
npx supabase gen types typescript --project-id <ref> > lib/database.types.ts
```

## Local development

Requires Node.js 21+ and a Supabase project.

```bash
cp .env.example .env.local   # fill in values
npm install
npm run dev
```

## Cron

Point cron-job.org at:

```
GET https://dormra.eu/api/cron/scrape
Authorization: Bearer $CRON_SECRET
```

Every 15 minutes. Response JSON includes `scraped`, `errors`, `skipped`, and per-provider breakdown.

## Project structure

```
app/          Pages + API routes (App Router)
lib/          Supabase clients, diff engine, alert matching, types
scrapers/     One scraper per provider + registry in index.ts
supabase/     Migrations + seed SQL
```

## Roadmap

- **Phase 1** (current): Vienna dorm directory + email alerts
- **Phase 2**: Apartment listings
- **Phase 3**: Graz, Salzburg, Innsbruck, Linz
- **Phase 4**: Berlin, Munich, Prague, Amsterdam
- **Phase 5**: Universal application layer

## Status

Private beta — targeting August 2026 intake season.
