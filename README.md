# Dormra

> Student housing aggregator for Vienna — finding a dorm room shouldn't require checking 8 websites every day.

[dormra.eu](https://dormra.eu)

## What it does

Dormra aggregates real-time dorm availability across all major Vienna student housing providers (OeAD, STUWO, home4students, ÖJAB, Akademikerhilfe, WIHAST, Viennabase, The Fizz, and more) into one searchable directory. Users filter by budget, district, deposit, and amenities, get instant email or Telegram alerts when matching rooms become available, and track their applications through a personal kanban.

## Why it exists

Vienna has 70+ dorm buildings across 8+ providers. Each has its own website, its own application process, and its own availability calendar. International students arriving for the first time face a fragmented, multilingual, scam-prone market with no aggregator. Rooms appear and disappear within hours during peak intake (August–October). Dormra fixes this with automated availability monitoring and smart alerts.

## How it works

Scrapers visit each provider's website every 15 minutes and extract availability data into Supabase. A diff engine compares each new snapshot to the previous one — if availability changed, it triggers an alert. The alert dispatcher matches the change against every user's saved criteria and sends notifications via email or Telegram.

## Tech stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Database & Auth**: Supabase (PostgreSQL, EU region)
- **Styling**: Tailwind CSS
- **Scraping**: Cheerio for static sites, Playwright for JavaScript-rendered pages (OeAD)
- **Cron**: cron-job.org running every 15 minutes
- **Email**: Resend
- **Notifications**: Telegram Bot API
- **Payments**: Stripe
- **Hosting**: Vercel

## Status

Currently in development. Targeting launch for the August 2026 intake season.

## Roadmap

- **Phase 1** (current): Vienna dorm directory + alerts + tracker
- **Phase 2**: Apartment listings for students who don't get a dorm
- **Phase 3**: Expand to Graz, Salzburg, Innsbruck, Linz
- **Phase 4**: Berlin, Munich, Prague, Amsterdam
- **Phase 5**: Universal application layer — apply to any dorm directly through Dormra

## Project structure

The app/ directory contains pages and API routes, lib/ holds shared utilities (Supabase client, diff engine, alert dispatchers), scrapers/ contains one scraper file per provider, and public/ holds static assets.

## Local development

Requires Node.js 21+ and a Supabase project.
