# Manual tasks — operator checklist

Tasks that **cannot be done in code** or require access to external dashboards. Work through these before public launch or after merging audit PRs.

**Quick path:** see [`LAUNCH_CHECKLIST.md`](./LAUNCH_CHECKLIST.md) for a one-page ordered checklist.

Check off items as you complete them.

---

## 1. Supabase — security (critical)

### 1.1 Enable Row Level Security (RLS)

**Why:** Without RLS, anyone with the anon key can read/write all tables via PostgREST.

**Steps:**

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**.
2. Run the migration file locally or paste contents of:
   ```
   supabase/migrations/20260605120000_enable_rls.sql
   ```
3. Verify RLS is on for all public tables:

```sql
SELECT relname, relrowsecurity
FROM pg_class
JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
WHERE nspname = 'public'
  AND relkind = 'r'
  AND relname IN ('dorms', 'availability_snapshots', 'user_alerts', 'alert_log', 'tracker');
```

Every row should show `relrowsecurity = true`.

4. **Smoke test with anon key** (not service role):

```bash
curl "https://YOUR_PROJECT.supabase.co/rest/v1/user_alerts?select=id" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Expected: empty array `[]` or 401 — **not** other users' alerts.

### 1.2 Apply pending migrations

Run in order if not already applied:

```bash
psql "$DATABASE_URL" -f supabase/migrations/20260701120000_user_alerts_locale.sql
psql "$DATABASE_URL" -f supabase/migrations/20260701130000_snapshot_rpc_and_retention.sql
psql "$DATABASE_URL" -f supabase/migrations/20260701140000_alert_log_dedup.sql
```

Or paste each file into Supabase SQL Editor.

### 1.3 Regenerate TypeScript types (optional)

After schema changes:

```bash
npx supabase gen types typescript --project-id vmnnvtifpknakerduioq > lib/database.types.ts
```

Project ID is in Supabase → Project Settings → General.

---

## 2. Vercel — environment variables

**Where:** Vercel → Project → Settings → Environment Variables

Set for **Production** (and Preview if you test PRs):

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | From Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** — never expose to client |
| `CRON_SECRET` | Long random string (see below) |
| `RESEND_API_KEY` | From [resend.com](https://resend.com) |
| `NEXT_PUBLIC_SITE_URL` | `https://dormra.eu` |
| `ADMIN_EMAILS` | Your email(s), comma-separated — enables `/admin` dashboard |

After adding/changing vars → **Redeploy** production.

---

## 3. cron-job.org — scrape scheduler

**Why:** Dorm availability updates every 15 minutes.

**Steps:**

1. Create job at [cron-job.org](https://cron-job.org) (or your scheduler).
2. **URL:** `https://dormra.eu/api/cron/scrape`
3. **Schedule:** every 15 minutes (`*/15 * * * *`)
4. **Request headers:**

   ```
   Authorization: Bearer YOUR_CRON_SECRET
   ```

   Must match `CRON_SECRET` in Vercel exactly.

5. **Generate CRON_SECRET:**

   ```bash
   openssl rand -base64 32
   ```

6. After first run, check response JSON: `{ "ok": true, "scraped": N, ... }`.

**Failure signs:**

- `401 Unauthorized` → secret mismatch
- `500` → missing `SUPABASE_SERVICE_ROLE_KEY` or DB error

---

## 4. Resend — email domain (high)

**Why:** Alerts currently send from `onboarding@resend.dev` (sandbox). Production deliverability is poor.

**Steps:**

1. [Resend Dashboard](https://resend.com/domains) → **Add Domain** → `dormra.eu`
2. Add DNS records (SPF, DKIM) at your DNS provider.
3. Wait for verification (usually minutes to hours).
4. Update `lib/email.ts`:

   ```typescript
   const from = 'Dormra <alerts@dormra.eu>'
   ```

5. Send a test alert (trigger a scrape transition or use Resend test send).

---

## 5. Supabase Auth — redirect URLs

**Where:** Supabase → Authentication → URL Configuration

Ensure **Site URL** is `https://dormra.eu` and **Redirect URLs** include:

```
https://dormra.eu/auth/callback
https://dormra.eu/**
http://localhost:3000/auth/callback
http://localhost:3000/**
```

Required for Google OAuth, magic links, and password reset.

---

## 6. Post-deploy smoke tests

Run through once after deploy:

| Test | URL / action | Expected |
|------|----------------|----------|
| Homepage | `/` | Loads, dorms preview visible |
| German | `/de/dorms` | German UI |
| Dorm detail | `/dorms/oead-guadenzdorf` (example) | Image, price, apply link |
| Sign up | `/signup` | Account created |
| Create alert | `/dashboard/alerts/new` | Saves, redirects to list |
| Log out / in | Header menu | Session persists |
| Password reset | Login → Forgot → email → `/reset-password` | New password works |
| Cron | Wait 15 min or manual GET with Bearer | `ok: true` in logs |

---

## 7. Optional — monitoring

Not set up yet. Consider before scale:

- **Vercel** → Observability / Logs for cron route errors
- **Supabase** → Database size alerts (`availability_snapshots` grows ~5k rows/day)
- **Uptime** ping on `https://dormra.eu` and cron endpoint

---

## 8. Admin dashboard & monitoring

**In-app:** After setting `ADMIN_EMAILS`, log in and open `/admin` (or via header menu → Admin).

**Full guide:** [`MONITORING.md`](./MONITORING.md) — Vercel logs, cron-job.org, Supabase, Resend.

---

## 9. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Cron returns `401` | `CRON_SECRET` mismatch | Compare Vercel env vs cron-job.org header exactly |
| Cron returns `500` | Missing service role key | Set `SUPABASE_SERVICE_ROLE_KEY` in Vercel, redeploy |
| OAuth / reset link fails | Redirect URL not whitelisted | Supabase Auth → URL Configuration (§5) |
| Alerts empty for anon curl | RLS working correctly | Use authenticated session to test |
| Emails not arriving | Resend sandbox / spam | Verify domain (§4), check Resend logs |
| German/Russian 404 | i18n PR not merged | Merge `cursor/i18n-de-ru-5868` |
| Stale availability | Cron not running | Check cron-job.org history + Vercel logs |

---

## Quick reference

| Task | Owner | Blocker for launch? |
|------|-------|---------------------|
| RLS enabled | You | **Yes** |
| Migrations applied | You | **Yes** (locale + RPC) |
| Vercel env vars | You | **Yes** |
| CRON_SECRET + cron-job.org | You | **Yes** (stale data without) |
| Resend domain verified | You | Recommended |
| Auth redirect URLs | You | **Yes** (OAuth/reset) |
| ADMIN_EMAILS set | You | Recommended (monitoring) |
| Smoke tests | You | Recommended |

---

## Related docs

- [`LAUNCH_CHECKLIST.md`](./LAUNCH_CHECKLIST.md) — one-page launch order
- [`MONITORING.md`](./MONITORING.md) — where to watch activity
- [`PROJECT_AUDIT.md`](./PROJECT_AUDIT.md) — full audit and code roadmap
- [`../README.md`](../README.md) — dev setup and architecture
