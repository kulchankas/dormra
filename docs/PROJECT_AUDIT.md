# Dormra Project Audit & Roadmap

Last updated: 2026-07-04 (full project audit — post PR #54)

## Executive summary

Dormra is a well-structured beta with a proven scraper → snapshot → diff → alert pipeline, honest README about planned features, solid RLS policy design, and unusually polished UI for the stage. **Production cron code works** (split jobs, Playwright on Vercel); the product is **feature-rich on the frontend** (map, galleries, saved dorms, application tracker, alert UX) but still **Phase 1 operationally** because the scheduler, auth URLs, and several migrations may not be applied in production yet.

**Health check (2026-07-04, `main` @ 3b4a209):**

| Area | Status |
|------|--------|
| Tests | ✅ **98 / 98** pass (20 files) |
| Lint | ✅ 0 errors, 3 warnings (unused vars) |
| Typecheck | ✅ Clean |
| Build | ✅ Succeeds locally |
| CI | ✅ lint + typecheck + test + build on push/PR |
| Scrapers registered | **3 / 9** (OeAD, home4students, STUWO) |
| Dorms with live scrapers | **49** (26 + 11 + 12) |
| Dorms seeded (no scraper) | **+15 ÖJAB** (seed file; apply manually) |
| Migrations in repo | **9** |
| Phase | **Phase 1** — prove the loop (7-day clean cron not met) |

**Latest merged work (PRs #47–#54):** sign-out fix, alert UX + welcome digest + `alert_id` dedup, admin cron run log, saved dorms + application tracker, dorm detail enrichment (gallery, JSON-LD, map), Google OAuth hardening, nightly agent queue + ÖJAB seed + operator docs.

**Primary blockers:** operator tasks — enable cron-job.org, fix Supabase auth URLs, apply pending migrations, RLS smoke test, Resend domain verify. See [`YOUR_TODO.md`](./YOUR_TODO.md).

---

## Phase 1 — Critical (fix immediately)

| # | Issue | Status | Notes |
|---|--------|--------|-------|
| 1.1 | **RLS not verified in production** | Manual | Anon smoke test — [`MANUAL_TASKS.md`](./MANUAL_TASKS.md) §1.1 |
| 1.2 | **Password reset broken** | ✅ Done | `/reset-password` page + callback recovery redirect |
| 1.3 | **Cron auth fails open** if `CRON_SECRET` unset | ✅ Done | `lib/cron-auth.ts` fail-closed + timing-safe compare |
| 1.4 | **No server-side alert validation** | ✅ Done | `lib/alert-schema.ts` + server actions |
| 1.5 | **Cron 504 on full scrape** | ✅ Done | PR #39 split by provider + batch; 3 cron-job.org jobs |
| 1.6 | **No E2E alert test route** | ✅ Done | `GET /api/test-alert` (CRON_SECRET auth) |
| 1.7 | **No account settings / delete** | ✅ Done | `/dashboard/settings` — password, export, delete |
| 1.8 | **Cron scheduler not enabled** | Manual | Endpoint verified 200; cron-job.org jobs still off |
| 1.9 | **Supabase Site URL still localhost** | Manual | Breaks OAuth, magic link, password reset in prod |
| 1.10 | **Pending prod migrations** | Manual | `cron_runs`, `alert_log.alert_id`, `dorm_images`, coordinates — build logs show `cron_runs` missing |

## Phase 2 — High (fix soon)

| # | Issue | Status | Notes |
|---|--------|--------|-------|
| 2.1 | **Snapshot query scales poorly** | ✅ Done | `get_latest_snapshots` RPC + 30-day prune |
| 2.2 | **home4students 11× duplicate fetches** | ✅ Done | `ScrapeHtmlCache` shared per cron run |
| 2.3 | **Alert matching loads all alerts** | ✅ Done | SQL pre-filters in `matchAlertsForDorm` |
| 2.4 | **Email dedup race** | ✅ Done | Weekly unique index on `alert_log` |
| 2.5 | **Resend sandbox sender** | Manual | See [`MANUAL_TASKS.md`](./MANUAL_TASKS.md) §4 |
| 2.6 | **No snapshot retention** | ✅ Done | `prune_old_snapshots` in cron |
| 2.7 | **CI missing env vars** | ✅ Done | Full placeholder env in CI build |
| 2.8 | **Test gaps** (diff, email, auth) | ✅ Done | `sendAlertsForDorm`, auth callback, cron-auth tests |
| 2.9 | **Google OAuth shows when disabled** | ✅ Done | PR #52 — `fetchAuthProviders()` + admin auth status widget |
| 2.10 | **Sign-out unreliable** | ✅ Done | PR #47 — `SignOutButton` + server action with global scope |
| 2.11 | **alert_log dedup per user+dorm only** | ✅ Done | PR #48 — `alert_id` column + per-alert weekly index |
| 2.12 | **No cron run history in admin** | ✅ Done | PR #48 — `cron_runs` table + admin widget |

## Phase 3 — Medium (quality & UX)

| # | Issue | Status | Notes |
|---|--------|--------|-------|
| 3.1 | Hero `moveIn` param doesn't filter | Open | No scraped move-in dates — banner + alert CTA; matching deferred |
| 3.2 | `move_in_before` not matched | Open | Documented; field stored for future use |
| 3.3 | Hardcoded English in helpers | ✅ Done | `lib/i18n-labels.ts` + DistrictGrid |
| 3.4 | Inactive dorms reachable by URL | ✅ Done | Detail page checks `active = true` |
| 3.5 | `/dorms` Suspense ineffective | ✅ Done | Data fetch in async `DormsContent` child |
| 3.6 | No branded error/404 pages | ✅ Done | `[locale]/error.tsx` + `not-found.tsx` |
| 3.7 | No dashboard loading skeletons | ✅ Done | `dashboard/loading.tsx` + alerts + saved |
| 3.8 | Legacy `lib/supabase.ts` singleton | ✅ Done | Availability uses server client |
| 3.9 | Hand-maintained DB types | ✅ Done | Synced with migrations |
| 3.10 | No sitemap/robots.txt | ✅ Done | `app/sitemap.ts`, `app/robots.ts` |
| 3.11 | Auth guard per-page not centralized | ✅ Done | Middleware redirects `/dashboard/*` |
| 3.12 | Sign-out POST CSRF | ✅ Done | `signOutAction` server action |
| 3.13 | Sort `<Select>` showed raw value | ✅ Done | `sortLabels` lookup in `DormsDirectory` |
| 3.14 | `formatDistrictLabel` hardcoded English | ✅ Done | Resolved by 3.3 |
| 3.15 | `/dorms` has no Supabase error fallback | ✅ Done | Branded retry UI on fetch failure |
| 3.16 | Alert list match count buried | ✅ Done | PR #48 — availability-aware stat + post-create banner |
| 3.17 | Browse→create prefill incomplete | ✅ Done | pets, couples, maxDeposit from URL |
| 3.18 | Sign-out broken in desktop menu | ✅ Done | PR #47 |
| 3.19 | No welcome email on alert create | ✅ Done | PR #48 — digest when matches available now |
| 3.20 | Dashboard "coming soon" cards dominate | ✅ Done | PR #49 — saved dorms + tracker now live |
| 3.21 | Dorm detail page thin | ✅ Done | PR #50 — gallery, universities, JSON-LD, last-checked, save button |
| 3.22 | Map layout poor on mobile | ✅ Done | PR #50 — visible by default, fullscreen on mobile |
| 3.23 | Header email link doesn't open dashboard | ✅ Done | PR #54 — avatar links to `/dashboard` |
| 3.24 | Apply-through-Dormra not feasible | ✅ Documented | `docs/APPLY_FLOW.md`; in-app tracker instead |
| 3.25 | Community reviews ("Grapevine") | ⏳ Branch only | `cursor/dorm-community-reviews-fc38` — not merged |

## Phase 4 — Low (polish)

| # | Issue | Notes |
|---|--------|-------|
| 4.1 | ScanningPill is cosmetic | ✅ Done | `ScanningPillServer` + real `lastScrapedAt` |
| 4.2 | Bot UA points to `/about` | ✅ Done | Now `/how-it-works` |
| 4.3 | Skip-to-content link | ✅ Done | i18n label + `#main-content` target |
| 4.4 | No local Supabase config | ✅ Done | `supabase/config.toml` |
| 4.5 | Lint warnings (unused vars) | Open | 3 warnings in `alert-welcome-digest`, `middleware`, `oead` scraper |
| 4.6 | Telegram notifications | Open | UI field disabled; no dispatcher — ship or strip |
| 4.7 | ÖJAB dorms listed but no scraper | Open | 15 dorms seeded; availability stays `unknown` until Phase 2 |

---

## Coverage & data inventory

### Scrapers (3 / 9 registered)

| Provider | Scraper | Dorms | Browser | Status |
|----------|---------|-------|---------|--------|
| OeAD | `scrapers/oead.ts` | 26 | Playwright | ✅ Live |
| home4students | `scrapers/home4students.ts` | 11 | Cheerio | ✅ Live |
| STUWO | `scrapers/stuwo.ts` | 12 | Cheerio | ✅ Live |
| ÖJAB | — | 15 (seed) | — | ⏳ Seed only, no scraper |
| WIHAST, others | — | — | — | ❌ Not started |

**Phase 2 gate:** do not register new scrapers until Phase 1 metric (7-day clean cron, zero false/missed alerts).

### Seeds & migrations

Apply in order (see [`README.md`](../README.md) for full list):

1. `00000000000000_schema.sql` — baseline
2. `20260605120000_enable_rls.sql` — **must be applied in prod**
3. `20260701120000_user_alerts_locale.sql`
4. `20260701130000_snapshot_rpc_and_retention.sql`
5. `20260701140000_alert_log_dedup.sql`
6. `20260702150000_dorm_coordinates.sql` — map + near-me
7. `20260702160000_dorm_images.sql` — photo galleries
8. `20260702220000_cron_runs.sql` — admin cron widget
9. `20260702220100_alert_log_alert_id.sql` — per-alert dedup

Seeds: `oead_vienna.sql`, `stuwo_vienna.sql`, `home4students_vienna.sql`, `ojab_vienna.sql`, `dorm_image_galleries.sql`

---

## Agent schedule (post-audit 2026-07-04)

Priority order — **do not start Phase 2 scrapers until Phase 1 metric met.**

| Priority | Task | Rationale | Status |
|----------|------|-----------|--------|
| P0 | Operator: enable cron + auth URLs | Blocks Phase 1 | ⬜ Manual |
| P0 | Operator: apply migrations 6–9 | Admin widget, galleries, dedup | ⬜ Manual |
| P1 | Verify h4s attribution in `/admin` | Trust after cron live | ⏳ After cron |
| P1 | ÖJAB scraper | 15 dorms already seeded | **Hold** — Phase 2 gate |
| P2 | Community reviews merge decision | Branch exists | ⏳ Review PR scope |
| P2 | Telegram ship or strip | UI only today | Open |
| P2 | `move_in_before` matching | When provider data exists | Open |
| P3 | Lint warning cleanup | 3 unused vars | Low effort |

**Your manual schedule (parallel):**

| When | Task |
|------|------|
| **Today** | Enable 3 cron-job.org jobs; fix Supabase Site URL |
| **Today** | Apply migrations 6–9 + ÖJAB seed if not done |
| **Today** | Rotate secrets if exposed; RLS smoke test |
| **This week** | Resend domain verify; end-user smoke tests |
| **Day 1–7 after cron** | Watch `/admin` for false/missed alerts |
| **Day 7** | Declare Phase 1 done or file bugs |

Nightly agent queue: [`AGENT_QUEUE.md`](./AGENT_QUEUE.md)

---

## Architecture reference

```
cron-job.org (3 jobs)
  → GET /api/cron/scrape?providers=stuwo,home4students&prune=1
  → GET /api/cron/scrape?provider=oead&batch=0|1&batches=2
  → scrapers (OeAD/Playwright, STUWO, home4students/Cheerio)
  → processSnapshot() → availability_snapshots
  → on false→true: matchAlertsForDorm() → sendAvailabilityAlert() → alert_log

Users → Next.js [locale] → Supabase (RLS) → user_alerts, dorms, tracker
Operator → GET /api/test-alert?slug=…&dryRun=1|email=…
         → /admin (dorm health, email log, cron runs, auth status)
```

## Environment checklist

| Variable | Required | In .env.example |
|----------|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | ✅ |
| `CRON_SECRET` | Yes | ✅ |
| `RESEND_API_KEY` | Yes | ✅ |
| `RESEND_FROM` | After domain verify | ✅ |
| `NEXT_PUBLIC_SITE_URL` | Recommended | ✅ |
| `ADMIN_EMAILS` | Admin dashboard | ✅ |

## Test coverage summary

| Module | Tests | Notes |
|--------|-------|-------|
| Scrapers (oead, stuwo, h4s) | 12 | HTML fixture parsing |
| Alert pipeline (diff, match, schema) | 18 | Dedup, sendAlerts edge cases |
| Cron (auth, params, route) | 16 | Fail-closed, batch params |
| Auth (callback, actions, providers) | 10 | OAuth redirect, sign-out |
| Filters, tracker, universities | 26 | URL params, status transitions |
| Admin auth | 4 | Email gate |

**Gaps:** no integration test against live Supabase; welcome digest untested; E2E via `/api/test-alert` is the production smoke path.

**Manual steps:** [`MANUAL_TASKS.md`](./MANUAL_TASKS.md)

---

## Implementation log

| Date | Branch / PR | Work |
|------|-------------|------|
| 2026-07-01 | `cursor/project-audit-5868` | Admin dashboard, RLS, snapshot RPC, i18n |
| 2026-07-02 | PR #39 | Cron split by provider |
| 2026-07-02 | PR #40 | `/api/test-alert` route |
| 2026-07-02 | `cursor/add-dorms-map-and-filters-fc38` | Map view + geocoded coordinates |
| 2026-07-02 | `cursor/saved-dorms-tracker-fc38` → PR #49 | Saved dorms + application tracker |
| 2026-07-02 | `cursor/dorms-pages-improvements-fc38` → PR #50 | Gallery, JSON-LD, map layout, save button |
| 2026-07-02 | `cursor/fix-sign-out-5868` → PR #47 | Sign-out fix |
| 2026-07-02 | `cursor/alert-system-5868` → PR #48 | Alert UX, welcome digest, alert_id dedup, cron_runs |
| 2026-07-03 | PR #52 | Google OAuth provider detection + callback hardening |
| 2026-07-03 | PR #53–54 | Agent queue doc + nightly UX (header, filters, ÖJAB seed, docs) |
| 2026-07-04 | `cursor/full-project-audit-5868` | Full project audit refresh (this doc) |

**Open branch (not merged):** `cursor/dorm-community-reviews-fc38` — community reviews / "Grapevine"
