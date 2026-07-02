# Dormra Project Audit & Roadmap

Last updated: 2026-07-01

## Executive summary

Dormra is a well-structured beta: clear scraper → snapshot → diff → alert pipeline, honest README about planned features, and solid RLS policy design. Main risks are **operational** (RLS applied in prod?, env vars set?, email domain verified?) and **a few broken/incomplete user flows** (password reset). Scale issues (snapshot growth, alert matching) matter before traffic grows.

---

## Phase 1 — Critical (fix immediately)

| # | Issue | Status | Notes |
|---|--------|--------|-------|
| 1.1 | **RLS not verified in production** | Manual | Run `20260605120000_enable_rls.sql` on prod; confirm anon key cannot read/write all rows |
| 1.2 | **Password reset broken** | ✅ Done | `/reset-password` page + callback recovery redirect |
| 1.3 | **Cron auth fails open** if `CRON_SECRET` unset | ✅ Done | `lib/cron-auth.ts` fail-closed + timing-safe compare |
| 1.4 | **No server-side alert validation** | ✅ Done | `lib/alert-schema.ts` + server actions |

## Phase 2 — High (fix soon)

| # | Issue | Status | Notes |
|---|--------|--------|-------|
| 2.1 | **Snapshot query scales poorly** | Planned | `getAvailabilityStatusBulk` fetches all rows; add RPC + retention |
| 2.2 | **home4students 11× duplicate fetches** | ✅ Done | `ScrapeHtmlCache` shared per cron run |
| 2.3 | **Alert matching loads all alerts** | Planned | Push filters to SQL |
| 2.4 | **Email dedup race** | Planned | Check-then-insert; add transactional guard |
| 2.5 | **Resend sandbox sender** | Manual | Verify `dormra.eu` domain |
| 2.6 | **No snapshot retention** | Planned | Table grows ~5k rows/day |
| 2.7 | **CI missing env vars** | ✅ Code | Build may miss env-dependent failures |
| 2.8 | **Test gaps** (diff, email, auth) | Planned | Add integration tests |

## Phase 3 — Medium (quality & UX)

| # | Issue | Status | Notes |
|---|--------|--------|-------|
| 3.1 | Hero `moveIn` param doesn't filter | Open | Banner says "not live yet" — OK for beta |
| 3.2 | `move_in_before` not matched | Open | Documented; hide field when ready |
| 3.3 | Hardcoded English in helpers | Planned | `formatDistrictLabel`, `formatPriceLabel`, DistrictGrid |
| 3.4 | Inactive dorms reachable by URL | ✅ Code | Detail page didn't check `active` |
| 3.5 | `/dorms` Suspense ineffective | ✅ Done | Data fetch moved into async child rendered inside `<Suspense>` |
| 3.6 | No branded error/404 pages | ✅ Code | Generic Next.js fallbacks |
| 3.7 | No dashboard loading skeletons | Open | `/dashboard`, `/dashboard/alerts`, `/dorms/[slug]` still have none — see `docs/UI_UX_AUDIT.md` M4 |
| 3.8 | Legacy `lib/supabase.ts` singleton | Planned | Pass server client everywhere |
| 3.9 | Hand-maintained DB types | Open | Regenerate via Supabase CLI |
| 3.10 | No sitemap/robots.txt | Planned | SEO for dorm slugs |
| 3.11 | Auth guard per-page not centralized | Planned | Middleware for `/dashboard/*` |
| 3.12 | Sign-out POST CSRF | Low | Use server action instead |
| 3.13 | Sort `<Select>` showed raw value (`price_asc`) instead of label | ✅ Done | Base UI's `Select.Value` needs an `items`/function-child lookup — see `docs/UI_UX_AUDIT.md` F1 |
| 3.14 | `formatDistrictLabel`/`formatPriceLabel` hardcoded English (dupes 3.3, UI-focused) | Open | See `docs/UI_UX_AUDIT.md` H1 |
| 3.15 | `/dorms` has no Supabase error fallback | Open | See `docs/UI_UX_AUDIT.md` H3 |

## Phase 4 — Low (polish)

| # | Issue | Notes |
|---|--------|-------|
| 4.1 | ScanningPill is cosmetic | Show real last-scrape time — see `docs/UI_UX_AUDIT.md` H2 |
| 4.2 | Bot UA points to `/about` | ✅ Done | Now `/how-it-works` |
| 4.3 | Skip-to-content link | ✅ Done | `sr-only focus:not-sr-only` link + `#main-content` target |
| 4.4 | No local Supabase config | Add `supabase/config.toml` |

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
| `NEXT_PUBLIC_SITE_URL` | Recommended | ✅ |

## Migrations checklist

1. `00000000000000_schema.sql` — baseline
2. `20260605120000_enable_rls.sql` — **must be applied in prod**
3. `20260701120000_user_alerts_locale.sql` — alert email locale

---

## Implementation log

| Date | Branch | Work |
|------|--------|------|
| 2026-07-01 | `cursor/project-audit-5868` | Phase 1.2–1.4, 2.2, 2.7, 3.4, 3.6, 4.2, audit doc, README |
| 2026-07-01 | `cursor/i18n-de-ru-5868` | Full i18n stages 1–5, typography, language switcher |
| 2026-07-02 | `cursor/ui-ux-audit-fc38` | UI/UX audit (`docs/UI_UX_AUDIT.md`); fixed 3.5, 3.13, 4.3, DistrictGrid i18n + touch targets, how-it-works CTA sizing |
