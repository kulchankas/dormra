# Your todo list

Personal operator checklist — things **only you** can do in external dashboards.  
Agent work is tracked in [`PROJECT_AUDIT.md`](./PROJECT_AUDIT.md) § Agent schedule.

**Last updated:** 2026-07-04  
**Supabase migrations + seeds:** see **[`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)** (SQL Editor or terminal — step by step)

---

## Do first (blocks launch)

### 1. Supabase — migrations + seeds (~20 min)

Follow **[`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)**. Short version:

- [ ] **Part A** — run 4 migrations (coordinates, dorm_images table, cron_runs, alert_id)
- [ ] **Part B** — run 3 provider seeds (stuwo, oead, home4students) to backfill map coordinates
- [ ] **Verify** — `SELECT count(*) FROM dorms WHERE lat IS NOT NULL` → ~49
- [ ] *(Optional)* Part C — ÖJAB seed, hero images, photo galleries

### 2. Supabase auth URLs (~5 min)

- [ ] **Site URL** → `https://dormra.eu`
- [ ] **Redirect URLs** — see [`MANUAL_TASKS.md` §6](./MANUAL_TASKS.md#6-supabase-auth--redirect-urls-email--magic-link--password-reset)

### 3. cron-job.org (~10 min)

- [ ] Enable 3 split jobs — [`MANUAL_TASKS.md` §3](./MANUAL_TASKS.md#3-cron-joborg--scrape-scheduler)
  - Job 1: `?providers=stuwo,home4students&prune=1` — `*/15 * * * *`
  - Job 2: `?provider=oead&batch=0&batches=2` — `5,20,35,50 * * * *`
  - Job 3: `?provider=oead&batch=1&batches=2` — `10,25,40,55 * * * *`
  - Or: `CRON_JOB_ORG_API_KEY=… CRON_SECRET=… ./scripts/setup-cron-jobs.sh`

### 4. Security (~10 min)

- [ ] **RLS smoke test** — [`MANUAL_TASKS.md` §1.1](./MANUAL_TASKS.md#11-enable-row-level-security-rls)
- [ ] **Rotate secrets** if pasted in chat — [`MANUAL_TASKS.md` §2.1](./MANUAL_TASKS.md#21-rotate-secrets-if-exposed)

---

## This week

- [ ] **Resend domain** — verify `dormra.eu`, set `RESEND_FROM=Dormra <alerts@dormra.eu>` ([§4](./MANUAL_TASKS.md#4-resend--email-domain-high))
- [ ] **Test alert email:**
  ```bash
  curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
    "https://dormra.eu/api/test-alert?slug=oead-guadenzdorf&email=kulchankas@gmail.com"
  ```
- [ ] **End-user smoke tests** — signup, alert, reset, save dorm, sign out ([§7](./MANUAL_TASKS.md#7-post-deploy-smoke-tests))
- [ ] **Google OAuth** — only if using Google sign-in ([§5b](./MANUAL_TASKS.md#5b-google-oauth-optional))

---

## After cron runs (days 1–7)

- [ ] `/admin` → **Dorm health** updates every ~15 min
- [ ] `/admin` → **Cron runs** widget shows job history
- [ ] **Email log** — no false/missed alerts
- [ ] **Resend** delivery matches admin log
- [ ] Day 7: declare Phase 1 done or file bugs

---

## Already done (skip)

- [x] Cron endpoint live (split jobs, PR #39)
- [x] Vercel env vars set
- [x] Baseline RLS + schema in Supabase
- [x] `/api/test-alert` route (PR #40)
- [x] Sign-out, alerts, saved dorms, dorm pages (PRs #47–#54)

---

## Quick links

| Link | Purpose |
|------|---------|
| [**Supabase setup guide**](./SUPABASE_SETUP.md) | Migrations + seeds (today) |
| [cron-job.org console](https://console.cron-job.org/) | Enable scrape jobs |
| [Supabase dashboard](https://supabase.com/dashboard) | SQL Editor, auth URLs |
| [Vercel dashboard](https://vercel.com/dashboard) | Env vars, logs |
| [Resend domains](https://resend.com/domains) | Email verification |
| [dormra.eu/admin](https://dormra.eu/admin) | In-app monitoring |
