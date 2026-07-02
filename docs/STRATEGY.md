# Dormra Strategy

Living strategy doc. **Status column** reflects the repo and production as of 2026-07-02.  
Operator checklist: [`LAUNCH_CHECKLIST.md`](./LAUNCH_CHECKLIST.md)

---

## Core thesis

Vienna has multiple independent dormitory providers (OeAD, home4students, and others), each running their own siloed booking/availability system. No student-facing layer aggregates them. That gap is the entire business. The moat isn't the tech — it's **coverage**: being the only place a student can check every dorm's real-time availability in one search.

This means the strategy has to protect two things above all else:

1. **Data trust** — every alert must be correct
2. **Coverage breadth** — more scrapers = more defensible position

Everything else — design, branding, monetization — is secondary until those two are solid.

---

## Phase 1 — Prove the loop

**Goal:** one real student gets one real, correct alert.

**Success metric:** zero false alerts, zero missed alerts, across a full week of live cron runs.

### Plan vs status

| Item | Plan | Status | Notes |
|------|------|--------|-------|
| Merge `feature/wire-email-engine` | Stop branch divergence | ✅ **Done** | Branch fully absorbed into `main` (0 unique commits on `feature/wire-email-engine`) |
| End-to-end test via `/api/test-alert` | Real Supabase, not fixtures | ❌ **Not built** | No route exists; add when ops are stable |
| Fix hero search | Homepage must search | ⚠️ **Partial** | Budget + navigation work; `moveIn` param passed but **not filtered** on `/dorms` |
| Fix home4students shared-URL attribution | Wrong attribution kills trust | ⚠️ **Partial** | `ScrapeHtmlCache` dedupes fetches; per-slug keyword windows exist; **Döbling front/back share keywords** — needs live verification in `/admin` |
| Rotate exposed Resend key | Security hygiene | ⏳ **Manual** | Only if key was ever committed or leaked |
| Cron running every 15 min | Data stays fresh | ⚠️ **Deploying** | PR #33 merged; verify endpoint returns 401/200 (not 404), then re-enable cron-job.org |
| Auth flows (login, reset, Google) | Users can sign up | ⚠️ **Deploying** | `/auth/callback` fixed in PR #33; still need Supabase Site URL → `https://dormra.eu` |
| RLS + auth hardening | Before real users | ✅ **Done in code** | Migration applied; middleware guards `/dashboard` and `/admin` |
| Admin observability | Trust the data | ✅ **Done** | `/admin` — dorm health, email log, alert stats |

### Phase 1 verdict

**You are still in Phase 1.** The product demo exists; the **live loop is not proven** until cron runs for a week with correct alerts. Ops fixes (PR #33, cron-job.org, Supabase URLs) come before new features.

*Rationale:* Every week spent on design or naming instead of this is a week the core promise (accurate real-time alerts) stays unproven. Until this works, Dormra is a demo, not a product.

---

## Phase 2 — Widen the moat

**Goal:** go from 1 scraper to 9. Coverage is the product.

**Success metric:** a student can search *any* Vienna dorm and get a real answer, not "not yet supported."

### Plan vs status

| Item | Plan | Status | Notes |
|------|------|--------|-------|
| Scraper count | 9 providers | **3 / 9** | OeAD (26), home4students (11), STUWO — see `scrapers/index.ts` |
| Prioritize by bed-count | Biggest providers first | ⏳ **Not started** | ÖJAB, WIHAST, etc. have no scraper registered |
| Per-dorm “Alert me when this opens” | High-intent conversion | ✅ **Done** | `/dorms/[slug]` + directory link to `/dashboard/alerts/new?…` |
| Auth hardening + RLS | Before user data accumulates | ✅ **Done** | See Phase 1; verify anon smoke test in checklist |
| Snapshot scale + dedup | Trust at volume | ✅ **Done** | RPC latest snapshots, 30-day prune, weekly email dedup |

### Phase 2 verdict

**Do not start new scrapers until Phase 1 metric is met.** Adding providers on a broken cron wastes effort and can produce false confidence.

---

## Phase 3 — Acquisition & retention

**Goal:** turn coverage into a habit-forming product.

**Success metric:** week-over-week active alert subscribers growing without paid spend.

### Plan vs status

| Item | Plan | Status | Notes |
|------|------|--------|-------|
| Telegram before paid ads | Lower latency for Erasmus students | ❌ **UI only** | Form field disabled; no dispatcher |
| SEO content per provider | Intent-driven traffic | ❌ **Not started** | Sitemap/robots in code; content pages not built |
| Community seeding | FB/Telegram/r/Austria | ⏳ **Manual** | No code dependency |
| Hold Stripe/monetization | Prove value first | ✅ **Correct** | Not started — aligned with strategy |

---

## Phase 4 — Expansion (post-Vienna proof)

**Goal:** replicate the playbook, not the assumptions.

### Plan vs status

| Item | Plan | Status |
|------|------|--------|
| Graz as city #2 | Smaller market, de-risk scraper build | ❌ Not started |
| Unit economics per city | Scraper cost > CAC for expansion | ⏳ Document when Vienna flywheel runs |
| Expand only after Vienna works | Don't multiply breakage | ✅ Correct gate — Vienna loop not proven yet |

---

## Guardrails throughout

| Guardrail | Status | Notes |
|-----------|--------|-------|
| No new feature branches without merge cadence | ⚠️ **Ongoing** | Many `cursor/*` branches merged; keep merging within days |
| Design/branding exploration capped | ✅ **Aligned** | Sunset Coral / clean direction retained; avoid detours |
| Alert changes tested for first-scrape + scraper-recovery edge cases | ⚠️ **Partial** | Tests for diff, cron-auth, callback; add before alert logic changes |
| Data trust over features | ⚠️ **At risk** | Cron 404 means stale availability — fix before marketing |

---

## What to do right now

See [`LAUNCH_CHECKLIST.md`](./LAUNCH_CHECKLIST.md) — summary:

1. Confirm **PR #33 deploy** — `curl` to `/api/cron/scrape` returns 401/200 (not 404)
2. Re-enable **cron-job.org**
3. Fix Supabase **Site URL** + redirect URLs
4. Confirm `/admin` shows fresh scrape times
5. Run one-week **false/missed alert** watch — then declare Phase 1 done

---

## Architecture (reference)

```
cron-job.org → GET /api/cron/scrape
  → scrapers (OeAD/Playwright, STUWO, home4students/Cheerio)
  → processSnapshot() → availability_snapshots
  → on false→true: matchAlertsForDorm() → sendAvailabilityAlert() → alert_log

Users → Next.js [locale] → Supabase (RLS) → user_alerts, dorms
```

Technical audit detail: [`PROJECT_AUDIT.md`](./PROJECT_AUDIT.md)
