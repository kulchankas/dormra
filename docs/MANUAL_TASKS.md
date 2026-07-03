# Manual tasks — operator checklist

Tasks that **cannot be done in code** or require access to external dashboards. Work through these before public launch or after merging audit PRs.

**Quick path:** see [`YOUR_TODO.md`](./YOUR_TODO.md) for your personal checklist, or [`LAUNCH_CHECKLIST.md`](./LAUNCH_CHECKLIST.md) for launch order.

---

## Your action list (2026-07-02)

**Full checklist with checkboxes:** [`YOUR_TODO.md`](./YOUR_TODO.md)

Agent verified production after PRs #33–#40. **You still need to complete the unchecked items in YOUR_TODO.md.**

| # | Task | Status | Blocker? |
|---|------|--------|----------|
| 1 | **cron-job.org** — create/enable **3 split jobs** (§3) | ⬜ **You** | **Yes** — data goes stale without cron |
| 2 | **Supabase Site URL** → `https://dormra.eu` + redirect URLs (§6) | ⬜ **You** | **Yes** — OAuth/reset broken until fixed |
| 3 | **RLS smoke test** with anon key (§1.1 step 4) | ⬜ **You** | **Yes** — confirm no data leak |
| 4 | **Rotate exposed secrets** (§2.1) — CRON, Supabase service role, Resend | ⬜ **You** | **Yes** if keys were pasted in chat |
| 5 | **Resend domain** verify `dormra.eu` + `RESEND_FROM` (§4) | ⬜ **You** | Recommended |
| 6 | **Post-deploy smoke tests** (§7) — signup, alert, reset | ⬜ **You** | Recommended |
| 7 | **Google OAuth** — enable provider + Google Cloud credentials (§5b) | ⬜ **You** | **Yes** if using “Continue with Google” (currently **disabled** in Supabase) |

**Already done (agent / code):**

- [x] Cron endpoint live — split URLs return **200** (fast ~20s, OeAD batch ~125s)
- [x] PR #33 proxy fix, PR #36–37 Playwright/Chromium, PR #39 cron split
- [x] Vercel env: `ADMIN_EMAILS`, `CRON_SECRET`, Supabase, Resend keys set
- [x] RLS migration + other SQL applied in Supabase (you confirmed)
- [x] `/api/test-alert` route for E2E email testing (§3.1)

Check off items below as you complete them.

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
psql "$DATABASE_URL" -f supabase/migrations/20260702220000_cron_runs.sql
psql "$DATABASE_URL" -f supabase/migrations/20260702220100_alert_log_alert_id.sql
psql "$DATABASE_URL" -f supabase/migrations/20260702150000_dorm_coordinates.sql
psql "$DATABASE_URL" -f supabase/migrations/20260702160000_dorm_images.sql
```

Or paste each file into Supabase SQL Editor.

**After applying `20260702150000_dorm_coordinates.sql`**, re-run the seed files to backfill `lat`/`lng` for existing rows (they're idempotent upserts, safe to re-run):

```bash
psql "$DATABASE_URL" -f supabase/seeds/stuwo_vienna.sql
psql "$DATABASE_URL" -f supabase/seeds/oead_vienna.sql
psql "$DATABASE_URL" -f supabase/seeds/home4students_vienna.sql
```

Without this, the `/dorms` map view will show "No mapped locations" until coordinates are backfilled. New dorms added going forward should include `lat`/`lng` too — see `scripts/geocode-dorms.mjs` for the geocoding approach (Nominatim/OpenStreetMap, no API key required).

**After applying `20260702160000_dorm_images.sql`**, seed the photo galleries (idempotent, safe to re-run):

```bash
psql "$DATABASE_URL" -f supabase/seeds/dorm_image_galleries.sql
```

Currently populated for OeAD only (24/26 dorms, ~5 photos each) — see `scripts/fetch-dorm-galleries.mjs` to re-run or extend to STUWO/home4students. Dorms with no `dorm_images` rows fall back to their single `image_url` on the detail page, so this is optional, not launch-blocking.

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
| `RESEND_FROM` | Optional — `Dormra <alerts@dormra.eu>` after domain verify |
| `NEXT_PUBLIC_SITE_URL` | `https://dormra.eu` |
| `ADMIN_EMAILS` | Your email(s), comma-separated — enables `/admin` dashboard |

