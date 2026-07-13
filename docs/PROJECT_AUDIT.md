# Dormra Project Audit & Roadmap

Last updated: 2026-07-13 (audit refresh + PR #61 work in progress)

## Executive summary

Dormra is a polished beta with proven scrape → diff → alert pipeline, 4 locales (en/de/ru/uk), custom Vienna map, saved-dorm tracker with auto-apply, and rich dorm directory. **Still Phase 1 operationally** — cron scheduler, auth URLs, and prod migrations may remain incomplete.

**Health check (2026-07-13, `main` @ e0b1417 + PR #61 branch):**

| Area | Status |
|------|--------|
| Tests | ✅ **105+** pass |
| Build / lint | ✅ Clean |
| Scrapers | **3/11** live |
| Locales | en, de, ru, **uk** |
| Phase | **Phase 1** — 7-day clean cron not met |

**Recent merges (#58–59):** custom brand map, dorm page overhaul, auto-track on Apply, dorm card refresh, Ukrainian locale, 8 websites/11 providers copy, ÖJAB image seed.

**In PR #61:** saved-dorm availability emails, stale-applied nudges, Telegram UI strip, audit doc refresh.

**Primary blockers:** operator — cron-job.org, Supabase auth URLs, migrations/seeds. See [`YOUR_TODO.md`](./YOUR_TODO.md) · [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md).

---

## Phase 1 — Critical (fix immediately)

| # | Issue | Status | Notes |
|---|--------|--------|-------|
| 1.1 | **RLS not verified in production** | Manual | Anon smoke test — [`MANUAL_TASKS.md`](./MANUAL_TASKS.md) §1.1 |
| 1.5 | **Cron 504 on full scrape** | ✅ Done | PR #39 split by provider + batch; 3 cron-job.org jobs |
| 1.6 | **No E2E alert test route** | ✅ Done | `GET /api/test-alert` (CRON_SECRET auth) |
| 1.7 | **No account settings / delete** | ✅ Done | `/dashboard/settings` — password, export, delete |
| 1.2 | **Password reset broken** | ✅ Done | `/reset-password` page + callback recovery redirect |
| 1.3 | **Cron auth fails open** if `CRON_SECRET` unset | ✅ Done | `lib/cron-auth.ts` fail-closed + timing-safe compare |
| 1.4 | **No server-side alert validation** | ✅ Done | `lib/alert-schema.ts` + server actions |

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

## Phase 3 — Medium (quality & UX)

| # | Issue | Status | Notes |
|---|--------|--------|-------|
| 3.1 | Hero `moveIn` param doesn't filter | Open | No scraped move-in dates — banner + alert CTA; matching deferred |
| 3.2 | `move_in_before` not matched | Open | Documented; field stored for future use |
| 3.16 | Alert list match count buried | ✅ Done | Availability-aware stat + post-create banner |
| 3.17 | Browse→create prefill incomplete | ✅ Done | pets, couples, maxDeposit from URL |
| 3.18 | Sign-out broken in desktop menu | ✅ Done | SignOutButton + settings sign-out |
| 3.19 | alert_log dedup per user+dorm only | ✅ Done | `alert_id` column + per-alert weekly index |
| 3.20 | No cron run history in admin | ✅ Done | `cron_runs` table + admin widget |
| 3.21 | No welcome email on alert create | ✅ Done | Digest when matches available now |
| 3.3 | Hardcoded English in helpers | ✅ Done | `lib/i18n-labels.ts` + DistrictGrid |
| 3.4 | Inactive dorms reachable by URL | ✅ Done | Detail page checks `active = true` |
| 3.5 | `/dorms` Suspense ineffective | ✅ Done | Data fetch in async `DormsContent` child |
| 3.6 | No branded error/404 pages | ✅ Done | `[locale]/error.tsx` + `not-found.tsx` |
| 3.7 | No dashboard loading skeletons | ✅ Done | `dashboard/loading.tsx` + alerts |
| 3.8 | Legacy `lib/supabase.ts` singleton | ✅ Done | Availability uses server client |
| 3.9 | Hand-maintained DB types | ✅ Done | Synced with migrations (locale, RPC functions) |
| 3.10 | No sitemap/robots.txt | ✅ Done | `app/sitemap.ts`, `app/robots.ts` |
| 3.11 | Auth guard per-page not centralized | ✅ Done | Middleware redirects `/dashboard/*` |
| 3.12 | Sign-out POST CSRF | ✅ Done | `signOutAction` server action |
| 3.13 | Sort `<Select>` showed raw value (`price_asc`) instead of label | ✅ Done | Base UI's `Select.Value` needs an `items`/function-child lookup — see `docs/UI_UX_AUDIT.md` F1 |
| 3.14 | `formatDistrictLabel`/`formatPriceLabel` hardcoded English (dupes 3.3, UI-focused) | ✅ Done | Resolved by 3.3 (`lib/i18n-labels.ts`) |
| 3.15 | `/dorms` has no Supabase error fallback | ✅ Done | Branded retry UI on fetch failure |

## Phase 4 — Low (polish)

| # | Issue | Notes |
|---|--------|-------|
| 4.1 | ScanningPill is cosmetic | ✅ Done | `ScanningPillServer` + real `lastScrapedAt` |
| 4.2 | Bot UA points to `/about` | ✅ Done | Now `/how-it-works` |
| 4.3 | Skip-to-content link | ✅ Done | i18n label + `#main-content` target |
| 4.4 | No local Supabase config | ✅ Done | `supabase/config.toml` |
| 4.5 | Telegram UI misleading | ⏳ PR #61 | Strip disabled toggle |
| 4.6 | Stale applied tracker nudges | ⏳ PR #61 | Banner on `/dashboard/saved` after 14 days |
| 4.7 | Saved-dorm opening emails | ⏳ PR #61 | `saved_dorm` channel on false→true |

---

## Agent schedule (post-audit 2026-07-13)

| Priority | Task | Status |
|----------|------|--------|
| P0 | Operator: cron + auth URLs + migrations | ⬜ Manual |
| P1 | Saved-dorm availability emails | ⏳ PR #61 |
| P1 | Stale applied tracker nudges | ⏳ PR #61 |
| P1 | Verify h4s attribution in `/admin` | After cron live |
| P2 | Audit docs + Supabase setup guide | ⏳ PR #61 |
| P2 | Community reviews branch | Hold post-Phase 1 |
| Hold | ÖJAB scraper | Phase 2 gate |

**Your manual schedule (parallel):**

| When | Task |
|------|------|
| **Today** | Enable 3 cron-job.org jobs; fix Supabase Site URL |
| **Today** | Rotate secrets if exposed; RLS smoke test |
| **This week** | Resend domain verify; end-user smoke tests |
| **Day 1–7 after cron** | Watch `/admin` for false/missed alerts |
| **Day 7** | Declare Phase 1 done or file bugs |

---

## Architecture reference

```
cron-job.org (3 jobs)
  → GET /api/cron/scrape?providers=stuwo,home4students&prune=1
  → GET /api/cron/scrape?provider=oead&batch=0|1&batches=2
  → scrapers (OeAD/Playwright, STUWO, home4students/Cheerio)
  → processSnapshot() → availability_snapshots
  → on false→true: matchAlertsForDorm() → sendAvailabilityAlert() → alert_log
              → sendSavedDormNotifications() → saved_dorm channel

Users → Next.js [locale] → Supabase (RLS) → user_alerts, dorms
Operator → GET /api/test-alert?slug=…&dryRun=1|email=…
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

## Migrations checklist

1. `00000000000000_schema.sql` — baseline
2. `20260605120000_enable_rls.sql` — **must be applied in prod**
3. `20260701120000_user_alerts_locale.sql` — alert email locale
4. `20260701130000_snapshot_rpc_and_retention.sql` — RPC + prune
5. `20260701140000_alert_log_dedup.sql` — weekly dedup index
6. `20260702220000_cron_runs.sql` — cron job run log
7. `20260702220100_alert_log_alert_id.sql` — per-alert dedup

**Manual steps:** [`MANUAL_TASKS.md`](./MANUAL_TASKS.md)

---

## Implementation log

| Date | Branch | Work |
|------|--------|------|
| 2026-07-01 | `cursor/project-audit-5868` | Admin dashboard `/admin`, MONITORING.md, ADMIN_EMAILS gate |
| 2026-07-01 | `cursor/project-audit-5868` | sendAlerts + auth callback tests, skip-link i18n |
| 2026-07-01 | `cursor/project-audit-5868` | Phase 3.5, 3.12, 4.1, 4.4, LAUNCH_CHECKLIST, cron-auth tests |
| 2026-07-01 | `cursor/project-audit-5868` | Phase 2.1–2.4, 2.6, 3.3, 3.7–3.11, 4.3, MANUAL_TASKS.md |
| 2026-07-01 | `cursor/project-audit-5868` | Phase 1.2–1.4, 2.2, 2.7, 3.4, 3.6, 4.2, audit doc, README |
| 2026-07-01 | `cursor/i18n-de-ru-5868` | Full i18n stages 1–5, typography, language switcher |
| 2026-07-02 | `cursor/ux-polish-next-5868` | H3 dorms error UI, M1/M2/M6 UX, mobile admin, slug loading, RESEND_FROM |
| 2026-07-02 | `main` | PR #33–37 ops fixes (proxy, Playwright, Chromium pack) |
| 2026-07-02 | `cursor/cron-split-providers-5868` | PR #39 cron split; setup-cron-jobs.sh; MONITORING docs |
| 2026-07-02 | `cursor/test-alert-and-docs-5868` | `/api/test-alert`; manual tasks + strategy audit refresh |
| 2026-07-02 | `cursor/alert-system-5868` | Alert UX, sign-out, welcome digest, alert_id dedup, cron_runs admin |
| 2026-07-02 | `cursor/mobile-ux-polish-fc38` | Mobile layout/a11y/touch bugs across auth, nav, dorms, DormCard |
| 2026-07-02 | `cursor/add-dorms-map-and-filters-fc38` | `/dorms` map view + geocoded coordinates; rent range, short-stay, near-me filters |
| 2026-07-02 | `cursor/fix-admin-purity-lint-fc38` | Fixed `main` CI break from PR #42 (Date.now in render) |
| 2026-07-02 | `cursor/saved-dorms-tracker-fc38` | Saved dorms + status tracker — bookmark toggle, `/dashboard/saved` |
| 2026-07-02 | `cursor/dorms-pages-improvements-fc38` | Photo gallery, university proximity, save button, JSON-LD, map layout overhaul |
| 2026-07-05 | PR #58 | Custom Vienna map + dorm page UI overhaul |
| 2026-07-05 | PR #59 | Auto-track on Apply, dorm cards, Ukrainian locale, ÖJAB images, housing strategy doc |
| 2026-07-13 | PR #61 (pending) | Saved-dorm emails, stale tracker nudges, Telegram strip, audit refresh |
