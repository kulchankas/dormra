# Launch checklist

**Your action list** — ordered by urgency. Maps to [`STRATEGY.md`](./STRATEGY.md) Phase 1 (prove the loop).

Full operator steps (SQL, curl, DNS): [`MANUAL_TASKS.md`](./MANUAL_TASKS.md)  
Day-to-day monitoring: [`MONITORING.md`](./MONITORING.md)

---

## Do now — unblock live cron & auth

Nothing else in Phase 1 counts until the scrape loop runs in production.

### 1. Confirm deploy from PR #33

- [x] **PR #33 merged** — proxy fix for `/api/*`, `/auth/*`, metadata routes
- [ ] Wait for Vercel production deploy, then verify (step 2)

**Why:** Production was returning **404** for `/api/cron/scrape` and `/auth/callback`. cron-job.org disabled the job after repeated failures.

### 2. Verify the scrape endpoint

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://dormra.eu/api/cron/scrape
```

| Response | Action |
|----------|--------|
| `{ "ok": true, ... }` | Working — continue |
| **401** | `CRON_SECRET` mismatch — align Vercel and cron-job.org |
| **404** | Deploy not finished or PR #33 not merged |
| **500** | Check Vercel logs; likely missing `SUPABASE_SERVICE_ROLE_KEY` |

### 3. Re-enable cron-job.org (3 jobs)

Disabled jobs stay off until you turn them back on. One job times out (504); use **three split jobs**:

- [ ] Open [cron-job.org](https://console.cron-job.org/) → disable/delete old single job
- [ ] **Job 1** — `GET https://dormra.eu/api/cron/scrape?providers=stuwo,home4students&prune=1` — `*/15 * * * *`
- [ ] **Job 2** — `GET ...?provider=oead&batch=0&batches=2` — `5,20,35,50 * * * *`
- [ ] **Job 3** — `GET ...?provider=oead&batch=1&batches=2` — `10,25,40,55 * * * *`
- [ ] All jobs: header `Authorization: Bearer <CRON_SECRET>`, timeout **300s**
- [ ] **Enable** all three; confirm execution history shows **HTTP 200**

Or run `./scripts/setup-cron-jobs.sh` with `CRON_JOB_ORG_API_KEY` + `CRON_SECRET` (see [`MANUAL_TASKS.md`](./MANUAL_TASKS.md) §3).

### 4. Fix Supabase auth URLs

In Supabase → **Authentication** → **URL Configuration**:

- [ ] **Site URL:** `https://dormra.eu` (not `localhost:3000`)
- [ ] **Redirect URLs:** `https://dormra.eu/auth/callback`, `http://localhost:3000/auth/callback`

Without this, password reset and Google OAuth redirect to localhost.

### 5. Google OAuth (if using “Continue with Google”)

- [ ] Google Cloud → OAuth redirect URI: `https://vmnnvtifpknakerduioq.supabase.co/auth/v1/callback`
- [ ] Supabase → Authentication → Providers → Google: enable + paste Client ID/Secret

Details: [`MANUAL_TASKS.md`](./MANUAL_TASKS.md) §5b

---

## Already done — skip unless something broke

### Code merged to `main`

- [x] i18n (DE/RU UI, localized emails, hreflang)
- [x] Audit + admin dashboard (`/admin`, cron fail-closed, alert validation, snapshot RPC, email dedup)
- [x] UX polish (dorms error fallback, mobile admin, `RESEND_FROM` env support)
- [x] `feature/wire-email-engine` — **fully absorbed into `main`** (branch has 0 unique commits; safe to ignore)
- [x] Auth hardening + RLS migration **in code** (see Supabase section below)
- [x] Per-dorm “Alert me” button on `/dorms/[slug]` and directory
- [x] 3 live scrapers: OeAD (26 dorms), home4students (11), STUWO

### Vercel env (you confirmed)

- [x] `ADMIN_EMAILS=kulchankas@gmail.com`
- [x] `CRON_SECRET`, Supabase keys, `RESEND_API_KEY`