After adding/changing vars → **Redeploy** production.

### 2.1 Rotate secrets (if exposed)

If `CRON_SECRET`, Supabase service role key, or `RESEND_API_KEY` were ever pasted in chat, tickets, or commits:

1. Generate new values (see §3 for `CRON_SECRET`).
2. Update **Vercel** production env vars.
3. Update **cron-job.org** auth header on all 3 jobs.
4. Rotate Supabase service role key in Supabase → Settings → API.
5. Revoke old Resend key in Resend dashboard.
6. Redeploy Vercel.

---

## 3. cron-job.org — scrape scheduler

**Why:** Dorm availability updates every 15 minutes. A single job scraping all ~40 dorms (including OeAD via Playwright) exceeds Vercel’s 300s limit and gets **504**. Use **three jobs** instead.

**Header (all jobs):**

```
Authorization: Bearer YOUR_CRON_SECRET
```

Must match `CRON_SECRET` in Vercel exactly. Set **request timeout** to **300 seconds** on each job.

### Option A — three jobs (recommended)

| Job | Title | URL | Schedule (UTC) |
|-----|-------|-----|----------------|
| 1 — Fast + prune | Dormra fast scrape | `https://dormra.eu/api/cron/scrape?providers=stuwo,home4students&prune=1` | Every 15 min: `*/15 * * * *` |
| 2 — OeAD batch 0 | Dormra OeAD batch 0 | `https://dormra.eu/api/cron/scrape?provider=oead&batch=0&batches=2` | `5,20,35,50 * * * *` |
| 3 — OeAD batch 1 | Dormra OeAD batch 1 | `https://dormra.eu/api/cron/scrape?provider=oead&batch=1&batches=2` | `10,25,40,55 * * * *` |

Job 1 refreshes STUWO + home4students quickly and prunes old snapshots once per cycle. Jobs 2–3 split OeAD (~26 dorms) so each run finishes under 300s.

### Manual steps

