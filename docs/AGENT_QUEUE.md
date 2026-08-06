# Agent queue — daily scratch pad

Rough tasks you jot down during the day. A **scheduled night agent** reads the **Draft** section, turns bullets into a todo list, implements what it can, then writes a **Nightly report** below.

**Do not put secrets** (API keys, passwords) in this file.

---

## Rules for the night agent

- Process only the **latest dated Draft section** unless told otherwise.
- Work through **all tasks in priority order** — do not stop after a fixed count. If time or runtime runs out, finish the current task cleanly, then list remaining items under **Issues / blockers → Deferred** in the nightly report.
- **Priority:** order in the draft = priority (top first). You can prefix `P1` / `P2` / `P3` or `1.` / `2.` if you want to be explicit.
- Prefer small, shippable PRs — branch name `cursor/<short-description>-fc38`.
- Run lint/build/tests before committing when code changes.
- If a task is ambiguous, **skip it** and explain why in the report (do not guess on auth, billing, or production data).
- Never deploy or change Supabase production without explicit instruction in the draft.
- When done: move completed draft bullets to **Done archive**, clear that draft section, append a **Nightly report**.

---

## Draft

Write messy bullets here. One `## Draft — YYYY-MM-DD` section per day.

<!-- Draft cleared 2026-07-04 — see nightly report and Done archive -->

---

## Done archive

Completed items moved here by the night agent (newest date first).

### From draft — 2026-07-04

- [x] track your application status is bullshit. people won't do it manually. it should be more automated and smarter
- [x] work on ui/ux (especially dorm cards, look too boring)
- [x] dormspot.nl change strategy to housing hunting(?) is it good for austria and overall?
- [x] consistency with 8 different websites but 11 providers, correct text
- [x] add ukrainian
- [x] add more pictures of dorms

### From draft — 2026-07-03

- [x] put more info about the dorm on dorm page
- [x] dashboard/user page not opening when i click on my email in top right corner when logged in ( maybe change it on icon)
- [x] is it possible to apply through the dormra website without redirecting to provider website. if yes - work on it
- [x] ability to log out
- [x] copy filter options from other providers websites
- [x] add other dorms
- [x] write down list of students groups/ chats and so on where i can in fiture promote/ post info about dormra
- [x] search bar - strings layout (somewhere middle/ somewhere from the lest - correct)
- [x] research if i need to start company if i add subscriptions in austria
- [x] make custom map instead of open source one with our brand design

---

## Nightly reports

Newest report at the top. The agent adds one block per run.

## Nightly report — 2026-08-06

**Branch(es) / PR(s):** `cursor/dormra-nightly-agent-queue-d542` → main

### Summary

No tasks in queue. The Draft section had no dated bullets for tonight (last draft cleared 2026-07-04). No code changes.

### Completed

- None — empty draft.

### Issues / blockers

- None.

### Ideas for later

- Add new bullets under `## Draft — YYYY-MM-DD` when you have tasks for the next run.

### Manual tasks for you

- None from tonight's run.

## Nightly report — 2026-07-04

**Branch(es) / PR(s):** `cursor/dormra-nightly-agent-queue-222d` → main

### Summary

Processed all 6 draft items from 2026-07-04. Shipped smart application tracking (auto-mark on Apply click), dorm card visual refresh, Ukrainian locale, consistent “8 websites / 11 providers” copy, ÖJAB dorm images seed, and a housing-hunting strategy research doc.

### Completed

- **Application tracker** — `ApplyButton` auto-saves and marks status `applied` on click; return banner after provider tab; `utm_source=dormra` on outbound links; updated tracker copy (`recordApplyClick` server action)
- **Dorm cards UI** — Availability accent bar, stronger typography, brand-tinted provider badge, `/month` label, improved placeholder and hover states
- **Housing hunting research** — `docs/HOUSING_HUNTING_STRATEGY.md` (Roomspot vs alert-first model; recommendation: stay alert-first for Austria)
- **Provider copy consistency** — `lib/providers.ts` canonical list (11 orgs, 8 websites); hero/how-it-works/FAQ/stats updated in en/de/ru/uk
- **Ukrainian locale** — `uk` in routing, `messages/uk.json`, language switcher, email bundles, date locale, Onest Cyrillic styling
- **More dorm pictures** — `supabase/seeds/ojab_dorm_images.sql` (15 ÖJAB thumbnails); `www.oejab.at` added to Next.js image allowlist
- **101 tests pass**; **build succeeds**; lint warnings only (pre-existing)

