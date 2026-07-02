# Dormra UI/UX Audit

Last updated: 2026-07-02
Scope: `/`, `/dorms`, `/dorms/[slug]`, `/dashboard/*`, auth pages, `/how-it-works`, header/footer, and shared UI primitives.
Method: full read-through of pages/components, running the app locally (`npm run dev`) with Playwright for interaction/rendering checks, plus `npm run lint` / `npm run typecheck` / `npm run test`.

This complements [`PROJECT_AUDIT.md`](./PROJECT_AUDIT.md) (backend/architecture-focused) with a UI/UX-focused pass. Where an item overlaps with an existing tracked issue, the item number is referenced.

---

## Executive summary

Dormra's frontend is unusually polished for a beta: consistent warm/minimal design language, sensible empty states, shareable filter URLs, honest "coming soon" treatment for unshipped features, and thoughtful mobile patterns (bottom sheets, sticky CTAs). The biggest issues found were **one confirmed functional bug** (sort dropdown showing raw values), a handful of **accessibility gaps** (touch targets, skip link — now fixed), and **several consistency/polish gaps** rather than fundamental design problems.

Six items below were fixed directly as part of this audit (marked ✅ Fixed). The rest are prioritized recommendations.

---

## Fixed in this pass

| # | Issue | Where | Fix |
|---|-------|-------|-----|
| F1 | **Sort dropdown showed raw enum value** (`price_asc`) instead of a translated label, in all 3 locales, on every page load | `components/DormsDirectory.tsx` | Base UI's `Select.Value` renders the raw value unless given an `items` map or a function `children`. Added a `sortLabels` lookup and function child so it renders `t('sortPriceLow')` etc. |
| F2 | **`/dorms` loading skeleton never rendered** — data was awaited *before* the `Suspense` boundary, so `loading.tsx`'s skeleton was dead code (tracked as PROJECT_AUDIT 3.5) | `app/[locale]/dorms/page.tsx` | Extracted data-fetching into an async `DormsData` child rendered inside `<Suspense>`, matching the pattern already used on the homepage (`DormsPreview`, `LiveStats`) |
| F3 | **No skip-to-content link** for keyboard/screen-reader users (tracked as PROJECT_AUDIT 4.3) | `app/[locale]/layout.tsx` | Added a standard `sr-only focus:not-sr-only` skip link targeting a new `#main-content` wrapper, translated in all locales |
| F4 | **Hardcoded English strings** in `DistrictGrid` ("Clear (3)", "Leave empty to match any district.") despite the app otherwise being fully localized (part of PROJECT_AUDIT 3.3) | `components/DistrictGrid.tsx` | Now uses `useTranslations('alertForm')`; added `districtsHint` / `districtsClear` keys to `en.json`/`de.json`/`ru.json` |
| F5 | **Touch targets below 44px** for the district-number grid in the alert form, quick-filter chips, district-preset chips, and filter-chip remove buttons on `/dorms` — violates the project's own UX principle ("touch targets ≥44px") | `components/DistrictGrid.tsx`, `components/DormsDirectory.tsx` | District buttons: `h-8`→`h-11`. Chips: added invisible hit-area expansion (same `after:absolute` technique already used by `components/ui/checkbox.tsx`), sized conservatively to avoid overlapping adjacent chips in wrapped rows |
| F6 | **Inconsistent CTA sizing** — the two CTA buttons at the bottom of `/how-it-works` used the tiny default Button size (32px, square corners) while every other primary CTA on the site uses the `h-11 rounded-full` pill pattern | `app/[locale]/how-it-works/page.tsx` | Matched the site-wide CTA pattern |

All changes pass `npm run typecheck`, `npm run lint`, and `npm run test` (42/42), and were verified visually with Playwright screenshots at mobile (390px) and desktop (1280px) widths.

---

## Remaining findings, prioritized

### High priority