1. Open [cron-job.org console](https://console.cron-job.org/).
2. **Disable or delete** the old single-job entry (if present).
3. Create the three jobs above with the auth header and 300s timeout.
4. **Enable** all three (disabled jobs stay off until you turn them back on).
5. After first run, check JSON: `{ "ok": true, "scraped": N, ... }`.

### Automated setup (optional)

If you have a cron-job.org API key (Console → Settings):

```bash
export CRON_JOB_ORG_API_KEY='your-api-key'
export CRON_SECRET='same-as-vercel'
./scripts/setup-cron-jobs.sh
```

### Generate CRON_SECRET (if rotating)

```bash
openssl rand -base64 32
```

Update Vercel **and** all three cron-job.org jobs.

**Failure signs:**

- `401 Unauthorized` → secret mismatch
- `404 Not Found` → deploy missing the route, or i18n proxy intercepting `/api/*` (fixed in proxy matcher)
- `500` → missing `SUPABASE_SERVICE_ROLE_KEY` or DB error
- `504 Gateway Timeout` → job URL too broad; use the split URLs above
- Job **disabled automatically** on cron-job.org → too many consecutive failures. Fix the error, then re-enable (or run the setup script).

### 3.1 Verify cron + test alert (curl)

Replace `YOUR_CRON_SECRET` with the Vercel value.

**Fast job (should return 200 in ~30s):**

```bash
curl -sS -H "Authorization: Bearer YOUR_CRON_SECRET" \
  "https://dormra.eu/api/cron/scrape?providers=stuwo,home4students"
```

**Dry-run alert match (no email sent):**

```bash
curl -sS -H "Authorization: Bearer YOUR_CRON_SECRET" \
  "https://dormra.eu/api/test-alert?slug=oead-guadenzdorf&dryRun=1"
```

**Send one test email to your admin address:**

```bash
curl -sS -H "Authorization: Bearer YOUR_CRON_SECRET" \
  "https://dormra.eu/api/test-alert?slug=oead-guadenzdorf&email=kulchankas@gmail.com"
```

`email` must match `ADMIN_EMAILS`. Check inbox + Resend dashboard + `/admin` → Email log.

---

## 4. Resend — email domain (high)

**Why:** Alerts currently send from `onboarding@resend.dev` (sandbox). Production deliverability is poor.

**Steps:**

1. [Resend Dashboard](https://resend.com/domains) → **Add Domain** → `dormra.eu`
2. Add DNS records (SPF, DKIM) at your DNS provider.
3. Wait for verification (usually minutes to hours).
4. Update sender via Vercel env var (no code change needed after deploy):

   ```
   RESEND_FROM=Dormra <alerts@dormra.eu>
   ```

   Or edit `lib/email.ts` if you prefer hardcoding. Default is `onboarding@resend.dev` (sandbox).

5. Send a test alert (trigger a scrape transition or use Resend test send).

---

## 5b. Google OAuth (required for “Continue with Google”)

**Verified 2026-07-03:** Supabase auth logs show `provider is not enabled` and `/auth/v1/settings` returns `"google": false`. The app code is ready; you must enable the provider in Supabase.

**If "Continue with Google" fails or redirects to localhost:**

### Supabase URL Configuration

Same as §5 — **Site URL** must be `https://dormra.eu` (not `localhost:3000`).

### Enable Google provider

**Supabase → Authentication → Providers → Google** → Enable, add Client ID + Secret.

### Google Cloud Console

**APIs & Services → Credentials → OAuth 2.0 Client ID (Web application)**

| Field | Value |
|-------|--------|
| Authorized JavaScript origins | `https://dormra.eu`, `https://vmnnvtifpknakerduioq.supabase.co` |
| Authorized redirect URIs | `https://vmnnvtifpknakerduioq.supabase.co/auth/v1/callback` |

The redirect URI is **Supabase's callback**, not `dormra.eu/auth/callback`.

---

## 6. Supabase Auth — redirect URLs (email / magic link / password reset)

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

## 7. Post-deploy smoke tests

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
| Cron | Split jobs (§3.1 curl) or wait 15 min | `ok: true`; admin shows fresh scrape times |
| Test alert email | §3.1 curl with `email=` | Email arrives; Resend + `/admin` log |

---

## 8. Optional — monitoring

- **Vercel Web Analytics**: `@vercel/analytics` is wired into `app/[locale]/layout.tsx` — no env vars needed, but it only reports data once **Analytics** is turned on for the project in Vercel Dashboard → your project → **Analytics** tab. Locally/in preview it runs in debug mode and logs to the browser console instead of sending data.

Not set up yet. Consider before scale:

- **Vercel** → Observability / Logs for cron route errors
- **Supabase** → Database size alerts (`availability_snapshots` grows ~5k rows/day)
- **Uptime** ping on `https://dormra.eu` and cron endpoint

---

## 9. Admin dashboard & monitoring

**In-app:** After setting `ADMIN_EMAILS`, log in and open `/admin` (or via header menu → Admin).

**Full guide:** [`MONITORING.md`](./MONITORING.md) — Vercel logs, cron-job.org, Supabase, Resend.

---

## 10. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Cron returns `401` | `CRON_SECRET` mismatch | Compare Vercel env vs cron-job.org header exactly |
| Cron returns `500` | Missing service role key | Set `SUPABASE_SERVICE_ROLE_KEY` in Vercel, redeploy |
| OAuth / reset link fails | Redirect URL not whitelisted | Supabase Auth → URL Configuration (§5) |
| Alerts empty for anon curl | RLS working correctly | Use authenticated session to test |
| Emails not arriving | Resend sandbox / spam | Verify domain (§4), check Resend logs |
| German/Russian 404 | i18n PR not merged | Merge `cursor/i18n-de-ru-5868` |
| Stale availability | Cron not running | Enable 3 jobs on cron-job.org (§3) |
| Cron returns `504` | Single full scrape job | Use split URLs (§3) — merged in PR #39 |

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

- [`YOUR_TODO.md`](./YOUR_TODO.md) — **your personal checklist**
- [`LAUNCH_CHECKLIST.md`](./LAUNCH_CHECKLIST.md) — one-page launch order
- [`MONITORING.md`](./MONITORING.md) — where to watch activity
- [`PROJECT_AUDIT.md`](./PROJECT_AUDIT.md) — full audit and code roadmap
- [`../README.md`](../README.md) — dev setup and architecture