### Issues / blockers

- None. All draft items completed.

### Ideas for later

- Saved-dorm availability emails when cron detects openings for tracked dorms
- Stale-status nudges (“heard back from provider?”) after N days in `applied`
- ÖJAB live scraper (images + seed exist; availability still unknown)
- Expand Ukrainian translations beyond ru-derived base in `uk.json`

### Manual tasks for you

- [ ] Apply ÖJAB image seed to production Supabase: `psql $DATABASE_URL -f supabase/seeds/ojab_dorm_images.sql` (after ÖJAB dorm seed if not yet applied — see [`docs/MANUAL_TASKS.md`](./MANUAL_TASKS.md))
- [ ] Review `docs/HOUSING_HUNTING_STRATEGY.md` before any positioning/marketing pivot
- [ ] Merge PR when happy with preview deploy

## Nightly report — 2026-07-03

**Branch(es) / PR(s):** `cursor/dormra-nightly-agent-queue-7dd3` → main

### Summary

Processed all 10 draft items. Shipped UX fixes (header dashboard link, sign-out, hero search alignment), richer dorm detail pages with application tracker, expanded filter quick-chips, branded map tiles, ÖJAB seed data (15 Vienna dorms), and three operator docs (apply flow, promotion channels, Austria subscriptions research).

### Completed

- **Dorm detail page** — “At a glance” card (provider, district, address, availability), price/deposit breakdown, provider info section, logged-in application tracker panel (`DormTrackerPanel`)
- **Header** — Avatar + email now link directly to `/dashboard`; chevron opens account menu; desktop sign-out icon button added
- **Apply-through-Dormra** — Researched: not feasible without provider APIs. Documented in `docs/APPLY_FLOW.md`; shipped in-app tracker UX instead
- **Log out** — More discoverable via header icon + existing dropdown/mobile menu/settings
- **Filters** — Added quick chips: Under €400, Furnished, Short stay OK, Deposit ≤2 mo
- **ÖJAB dorms** — `supabase/seeds/ojab_vienna.sql` (15 buildings, geocoded; no scraper yet — availability stays unknown)
- **Promotion channels** — `docs/PROMOTION_CHANNELS.md` (Facebook, Reddit, Telegram, ÖH/ESN, timing)
- **Hero search** — Unified `SearchSegment` layout so labels/values align consistently
- **Austria subscriptions** — `docs/SUBSCRIPTIONS_AUSTRIA.md` (Einzelunternehmen vs GmbH, VAT, checklist)
- **Branded map** — Carto Voyager tiles + warm CSS tint (replaces raw OSM)
- Lint warnings only (pre-existing); **98 tests pass**; **build succeeds**

### Issues / blockers

- None. All draft items completed.

### Ideas for later

- ÖJAB scraper registration (seed data exists but no live availability)
- Wire hero `moveIn` date to actual dorm filtering (currently display-only on `/dorms`)
- Full custom map style (Mapbox/MapLibre style JSON) if Carto tint is not enough
- “Application checklist” wizard that opens provider tabs step-by-step

### Manual tasks for you

- [ ] Apply ÖJAB seed to production Supabase: `psql $DATABASE_URL -f supabase/seeds/ojab_vienna.sql` (see [`docs/MANUAL_TASKS.md`](./MANUAL_TASKS.md))
- [ ] Review `docs/SUBSCRIPTIONS_AUSTRIA.md` with a Steuerberater before enabling paid tiers
- [ ] Merge PR when happy with preview deploy

<!-- Agent template:

## Nightly report — YYYY-MM-DD

**Branch(es) / PR(s):** …

### Summary
…

### Completed
- …

### Issues / blockers
- …
- **Deferred** (ran out of time — do next run): …

### Ideas for later
- …

### Manual tasks for you
- [ ] … (link to docs/MANUAL_TASKS.md section if relevant)

-->