**H1 — Hardcoded English in price/district formatting helpers** (tracked as PROJECT_AUDIT 3.3, not yet fixed)
`lib/helpers.ts`'s `formatDistrictLabel()` and `formatPriceLabel()` return raw English strings ("3rd district", "From €600 / month", "Price on request") regardless of locale. These strings appear on `DormCard`, dorm detail pages, and the dorms directory — i.e. exactly the pages a German or Russian-speaking user is most likely to be using. This undermines the otherwise-thorough i18n work. *Fix requires threading a `t` function into these helpers (or moving the formatting into components that already have `useTranslations`), plus new keys in all three locale files.*

**H2 — `ScanningPill` implies real-time activity it doesn't have**
`components/ScanningPill.tsx` cycles through Vienna district names every 2.2s next to a pulsing "live" dot, suggesting Dormra is actively scanning that specific district right now. In reality it's a client-side `setInterval` with no connection to actual scraper activity (scrapers run every 15 minutes, batch-wise, not per-district in real time). This is flagged as cosmetic in PROJECT_AUDIT (4.1) but is worth escalating: it sits close to the "honest copy" principle in the project's own UX guidelines. *Recommendation: either wire it to a real "last scraped" timestamp per provider (`GET /api/cron/scrape` already returns this data), or soften the copy/animation so it reads as an illustrative loop rather than live telemetry.*

**H3 — `/dorms` has no resilience to a Supabase outage**
Unlike the homepage (`LiveStats` wraps its Supabase call in try/catch and falls back to static numbers), `app/[locale]/dorms/page.tsx`'s data fetch has no error handling. A network-level Supabase failure (not just an empty result) will propagate to `app/[locale]/error.tsx`'s generic "Something went wrong" screen instead of the branded empty state that already exists for zero results. Since `/dorms` is the core product page, a transient Supabase blip currently means the entire browsing experience 500s instead of degrading gracefully.

### Medium priority

**M1 — Move-in date filter looks functional but silently does nothing**
The hero search and `/dorms` both let users pick a move-in date, and `/dorms` shows a banner ("intake-date filtering isn't live yet") only *after* the user has already set the date and landed on results — the date field itself gives no upfront signal that it doesn't filter anything yet. A first-time user filling out the hero search reasonably expects the date to narrow results. *Recommendation: add a subtle "(optional — for alerts, not filtering yet)" hint directly on the date picker, not just a banner after the fact.* (Related to PROJECT_AUDIT 3.1/3.2.)

**M2 — Sort-order label mismatch on the "no active filters" state**
`t('allSorted', { sort: filters.sort === 'price_asc' ? t('sortPrice') : t('sortSelection') })` in `DormsDirectory.tsx` only special-cases `price_asc`; every other sort mode (`available_first`, `district_asc`, `created_desc`) falls back to the generic "sortSelection" copy even though the Select clearly shows the specific sort chosen. Minor, but it's an easy quick win to make this text mirror the actual selected `sortLabels` value now that a lookup map exists.

**M3 — Dashboard "coming soon" cards are the least discoverable pattern for a beta**
`Saved dorms` and `Application tracker` cards on `/dashboard` are dimmed with a small "Coming soon" label — good adherence to the project's own "no decorative controls" rule, but the cards are still large, prominent grid items competing visually with the one working feature (Alerts). *Recommendation: consider deprioritizing unshipped features to a single compact "What's next" row/list rather than three equal-weight grid cells, so the one functional card doesn't have to compete 1-of-3 for attention.*

**M4 — Dashboard and dorm detail pages have no loading skeleton**
Tracked as PROJECT_AUDIT 3.7. `/dashboard`, `/dashboard/alerts`, and `/dorms/[slug]` have no `loading.tsx`, so navigation shows a blank white flash before content appears (most noticeable on slower connections, which matters for a mobile-heavy student audience).

**M5 — Alert list cards bury the "how many dorms match right now" signal**
On `/dashboard/alerts`, the match-count pill (`{matchCount} dorms match`) is useful but sits below a wall of small badges (pets/couples/deposit/email), competing for attention. Given alerts exist specifically so users don't have to keep checking manually, surfacing "3 dorms match right now" more prominently (e.g., as a colored stat rather than a same-weight pill) would reinforce the core value prop every time a user opens the page.