### Supabase (applied via SQL Editor)

- [x] RLS enabled on public tables
- [x] Migrations: `user_alerts_locale`, `snapshot_rpc_and_retention`, `alert_log_dedup`

- [ ] **Verify RLS** — anon key must not return other users' alerts ([`MANUAL_TASKS.md`](./MANUAL_TASKS.md) §1.1 smoke test)

---

## After cron runs — confirm the loop

### 6. Admin dashboard smoke test

- [ ] Log in as `kulchankas@gmail.com`
- [ ] Open https://dormra.eu/admin
- [ ] **Dorm health** — last scrape times update every ~15 min
- [ ] **Email log** — entries appear when availability transitions fire alerts

### 7. Resend production sender

- [ ] [Resend](https://resend.com/domains) → verify `dormra.eu` (DNS SPF/DKIM)
- [ ] Vercel: `RESEND_FROM=Dormra <alerts@dormra.eu>`
- [ ] Redeploy

### 8. End-user smoke test

- [ ] Homepage → `/dorms` search (budget filter works)
- [ ] Sign up / log in
- [ ] Create alert on dashboard
- [ ] Password reset email → link lands on `dormra.eu`
- [ ] Google sign-in (if enabled)

Details: [`MANUAL_TASKS.md`](./MANUAL_TASKS.md) §6

### 9. Rotate Resend key (if ever exposed)

- [ ] Generate new key in Resend dashboard
- [ ] Update `RESEND_API_KEY` in Vercel → redeploy
- [ ] Revoke old key

---

## Phase 1 product gaps — after ops are green

These are the remaining **Phase 1 strategy** items. See [`STRATEGY.md`](./STRATEGY.md) for rationale.

| Item | Status | Next step |
|------|--------|-----------|
| Live cron for 7 days | ❌ Blocked | Complete steps 1–3 above |
| `/api/test-alert` E2E test route | ❌ Not built | Add dev-only route to fire a real alert against prod Supabase |
| Hero `moveIn` filter | ⚠️ Partial | Search navigates to `/dorms?moveIn=…` but **does not filter** — banner says “not live yet” |
| home4students shared-URL attribution | ⚠️ Partial | Fetch dedup done; `h4s-doebling-front` / `h4s-doebling-back` share address keywords — verify in admin after cron runs |
| Zero false/missed alerts (1 week) | ❌ Not measured | Watch admin Dorm health + Email log after cron restored |

---

## Phase 2+ — not now

Hold until Phase 1 success metric is met (one real student, one correct alert, one week of clean cron).

| Phase | Goal | Status |
|-------|------|--------|
| **2 — Widen moat** | 3 → 9 scrapers; any Vienna dorm searchable | 3/9 scrapers live |
| **3 — Acquisition** | Telegram, SEO, community; no Stripe yet | Telegram UI only; SEO not started |
| **4 — Expansion** | Graz after Vienna flywheel works | Not started |

Full roadmap: [`STRATEGY.md`](./STRATEGY.md)

---

## Post-launch monitoring

- [ ] cron-job.org — execution history (200, not 404/401)
- [ ] Vercel logs — filter `path:/api/cron/scrape`
- [ ] `/admin` → Dorm health + Email log
- [ ] Supabase — `availability_snapshots` growth (~5k rows/day; 30-day prune in cron)
- [ ] Resend — delivery status vs admin Email log

---

## Quick links

| Doc | Purpose |
|-----|---------|
| [`STRATEGY.md`](./STRATEGY.md) | Business thesis + phases vs current status |
| [`MANUAL_TASKS.md`](./MANUAL_TASKS.md) | Step-by-step SQL, curl, DNS |
| [`MONITORING.md`](./MONITORING.md) | Where to watch cron, emails, DB |
| [`PROJECT_AUDIT.md`](./PROJECT_AUDIT.md) | Code audit items (mostly ✅) |
| [`../README.md`](../README.md) | Local dev setup |
