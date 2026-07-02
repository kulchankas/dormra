# Dormra Project Audit & Roadmap

Last updated: 2026-07-01

## Executive summary

Dormra is a well-structured beta: clear scraper → snapshot → diff → alert pipeline, honest README about planned features, and solid RLS policy design. Main risks are **operational** (RLS applied in prod?, env vars set?, email domain verified?) and **a few broken/incomplete user flows** (password reset). Scale issues (snapshot growth, alert matching) matter before traffic grows.

---

## Phase 1 — Critical (fix immediately)

| # | Issue | Status | Notes |
|---|--------|--------|-------|
| 1.1 | **RLS not verified in production** | Manual | See [`MANUAL_TASKS.md`](./MANUAL_TASKS.md) §1 |
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
| 3.1 | Hero `moveIn` param doesn't filter | Open | Banner says "not live yet" — OK for beta |
| 3.2 | `move_in_before` not matched | Open | Documented; hide field when ready |
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

---

## Architecture reference

```
cron-job.org → GET /api/cron/scrape
  → scrapers (OeAD/Playwright, STUWO, home4students/Cheerio)
  → processSnapshot() → availability_snapshots
  → on false→true: matchAlertsForDorm() → sendAvailabilityAlert() → alert_log

Users → Next.js [locale] → Supabase (RLS) → user_alerts, dorms
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
| 2026-07-02 | `main` | Admin dashboard merge, Vercel Analytics |