**M6 — Email-only notification toggle can look like a broken control**
In `AlertForm`, the Telegram toggle is visibly `disabled` with "Coming soon" copy (good — follows the project's own rule of not decorating with dead controls), but the Email toggle can *also* be switched off, which then blocks submission with a toast ("Email notifications must stay on"). Since Telegram doesn't work yet and Email is the only channel, disabling Email effectively creates a "silent alert" state that's caught only at submit time. *Recommendation: disable the Email switch too (or clarify inline that at least one channel is required) rather than relying on a post-submit toast.*

### Low priority / polish

**L1 — `AvailabilityBadge` on `fully_booked` and `unknown` states has borderline contrast**
`bg-foreground/80 text-white` (fully booked) and `bg-surface/90 text-muted-foreground ring-1 ring-border` (unknown) are both fine at normal reading distance, but the "unknown" badge (muted-on-white-ish) is noticeably lower-contrast than the "available" badge (`bg-brand-accent text-white`), making it easy to visually skim past dorms with unknown availability, which is a meaningfully different state users should notice.

**L2 — Provider trust badges in the hero ("ÖJAB · soon", "Akademikerhilfe · soon") add visual noise for a first-time visitor**
The hero's provider row is a nice trust signal for the 3 live providers, but appending 3 more "· soon" badges before any content has loaded adds cognitive load to the very first thing a new visitor reads. Consider showing only live providers by default with a "+3 more soon" affordance instead of listing every planned integration inline.

**L3 — `DistrictGrid`'s `title` attribute is the only way to see full district names**
The compact number grid (`components/DistrictGrid.tsx`) relies on a native `title` tooltip (hover-only) to reveal which number maps to which district (e.g. "3. Landstraße"). This is unusable on touch devices — mobile users filtering by district in the alert form have to guess or scroll to the summary line below the grid. Since the summary line already exists (`{selected.map(...)}`), consider always showing a compact legend or making the numbers themselves more discoverable (e.g., a `Popover` on tap, consistent with `HeroSearch`'s use of `Popover` elsewhere).

**L4 — No sitemap/robots.txt** (tracked as PROJECT_AUDIT 3.10) — indirectly a UX issue since it affects how easily students can find Dormra via search for a given district/provider.

**L5 — Header nav has no active-page indicator on desktop**
`components/HeaderNav.tsx`'s mobile counterpart (`HeaderMobileMenu`) highlights the active route (`bg-brand-soft font-medium text-brand`), but worth double-checking the desktop `HeaderNav` does the same — if not, users lose a small but standard orientation cue when browsing between `/dorms`, `/dashboard/alerts`, and `/how-it-works`.

---

## Notable strengths (for balance)

- **Shareable, stateless filtering** — `/dorms` encodes all filters in the URL (`?maxPrice=600&districts=3,9`), which is exactly right for a directory product and enables the "share your search" messaging.
- **Consistent empty states** — every list view (no dorms, no filter matches, no alerts) follows the same icon + headline + one-line hint + primary action pattern the project's own skill file prescribes.
- **Honest feature gating** — Telegram and application-tracker UI is visibly disabled/dimmed rather than silently broken, and `README.md` documents exactly what's shipped vs. planned.
- **Mobile-first interaction patterns** — bottom sheets for search and filters, sticky apply/alert CTAs on the dorm detail page, and a dedicated mobile search summary button are all well-executed and match platform conventions.
- **Design token discipline** — colors, radii, and shadows are centralized in `globals.css` and consistently reused; no ad-hoc hex codes or one-off shadows found during this audit.

---

## Suggested next steps

1. Fix **H1** (i18n price/district formatters) — highest-leverage remaining item since it's user-facing on every dorm listing in non-English locales.
2. Add error handling to `/dorms` (**H3**) — cheap, prevents full-page failure from a transient Supabase issue.
3. Resolve the honesty/perception gap in **H2** (`ScanningPill`) — either wire to real data or soften the copy.
4. Batch the Medium items (M1–M6) into a single "dashboard & alerts polish" pass, since they're all small, localized changes.
