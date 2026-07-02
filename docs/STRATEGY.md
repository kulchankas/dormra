# Dormra Strategy

Living strategy doc. **Status column** reflects the repo and production as of 2026-07-02.  
Operator checklist: [`LAUNCH_CHECKLIST.md`](./LAUNCH_CHECKLIST.md)

---

## Current status snapshot (2026-07-02)

| Area | State |
|------|--------|
| **Phase** | Still **Phase 1** — prove the loop |
| **Cron code** | ✅ Split scrape live (PR #39); fast ~20s, OeAD batch ~125s |
| **Cron scheduler** | ⬜ **You** must enable 3 jobs on cron-job.org |
| **Auth URLs** | ⬜ Supabase Site URL likely still `localhost` — fix manually |
| **Alert E2E** | ✅ `/api/test-alert` route shipped |
| **Next agent work** | h4s attribution verify, admin cron visibility |

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
| End-to-end test via `/api/test-alert` | Real Supabase, not fixtures | ✅ **Done** | `GET /api/test-alert?slug=…&dryRun=1` or `&email=ADMIN` |
| Fix hero search | Homepage must search | ⚠️ **Partial** | Budget + navigation work; `moveIn` param passed but **not filtered** (no provider move-in data) |
| Fix home4students shared-URL attribution | Wrong attribution kills trust | ⚠️ **Partial** | Dedup + keyword windows in code; **verify in `/admin` after cron runs** |
| Rotate exposed secrets | Security hygiene | ⬜ **Manual** | CRON, Supabase service role, Resend — see MANUAL_TASKS §2.1 |
| Cron running every 15 min | Data stays fresh | ⚠️ **Code ready** | Endpoint 200; **cron-job.org disabled** — enable 3 split jobs |
| Auth flows (login, reset, Google) | Users can sign up | ⚠️ **Partial** | Callback route fixed; **Supabase Site URL → dormra.eu** still manual |
| RLS + auth hardening | Before real users | ✅ **Done in code** | Migration applied; middleware guards `/dashboard` and `/admin` |
| Admin observability | Trust the data | ✅ **Done** | `/admin` — dorm health, email log, alert stats |

### Phase 1 verdict

**You are still in Phase 1.** Cron **code** is proven; the **scheduler and auth URLs** are not. Enable cron-job.org, fix Supabase URLs, run one week of alert watch — then declare Phase 1 done.

*Rationale:* Every week spent on design or naming instead of this is a week the core promise (accurate real-time alerts) stays unproven. Until cron runs continuously, Dormra is a demo, not a product.

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
| Data trust over features | ⚠️ **At risk** | Cron scheduler off — enable cron-job.org before marketing |

---

## What to do right now

**You (manual):** see [`LAUNCH_CHECKLIST.md`](./LAUNCH_CHECKLIST.md) § “Do now”

1. Enable **3 cron-job.org jobs** (or run `./scripts/setup-cron-jobs.sh`)
2. Fix Supabase **Site URL** + redirect URLs
3. Rotate secrets if exposed
4. RLS anon smoke test
5. Run `/api/test-alert` curl → confirm email delivery

**Agent (code):** after you enable cron

1. Verify home4students attribution in `/admin` dorm health
2. Improve admin cron observability (last run per provider batch)
3. Hold new scrapers until Phase 1 metric met

---

## Architecture (reference)

```
cron-job.org (3 jobs)
  → GET /api/cron/scrape?providers=… | ?provider=oead&batch=N
  → scrapers (OeAD/Playwright, STUWO, home4students/Cheerio)
  → processSnapshot() → availability_snapshots
  → on false→true: matchAlertsForDorm() → sendAvailabilityAlert() → alert_log

Operator test:
  GET /api/test-alert?slug=…&dryRun=1 | &email=ADMIN@…
```

Technical audit detail: [`PROJECT_AUDIT.md`](./PROJECT_AUDIT.md)
