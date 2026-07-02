# Launch checklist

**Your action list** — ordered by urgency. Maps to [`STRATEGY.md`](./STRATEGY.md) Phase 1 (prove the loop).

Full operator steps (SQL, curl, DNS): [`MANUAL_TASKS.md`](./MANUAL_TASKS.md)  
Day-to-day monitoring: [`MONITORING.md`](./MONITORING.md)

**Last audit:** 2026-07-02 — cron endpoint verified; cron-job.org still needs your enable.

---

## Do now — your manual steps

Nothing in Phase 1 counts until cron runs continuously and auth URLs are fixed.

### 1. cron-job.org — enable 3 jobs ⬜

The scrape **endpoint works**; the **scheduler is still off** until you enable it.

- [ ] Open [cron-job.org](https://console.cron-job.org/) → disable/delete old single job
- [ ] **Job 1** — `GET https://dormra.eu/api/cron/scrape?providers=stuwo,home4students&prune=1` — `*/15 * * * *`
- [ ] **Job 2** — `GET ...?provider=oead&batch=0&batches=2` — `5,20,35,50 * * * *`
- [ ] **Job 3** — `GET ...?provider=oead&batch=1&batches=2` — `10,25,40,55 * * * *`
- [ ] All jobs: header `Authorization: Bearer <CRON_SECRET>`, timeout **300s**
- [ ] **Enable** all three; confirm execution history shows **HTTP 200**

Or: `CRON_JOB_ORG_API_KEY=... CRON_SECRET=... ./scripts/setup-cron-jobs.sh`

### 2. Supabase auth URLs ⬜

- [ ] **Site URL:** `https://dormra.eu` (not `localhost:3000`)
- [ ] **Redirect URLs:** `https://dormra.eu/auth/callback`, `http://localhost:3000/auth/callback`

### 3. Rotate secrets ⬜ (if exposed in chat)

- [ ] New `CRON_SECRET` in Vercel + all 3 cron-job.org jobs
- [ ] New Supabase service role key
- [ ] New `RESEND_API_KEY` → redeploy

### 4. RLS smoke test ⬜

- [ ] Anon key must **not** return other users' alerts — [`MANUAL_TASKS.md`](./MANUAL_TASKS.md) §1.1

### 5. Google OAuth ⬜ (optional)

Only if using “Continue with Google” — [`MANUAL_TASKS.md`](./MANUAL_TASKS.md) §5b

---

## Agent verified — production ready

### Code merged to `main`

- [x] i18n (DE/RU UI, localized emails, hreflang)
- [x] Audit + admin dashboard (`/admin`, cron fail-closed, alert validation, snapshot RPC, email dedup)
- [x] UX polish (dorms error fallback, mobile admin, `RESEND_FROM` env support)
- [x] Proxy fix PR #33 — `/api/*`, `/auth/*` no longer 404
- [x] Playwright on Vercel PR #36–37 — Chromium pack URL
- [x] **Cron split PR #39** — provider batches avoid 504 timeout
- [x] **`/api/test-alert`** — E2E alert test route (CRON_SECRET auth)
- [x] 3 live scrapers: OeAD (26), home4students (11), STUWO (12)

### Cron endpoint (tested 2026-07-02)

- [x] Fast scrape `?providers=stuwo,home4students` → **200** ~20s, 26 dorms
- [x] OeAD batch 0 → **200** ~125s, 13 dorms
- [x] Unauthorized → **401** quickly

### Vercel env (you confirmed)

- [x] `ADMIN_EMAILS=kulchankas@gmail.com`
- [x] `CRON_SECRET`, Supabase keys, `RESEND_API_KEY`
- [ ] `NEXT_PUBLIC_SITE_URL=https://dormra.eu` — confirm set

### Supabase (applied via SQL Editor)

- [x] RLS enabled on public tables
- [x] Migrations: locale, snapshot RPC, alert dedup

---

## After cron runs — confirm the loop

### 6. Admin dashboard smoke test

- [ ] Log in as `kulchankas@gmail.com`
- [ ] Open https://dormra.eu/admin
- [ ] **Dorm health** — last scrape times update every ~15 min
- [ ] **Email log** — entries when availability transitions fire alerts

### 7. Test alert email (optional, before real transition)

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  "https://dormra.eu/api/test-alert?slug=oead-guadenzdorf&email=kulchankas@gmail.com"
```

- [ ] Email received; Resend dashboard shows delivery

### 8. Resend production sender

- [ ] [Resend](https://resend.com/domains) → verify `dormra.eu` (DNS SPF/DKIM)
- [ ] Vercel: `RESEND_FROM=Dormra <alerts@dormra.eu>`
- [ ] Redeploy

### 9. End-user smoke test

- [ ] Homepage → `/dorms` search (budget filter works)
- [ ] Sign up / log in
- [ ] Create alert on dashboard
- [ ] Password reset email → link lands on `dormra.eu`

Details: [`MANUAL_TASKS.md`](./MANUAL_TASKS.md) §7

---

## Phase 1 product gaps — agent backlog

| Item | Status | Owner | Next step |
|------|--------|-------|-----------|
| Live cron for 7 days | ⬜ Blocked on you | You | Enable 3 cron-job.org jobs |
| `/api/test-alert` E2E route | ✅ Done | Agent | You run curl in §7 |
| Hero `moveIn` filter | ⚠️ Partial | Agent | No scraped move-in dates — banner + alert CTA only |
| home4students shared-URL attribution | ⚠️ Partial | Agent | Verify in `/admin` after cron runs |
| Zero false/missed alerts (1 week) | ⬜ Not measured | You + agent | Watch admin after cron restored |

### Agent next (Phase 1 code)

1. **home4students attribution audit** — verify Döbling front/back in admin after live cron
2. **Admin cron status widget** — surface last split-job durations from scrape metadata
3. **move_in_before** — keep stored but documented until providers expose dates

---

## Phase 2+ — not now

Hold until Phase 1 success metric is met (one real student, one correct alert, one week of clean cron).

| Phase | Goal | Status |
|-------|------|--------|
| **2 — Widen moat** | 3 → 9 scrapers | 3/9 live |
| **3 — Acquisition** | Telegram, SEO | Telegram UI only |
| **4 — Expansion** | Graz after Vienna | Not started |

Full roadmap: [`STRATEGY.md`](./STRATEGY.md)

---

## Post-launch monitoring

- [ ] cron-job.org — 3 jobs, execution history **200**
- [ ] Vercel logs — `path:/api/cron/scrape`
- [ ] `/admin` → Dorm health + Email log
- [ ] Supabase — snapshot growth (~5k rows/day; prune in fast job)
- [ ] Resend — delivery vs admin Email log

---

## Quick links

| Doc | Purpose |
|-----|---------|
| [`STRATEGY.md`](./STRATEGY.md) | Business thesis + phases vs status |
| [`MANUAL_TASKS.md`](./MANUAL_TASKS.md) | Step-by-step SQL, curl, DNS |
| [`MONITORING.md`](./MONITORING.md) | Where to watch cron, emails, DB |
| [`PROJECT_AUDIT.md`](./PROJECT_AUDIT.md) | Code audit + agent schedule |
| [`../README.md`](../README.md) | Local dev setup |
