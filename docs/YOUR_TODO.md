# Your todo list

Personal operator checklist — things **only you** can do in external dashboards.

**Last updated:** 2026-07-13  
**Supabase setup:** [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)

---

## Do first (blocks Phase 1)

### 1. Supabase migrations + seeds (~20 min)

See **[`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)** — Parts A, B, optional C (ÖJAB + images).

### 2. Supabase auth URLs (~5 min)

- [ ] **Site URL** → `https://dormra.eu`
- [ ] **Redirect URLs** — [`MANUAL_TASKS.md` §6](./MANUAL_TASKS.md#6-supabase-auth--redirect-urls-email--magic-link--password-reset)

### 3. cron-job.org (~10 min)

- [ ] Enable 3 split jobs — [`MANUAL_TASKS.md` §3](./MANUAL_TASKS.md#3-cron-joborg--scrape-scheduler)

### 4. Security (~10 min)

- [ ] RLS smoke test — [`MANUAL_TASKS.md` §1.1](./MANUAL_TASKS.md#11-enable-row-level-security-rls)
- [ ] Rotate secrets if exposed — [`MANUAL_TASKS.md` §2.1](./MANUAL_TASKS.md#21-rotate-secrets-if-exposed)

---

## This week

- [ ] Resend domain verify + `RESEND_FROM` — [`MANUAL_TASKS.md` §4](./MANUAL_TASKS.md#4-resend--email-domain-high)
- [ ] Test alert: `curl -H "Authorization: Bearer CRON_SECRET" "https://dormra.eu/api/test-alert?slug=oead-guadenzdorf&email=YOUR_EMAIL"`
- [ ] Smoke tests: signup, alert, save dorm, apply click, sign out
- [ ] Merge + deploy PR #61 (saved-dorm emails) when ready

---

## After cron runs (days 1–7)

- [ ] `/admin` → Dorm health updates ~every 15 min
- [ ] `/admin` → Cron runs widget shows history
- [ ] Email log — no false/missed alerts; check `saved_dorm` channel after PR #61
- [ ] Day 7: declare Phase 1 done or file bugs

---

## Already done in code (skip)

- [x] 3 scrapers, split cron, test-alert route, admin dashboard
- [x] Saved dorms + auto-track on Apply (PR #59)
- [x] Ukrainian locale, custom Vienna map, dorm card refresh (PR #58–59)
- [x] Saved-dorm + criteria alert emails (PR #61 — pending merge)

---

## Quick links

| Link | Purpose |
|------|---------|
| [Supabase setup](./SUPABASE_SETUP.md) | Migrations + seeds |
| [cron-job.org](https://console.cron-job.org/) | Enable scrape jobs |
| [Supabase dashboard](https://supabase.com/dashboard) | SQL Editor, auth |
| [dormra.eu/admin](https://dormra.eu/admin) | Monitoring |
