# Monitoring guide

Where to watch Dormra activity — in-app admin, external dashboards, and what each shows.

---

## 1. In-app admin dashboard (primary)

**URL:** `https://dormra.eu/admin` (or `/de/admin`, `/ru/admin`)

**Access:** Log in with an email listed in `ADMIN_EMAILS` (Vercel env var).

### Setup

1. Add to Vercel → Environment Variables:
   ```
   ADMIN_EMAILS=you@example.com,ops@example.com
   ```
2. Redeploy.
3. Log in with that account → **Admin** appears in the header user menu.

### What you see

| Tab | Data |
|-----|------|
| **Overview** | Active dorms, available count, scrape failures, alert counts, emails sent, provider breakdown |
| **Dorm health** | Per-dorm scrape status (available / booked / failed / stale), last check time, error messages |
| **Email log** | Last 100 `alert_log` entries (when alerts were sent, which dorm) |
| **Alerts** | Total/active alerts, growth (7d/30d), locale breakdown |

Data is read via the Supabase service role (server-side only). Non-admin users are redirected to home.

---

## 2. Vercel — runtime & cron logs

**URL:** [vercel.com/dashboard](https://vercel.com/dashboard) → your project

| What | Where |
|------|--------|
| Cron scrape errors | **Logs** → filter `path:/api/cron/scrape` |
| 401 on cron | `CRON_SECRET` mismatch with cron-job.org |
| 500 on cron | Missing `SUPABASE_SERVICE_ROLE_KEY` or DB error |
| Deploy failures | **Deployments** tab |
| Function duration | `/api/cron/scrape` has 300s max (Playwright scrapes) |

**Tip:** Set up a Vercel log drain or check logs after each deploy.

---

## 3. cron-job.org — scrape scheduler

**URL:** [console.cron-job.org](https://console.cron-job.org/)

Three jobs (single job hits Vercel 300s limit on full scrape):

| Job | URL | Schedule |
|-----|-----|----------|
| Fast + prune | `.../api/cron/scrape?providers=stuwo,home4students&prune=1` | `*/15 * * * *` |
| OeAD batch 0 | `.../api/cron/scrape?provider=oead&batch=0&batches=2` | `5,20,35,50 * * * *` |
| OeAD batch 1 | `.../api/cron/scrape?provider=oead&batch=1&batches=2` | `10,25,40,55 * * * *` |

| What | Expected |
|------|----------|
| Auth header | `Authorization: Bearer <CRON_SECRET>` |
| Request timeout | 300 seconds per job |
| Success body | `{ "ok": true, "scraped": N, ... }` |
| Failure | 401 (secret), 404 (route/proxy), 500 (server/DB), 504 (job too broad — use split URLs) |
| Auto-disabled | cron-job.org disables after repeated failures — fix root cause, then re-enable all three |

Execution history shows HTTP status and response time per run. If jobs fail silently, availability goes stale (>6h shows as "unknown" on the site).

---

## 4. Supabase — database & auth

**URL:** [supabase.com/dashboard](https://supabase.com/dashboard) → your project

| What | Where |
|------|--------|
| Table growth | **Database** → `availability_snapshots` (~5k rows/day; 30-day prune runs in cron) |
| Auth signups | **Authentication** → Users |
| RLS status | **SQL Editor** → see `MANUAL_TASKS.md` §1.1 |
| Ad-hoc queries | SQL Editor — examples below |

**Useful SQL:**

```sql
-- Latest scrape failures
select d.slug, s.error_msg, s.scraped_at
from availability_snapshots s
join dorms d on d.id = s.dorm_id
where s.scrape_ok = false
order by s.scraped_at desc
limit 20;

-- Emails sent today
select count(*) from alert_log
where sent_at >= current_date;

-- Active alerts by locale
select locale, count(*) from user_alerts
where active = true
group by locale;
```

---

## 5. Resend — email delivery

**URL:** [resend.com/emails](https://resend.com/emails)

| What | Notes |
|------|--------|
| Delivery status | Sent, delivered, bounced |
| Sandbox | `onboarding@resend.dev` until domain verified |
| Production | Switch to `alerts@dormra.eu` after DNS verification |

Compare Resend logs with **Admin → Email log**. If cron matches alerts but Resend shows nothing, check `RESEND_API_KEY`.

---

## 6. Public site signals (no login)

| Signal | Meaning |
|--------|---------|
| ScanningPill "updated X ago" | Last row in `availability_snapshots` |
| Dorm shows "Status unknown" | Scrape failed or data >6h old |
| No new availability | Cron not running or all dorms still booked |

---

## Quick reference

| Need | Go to |
|------|--------|
| Day-to-day ops | **Admin dashboard** `/admin` |
| Cron broke | cron-job.org + Vercel logs |
| DB full / slow | Supabase dashboard |
| Emails not arriving | Resend + Admin → Email log |
| Security / RLS | `docs/MANUAL_TASKS.md` |
| Launch steps | `docs/LAUNCH_CHECKLIST.md` |
