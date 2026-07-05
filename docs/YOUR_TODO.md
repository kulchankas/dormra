# Your todo list

Personal operator checklist — things **only you** can do in external dashboards.  
Agent work is tracked in [`PROJECT_AUDIT.md`](./PROJECT_AUDIT.md) § Agent schedule.

**Last updated:** 2026-07-04 (full project audit)  
**Status:** Phase 1 blockers remain. Code is ahead of production ops.

---

## Do first (blocks launch)

- [ ] **cron-job.org** — enable 3 split jobs ([steps](./MANUAL_TASKS.md#3-cron-joborg--scrape-scheduler))
  - Job 1: `?providers=stuwo,home4students&prune=1` — `*/15 * * * *`
  - Job 2: `?provider=oead&batch=0&batches=2` — `5,20,35,50 * * * *`
  - Job 3: `?provider=oead&batch=1&batches=2` — `10,25,40,55 * * * *`
  - Or: `CRON_JOB_ORG_API_KEY=… CRON_SECRET=… ./scripts/setup-cron-jobs.sh`
- [ ] **Supabase Site URL** → `https://dormra.eu` + redirect URLs ([§6](./MANUAL_TASKS.md#6-supabase-auth--redirect-urls-email--magic-link--password-reset))
- [ ] **Apply pending migrations** in Supabase SQL Editor (if not done):
  - `20260702150000_dorm_coordinates.sql`
  - `20260702160000_dorm_images.sql`
  - `20260702220000_cron_runs.sql` ← admin cron widget needs this
  - `20260702220100_alert_log_alert_id.sql`
- [ ] **Apply ÖJAB seed** (optional but adds 15 dorms): `supabase/seeds/ojab_vienna.sql`
- [ ] **Apply gallery seed** (optional): `supabase/seeds/dorm_image_galleries.sql`
- [ ] **RLS smoke test** — anon key must not return other users' alerts ([§1.1](./MANUAL_TASKS.md#11-enable-row-level-security-rls))
- [ ] **Rotate secrets** if pasted in chat — CRON, Supabase service role, Resend ([§2.1](./MANUAL_TASKS.md#21-rotate-secrets-if-exposed))

## This week

- [ ] **Resend domain** — verify `dormra.eu`, set `RESEND_FROM=Dormra <alerts@dormra.eu>` ([§4](./MANUAL_TASKS.md#4-resend--email-domain-high))
- [ ] **Test alert email** after deploy:
  ```bash
  curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
    "https://dormra.eu/api/test-alert?slug=oead-guadenzdorf&email=kulchankas@gmail.com"
  ```
- [ ] **End-user smoke tests** — signup, create alert, password reset, save dorm, sign out ([§7](./MANUAL_TASKS.md#7-post-deploy-smoke-tests))
- [ ] **Google OAuth** — only if using “Continue with Google” ([§5b](./MANUAL_TASKS.md#5b-google-oauth-optional)). App now hides the button when disabled in Supabase (PR #52).

## After cron runs (days 1–7)

- [ ] Log in → `/admin` → confirm **Dorm health** updates every ~15 min
- [ ] Confirm **Cron runs** widget shows recent job history (needs `cron_runs` migration)
- [ ] Watch **Email log** for false/missed alerts
- [ ] Confirm **Resend** delivery matches admin log
- [ ] Day 7: declare Phase 1 done or file bugs

---

## Already done (skip)

- [x] Cron endpoint live (split jobs, PR #39)
- [x] Vercel env vars set (`ADMIN_EMAILS`, `CRON_SECRET`, Supabase, Resend)
- [x] RLS + baseline migrations applied in Supabase
- [x] `/api/test-alert` route shipped (PR #40)
- [x] Sign-out fix (PR #47)
- [x] Alert UX + welcome digest + dedup (PR #48)
- [x] Saved dorms + tracker (PR #49)
- [x] Dorm pages: gallery, map, JSON-LD (PR #50)
- [x] Google OAuth hardening (PR #52)
- [x] 98 tests passing on `main`

---

## Quick links

| Link | Purpose |
|------|---------|
| [cron-job.org console](https://console.cron-job.org/) | Enable scrape jobs |
| [Supabase dashboard](https://supabase.com/dashboard) | Auth URLs, SQL, RLS |
| [Vercel dashboard](https://vercel.com/dashboard) | Env vars, logs |
| [Resend domains](https://resend.com/domains) | Email verification |
| [dormra.eu/admin](https://dormra.eu/admin) | In-app monitoring |
