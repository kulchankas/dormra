# Launch checklist

One-page ordered checklist for going live. Full details: [`MANUAL_TASKS.md`](./MANUAL_TASKS.md).

---

## Before merge

- [ ] Review and merge **i18n PR** (`cursor/i18n-de-ru-5868`) — German/Russian UI, localized emails
- [ ] Review and merge **audit PR** (`cursor/project-audit-5868`) — security fixes, performance, ops docs
- [ ] Resolve any conflicts between the two branches on `main` (audit branch may already include i18n commits)

---

## After merge — Supabase (blockers)

- [ ] **Enable RLS** — run `supabase/migrations/20260605120000_enable_rls.sql` in production SQL Editor
- [ ] **Apply new migrations** (in order):
  1. `20260701120000_user_alerts_locale.sql`
  2. `20260701130000_snapshot_rpc_and_retention.sql`
  3. `20260701140000_alert_log_dedup.sql`
- [ ] **Auth redirect URLs** — add `https://dormra.eu/auth/callback` and localhost variants
- [ ] **Verify RLS** — anon key must not return other users' alerts (see MANUAL_TASKS §1.1)

---

## After merge — Vercel (blockers)

- [ ] Set env vars: `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, `RESEND_API_KEY`, `NEXT_PUBLIC_SITE_URL=https://dormra.eu`
- [ ] **Redeploy** production after env changes

---

## After merge — cron-job.org (blockers)

- [ ] Create job: `GET https://dormra.eu/api/cron/scrape` every 15 min
- [ ] Header: `Authorization: Bearer <CRON_SECRET>` (same value as Vercel)
- [ ] Confirm first run returns `{ "ok": true, ... }`

---

## Recommended before announcing

- [ ] **Admin access** — set `ADMIN_EMAILS=your@email.com` in Vercel, redeploy, verify `/admin`
- [ ] **Resend domain** — verify `dormra.eu`, update `lib/email.ts` from address to `alerts@dormra.eu`
- [ ] **Smoke tests** — homepage, `/de/dorms`, signup, alert create, password reset, cron (MANUAL_TASKS §6)
- [ ] **Optional:** regenerate `lib/database.types.ts` via Supabase CLI

---

## Post-launch monitoring

- [ ] Vercel logs — watch `/api/cron/scrape` for 401/500
- [ ] Supabase — DB size (`availability_snapshots` ~5k rows/day; 30-day prune runs in cron)
- [ ] Uptime ping on `https://dormra.eu`

---

## Quick links

| Doc | Purpose |
|-----|---------|
| [`MANUAL_TASKS.md`](./MANUAL_TASKS.md) | Step-by-step with SQL, curl, DNS |
| [`PROJECT_AUDIT.md`](./PROJECT_AUDIT.md) | Code roadmap and status |
| [`../README.md`](../README.md) | Local dev setup |
