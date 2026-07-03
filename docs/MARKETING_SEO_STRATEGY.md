# Dormra — Marketing, SEO & Promotion Strategy

Last updated: 2026-07-03
Status: **planning document** — see the gating rule in §0 before executing anything here.

Related docs: [`STRATEGY.md`](./STRATEGY.md) (business thesis, phases 1-4),
[`LAUNCH_CHECKLIST.md`](./LAUNCH_CHECKLIST.md) (operator steps),
[`RESEARCH_STUDENT_VOICE.md`](./RESEARCH_STUDENT_VOICE.md) (student pain points this plan leans on),
[`COMMUNITY_REVIEWS.md`](./COMMUNITY_REVIEWS.md) (The Grapevine — the main content/UGC engine this plan uses).

---

## 0. The gate: don't market a broken promise

`STRATEGY.md` already establishes this and it overrides everything below:
**Phase 1 (cron running continuously, auth URLs correct, one real student gets one
real correct alert) must be true before any distribution spend — paid or
organic — starts.** Dormra's entire pitch is "we watch every dorm so you
don't have to." If a student sets an alert during a marketing push and the
cron scheduler is silently off, or a scraper reports stale data, the first
impression is a broken promise from a housing service — precisely the kind
of trust failure the DSA/scam research in `RESEARCH_STUDENT_VOICE.md`
flagged as terrifying to this audience. That's disproportionately costly to
recover from in a niche, word-of-mouth-driven market.

**What that means in practice for this document:**
- §2-5 (SEO foundations, content, technical work) can and should start now —
  they're code and content, not outreach, and Google needs lead time to
  index anyway (a page published today doesn't rank tomorrow).
- §6-8 (active promotion: social posting, community seeding, launch push)
  should wait for the Phase 1 sign-off in `LAUNCH_CHECKLIST.md`.
- The one exception: **quiet, low-stakes SEO content and infrastructure
  work is the correct thing to be doing while Phase 1 finishes**, since it
  has a lead time of its own and compounds while you fix the scheduler.

---

## 1. Positioning & audience

### 1.1 One-line positioning

*"Every Vienna student dorm, one search, real availability — and the
honest reviews the providers won't show you."*

The reviews half of that sentence is new leverage most competitors don't
have (see §3) — lead with it once The Grapevine has real content, not
before (an empty reviews section undercuts the pitch).

### 1.2 Primary personas

| Persona | Need | Where they search | What converts them |
|---|---|---|---|
| **Incoming international/exchange student** (never been to Vienna) | Certainty before arrival — can't view in person, scared of scams | Google (English), university international-office pages, WhatsApp/Telegram groups from their home university, Facebook | Trust signals: real scrape timestamps, "no scams" framing, provider legitimacy, reviews in English |
| **Incoming Austrian/domestic first-year** | Speed — decision made late, local | Google (German), TikTok/Instagram, friends already in Vienna, ÖH channels | Speed-to-answer, mobile-first UX, alert-and-forget |
| **Returning student switching dorms/looking for a WG** (see `RESEARCH_STUDENT_VOICE.md` §7) | Better price/independence after year 1 | Facebook groups (WG Wien), word of mouth | Out of current scope (dorms only) — but a warm audience for future WG expansion; don't actively market to them yet, don't alienate them either |
| **Parent/guardian researching on behalf of a student** (common for first-year, especially international) | Reassurance, safety, price clarity | Google (often not the student's home language) | Clear pricing, "how it works," visible safety/scam guidance |

### 1.3 Why RU as a third locale matters for positioning

Dormra already ships EN/DE/RU. Ukrainian, Russian, Belarusian, and Central
Asian students are a real, underserved segment of Vienna's international
student population, and Russian-language search volume for Austrian
student housing has very little dedicated competition (most competitor
content is DE/EN only — see §3). This is a genuine, low-competition wedge;
don't treat RU as an afterthought locale in content or promotion.

---

## 2. Competitive & channel landscape (what's already ranking)

Research for this and the companion `RESEARCH_STUDENT_VOICE.md` doc
surfaced the actual organic competition for "Vienna student dorm" queries.
Worth naming explicitly since SEO strategy is partly about knowing who you
need to outrank:

| Competitor type | Examples found | Their weakness Dormra can exploit |
|---|---|---|
| **Individual provider sites** (OeAD, STUWO, ÖJAB, home4students…) | oead.at, stuwo.at, oejab.at | Each only shows *their own* buildings — structurally can't aggregate, which is Dormra's entire reason to exist |
| **Aggregator content/blog sites** | istadi.com, meinplan.at, uniscopio.com | Static content, no live availability, no per-user alerts, and — critically — **no real user reviews**, just editorial summaries |
| **Generic Q&A / forum threads** | gutefrage.net, wiwi-treff.de, iAgora | Real student voice (valuable, ranks well) but scattered, unstructured, not searchable by building, no aggregate rating |
| **Reddit** | r/wien, r/Austria, r/tuwien | Thin, scattered coverage of Vienna dorms specifically (confirmed during research — no dedicated subreddit) — an opportunity to *be* the place this content lives, not compete with it |
| **University international-office PDFs/pages** | tuwien.at, wu.ac.at housing guides | Authoritative and heavily linked (good backlink targets, see §5.4), but static, not real-time, not searchable |

**The gap Dormra fills that nothing above does simultaneously:** real-time
availability + every provider in one place + genuine per-building user
reviews + free alerts. Every piece of content and every backlink pitch
should reinforce that combination, not just "we're also a dorm site."

---

## 3. SEO strategy

### 3.1 Technical SEO — current state

Already solid, confirmed in the codebase:

- ✅ Locale-aware sitemap (`app/sitemap.ts`) covering static pages + every
  active dorm, in all 3 locales
- ✅ `robots.txt` correctly disallowing `/dashboard/`, `/admin/`, `/api/`,
  `/auth/`
- ✅ Canonical URLs + full hreflang alternates (`en`/`de`/`ru`/`x-default`)
  via `buildPageMetadata` on every page
- ✅ `ApartmentComplex` JSON-LD on dorm detail pages (name, address, geo,
  price range, images)
- ✅ Fast Core Web Vitals path: SSR directory + Suspense, Next/Image via
  `DormImage`, no client-side data waterfalls on first load

Gaps closed as part of this plan (implemented alongside this document —
see the PR this ships in):

- ❌→✅ **No Open Graph / Twitter Card metadata anywhere.** Every shared
  link (Facebook groups, WhatsApp, Telegram — exactly the channels in §6)
  rendered as a bare URL with no image or description. Added site-wide OG
  + Twitter Card metadata and a branded dynamic OG image.
- ❌→✅ **No `Organization`/`WebSite` JSON-LD on the homepage.** Added —
  this is also what unlocks a Google sitelinks search box over time.
- ❌→✅ **No `FAQPage` JSON-LD** despite `/how-it-works` already having a
  7-question accordion (including the two scam-safety/multi-apply FAQs
  added this session) — free rich-snippet real estate, now wired up.
- ❌→✅ **Dorm JSON-LD didn't include `aggregateRating`** even though The
  Grapevine now produces exactly that data. Wired the review summary into
  the existing `ApartmentComplex` schema — star ratings can now appear
  directly in Google search results once dorms have enough reviews.

Still open (flagged, not built — needs product decisions or data first):

- **`opengraph-image` is currently a single static template.** Once a dorm
  has a real photo, a per-dorm dynamic OG image (photo + price + rating)
  would meaningfully lift click-through when a specific dorm link is
  shared — revisit once the gallery/rating data is consistently populated.
- **No `BreadcrumbList` JSON-LD** on dorm detail pages (Home → Dorms →
  District → Dorm name) — small, safe addition, low priority vs. the above.
- **No dedicated blog/content route.** Needed for §3.3 and §4 below; not
  built yet because it's a genuine content commitment, not a code toggle.

### 3.2 Keyword strategy

Three intent tiers, mapped to what already exists or should be built:

| Intent | Example queries | Page type | Status |
|---|---|---|---|
| **Transactional/BOFU** ("I want to book this specific place") | "STUWO Spengergasse Erfahrungen", "OeAD Gänsbachergasse Preis" | Individual dorm detail pages | ✅ Live — this is where The Grapevine reviews create real differentiation vs. every competitor in §2 |
| **Commercial/MOFU** ("help me pick between options") | "ÖJAB vs STUWO", "günstigstes Studentenheim Wien", "Studentenheim nähe TU Wien" | Comparison / near-university landing pages | ❌ Not built — see §3.3 |
| **Informational/TOFU** ("how does this process work at all") | "Studentenheim Wien bewerben", "wie vermeide ich Wohnungsbetrug Wien", "wann für Studentenheim Wien bewerben" | `/how-it-works` FAQ, future blog posts | ⚠️ Partial — FAQ covers this now for EN; needs DE/RU search-intent-matched phrasing review, and a proper blog for depth |

Every dorm detail page is already a strong BOFU asset. The immediate content
gap is MOFU (comparison pages) and TOFU (how-to content) — see §3.3 and §4.

### 3.3 Programmatic SEO — build this carefully, not aggressively

**Important 2026 context:** Google's scaled-content-abuse enforcement has
sharply raised the bar for templated pages since March 2026. Sites that
swap a keyword across an identical template with no real synthesis get
penalized site-wide, not just on the thin pages. **Do not** build hundreds
of near-identical "Studentenheim in Bezirk N" pages with boilerplate text.

What *does* still work, and what Dormra is unusually well-positioned to
do because the underlying data is genuinely unique per page (this is
exactly the "aggregation is the value-add" pattern the research calls out
as still ranking well):

1. **"Dorms near [university]" pages** (`/dorms/near/tu-wien`, `/uni-wien`,
   `/wu-wien`, `/boku`, `/meduni` — `lib/universities.ts` already has the
   canonical university list and `nearestUniversities()` distance math).
   Each page is genuinely unique: real computed distances (already built),
   real live price range for that cohort, real aggregate Grapevine rating
   per dorm, a short (100-150 word) human-written intro per university
   covering things generic to that student body (e.g. TU Wien students
   skew toward the 4th/5th/10th districts; BOKU toward the 19th). This
   clears the "≥60% unique content, 3+ data sources per page" bar from
   current best practice — it's live pricing + live availability + real
   reviews + editorial synthesis, not a keyword-swapped template.
2. **District pages** (`/dorms/districts/9` etc.) — lower priority than
   university pages (districts are a weaker purchase-intent signal than
   "near my specific university"), but the same real-data pattern applies
   if built: live listings + aggregate stats for that district, not filler.
3. **Do not** build a page for every possible filter combination (e.g.
   "dorms under €400 with pets in the 15th district") — that's exactly the
   "keyword variant capture" pattern flagged as high-risk. The existing
   `/dorms?...` filtered URL already serves that need and is properly
   canonicalized to the base `/dorms` page (confirm this stays true —
   filter query params should not each generate a separate indexed,
   near-duplicate canonical).
4. Every programmatic page needs a genuine "last updated" freshness signal
   (Dormra already has this pattern via `lastCheckedAt` — reuse it) and
   should be `noindex`ed automatically if it has too little underlying
   data (e.g. a university with only 1-2 nearby dorms isn't worth indexing
   yet — gate page generation on a minimum dorm count, not just "one page
   per entity in the taxonomy").

### 3.4 Off-page / link building

Low-volume, high-relevance backlinks matter far more here than raw count:

- **University international-office housing pages** (TU Wien, WU Wien, Uni
  Wien, BOKU, MedUni — all already linked in the research as maintaining
  static provider lists). A direct outreach ask: "we built a live tracker
  across every provider you list — would you add it as a resource?" This
  is a warm, specific pitch, not cold spam, and these pages are exactly
  where the highest-intent, most trust-sensitive audience (incoming
  international students, per persona #1) already looks.
- **ÖH (Austrian student union)** — they already run a dorm guide
  (oeh.ac.at/en/dorm-guide) and are a natural content/distribution partner,
  not a competitor (see §6.3).
- **Guest content on existing aggregator sites** (istadi.com, meinplan.at)
  — several of these already publish comparison content; a data-sharing or
  citation relationship ("data via Dormra's live tracker") is more
  realistic than out-competing them purely on content volume this early.

### 3.5 Multilingual/local SEO

- hreflang is already correct — the main remaining work is **making sure
  DE and RU content is actually search-intent-matched, not translated
  English**. German search behavior differs (e.g. "Studentenheim
  bewerben", "Wohnheim Wien Kosten" are real query patterns found in
  research — different phrasing than the literal English translation).
  Audit `messages/de.json` FAQ/metadata copy against real German query
  phrasing before treating it as SEO-complete, not just UI-complete.
- Vienna is the entity to rank for now; don't dilute city-specific pages
  with multi-city keywords until Phase 4 (`STRATEGY.md`) actually ships
  Graz/Salzburg/Innsbruck/Linz.

---

## 4. Content marketing plan

Use the **Hero / Hub / Hygiene** model (current standard for reaching this
audience, see research):

| Tier | % effort | What it means for Dormra | Format |
|---|---|---|---|
| **Hygiene** (10%) | Always-on, low-effort, high-utility | `/how-it-works` FAQ (done), scam-safety content (done), application-strategy content (done) | Static pages, already shipped this session |
| **Hub** (20-30%) | Regular, builds returning-visitor habit | A short recurring "Grapevine digest" — e.g. monthly "what students are saying this month" roundup pulling real (moderated) review excerpts per district/provider; "district guide" content reusing the near-university pSEO pages as source material | Blog/content route (needs building), 1 post per real content cycle, not a content-mill cadence |
| **Hero** (60-70%) | Seasonal campaigns, biggest single-moment payoff | Pre-intake-season push (see §7 calendar): "Vienna Dorm Application Timeline" interactive guide, "Don't get scammed" campaign timed to the ÖH warning season, a shareable "which Vienna dorm is right for you" quiz that ends in an alert signup | Landing pages + social video, timed to the academic calendar |

**Do not build a content-mill blog to "do SEO."** Every piece should either
(a) be genuinely useful hygiene content that also happens to rank, or (b)
exist because it's a hero moment worth the production effort. The
programmatic near-university pages in §3.3 are the actual scale lever —
the blog is for depth and shareability, not volume.

---

## 5. Community, social & promotion channels

Gated behind the Phase 1 sign-off (§0). Ordered by cost/effort, cheapest
and most aligned with existing product first:

### 5.1 Owned channels (build first, cost nothing but time)

- **Email** — already the core mechanic (alerts). Every alert email is a
  touchpoint; make sure the footer/signature reinforces the brand and
  includes a "leave a review on your dorm" nudge once someone's been
  living there a while (a natural, non-spammy way to seed The Grapevine —
  see §5.4).
- **The Grapevine itself is a retention/community feature, not just a
  content feature.** It's already the thing every competitor in §2 lacks.
  Treat review growth as a marketing KPI, not just a product metric (see
  §9).

### 5.2 Where the audience already is (research-confirmed, §2 of
`RESEARCH_STUDENT_VOICE.md`)

- **Facebook "WG Wien"-style groups** — even though Dormra doesn't cover
  WGs yet, these groups are full of exactly the students searching for
  *any* Vienna housing, including dorms. Participate as a helpful member
  (answering real questions, occasionally mentioning Dormra when it's
  genuinely the answer) before ever posting a promotional link — Gen Z
  research is unambiguous that inauthentic posting in community spaces
  backfires hard and can get you banned from the group entirely.
- **University-specific Telegram/WhatsApp groups** — international
  students overwhelmingly organize pre-arrival logistics (including
  housing) in these groups, often set up by the outgoing cohort or the
  international office. This is where persona #1 (incoming international
  student) actually lives digitally before ever touching Google.
- **r/wien, r/Austria, r/tuwien** — thin dorm-specific content today (§2)
  is the opportunity, not a reason to skip Reddit. A genuinely useful post
  ("I built a live availability tracker across every Vienna dorm provider
  because I was sick of checking 8 sites — here it is, free") performs far
  better on Reddit than any promotional framing, and matches this
  audience's stated preference for authenticity over polish.

### 5.3 Paid/rented social (secondary, after organic proves the loop)

Per current DACH Gen Z data: **Instagram is the hero platform (4.2M AT
users), TikTok is the fastest-growing and is explicitly used as a search
engine by this demographic (74% for product discovery)**. For Dormra
specifically:

- **TikTok/Reels**: short (<30s), practical, non-salesy content —
  "POV: you're trying to find a Vienna dorm before 8 different providers
  all say 'fully booked'" style content demoing the actual product, not a
  brand ad. Optimize on-screen text/captions for the long-tail phrases
  this audience actually searches within TikTok itself.
- **Instagram**: slightly more polished versions of the same content, plus
  static "did you know" posts using real (anonymized) Grapevine review
  excerpts once volume exists — genuine student voice performs better here
  than brand copy.
- **Facebook**: lower priority for content, but useful for the groups
  angle in §5.2 and for reaching persona #4 (parents), who over-index on
  Facebook relative to students themselves.
- Budget note: given Dormra is bootstrapped/solo per `STRATEGY.md`, treat
  all of the above as **organic-first**. Don't allocate paid spend until
  Phase 1 is proven and there's at least anecdotal evidence organic content
  converts (an alert signup or a Grapevine review is easy to attribute to
  a specific post if UTM-tagged — see §9).

### 5.4 Partnerships

- **ÖH (Austrian student union)** — natural fit, not competitive (they run
  informational content, not live availability tracking). A realistic ask:
  co-branded content or a link exchange with their existing dorm guide.
- **University international offices** — see §3.4; this is simultaneously
  a backlink target and a direct-to-persona-#1 distribution channel (many
  send a pre-arrival housing email/PDF to admitted students — getting
  mentioned there reaches exactly the highest-intent, most scam-anxious
  audience at exactly the right moment).
- **Dorm-provider goodwill, not adversarial framing.** Dormra aggregates
  provider data and now hosts reviews *about* providers — position this as
  "we send you qualified, ready-to-apply students," not as a competitive
  threat. A provider that feels attacked by negative reviews could try to
  block scraping; a provider that sees Dormra as a funnel has no reason to.
- **Campus/move-in-week presence** (once Phase 1 is proven and there's
  founder/ambassador bandwidth): flyers or a QR code at OeAD/STUWO/ÖJAB
  building entrances during the September move-in rush, when there's a
  captive, relevant audience physically walking past. Cheap, geographically
  perfect targeting, but needs a person on the ground.

---

## 6. Product-led growth loops (already have the primitives, use them)

- **The Grapevine as a UGC/SEO flywheel**: every genuine review is (a) new
  unique content that helps §3.1's `aggregateRating` schema and §3.3's
  BOFU pages, (b) the exact differentiator §2 says nothing else in the
  market has, and (c) free social proof to screenshot for §5.3 content.
  The single highest-leverage marketing action available right now that
  isn't gated by §0 is **getting the first real reviews onto real dorms**
  — consider a lightweight "founding reviewer" recognition (a cosmetic
  badge is enough, see the deferred idea in `RESEARCH_STUDENT_VOICE.md`
  §8) once there are enough real users to make that meaningful.
- **Saved dorms + alerts as a natural share moment**: "I found my dorm on
  Dormra" is a shareable, non-cringe thing to tell a friend who's also
  house-hunting — make sure the saved-dorms/alert-confirmed flow has an
  easy, low-friction way to share (a proper "share this search" button
  using the Web Share API on mobile, not just descriptive copy — the
  `/dorms` page currently *describes* filters as shareable via URL but has
  no explicit share affordance; adding one is a cheap, high-leverage
  follow-up to this plan).
- **Referral-by-utility, not referral-by-incentive**: given the audience's
  stated skepticism of inauthentic marketing (§5.2/5.3), a genuinely useful
  free tool that solves a real, currently-painful problem (checking 8
  sites manually) generates word of mouth on its own merit. Resist the
  urge to bolt on a referral-discount mechanic before the core loop is
  proven — it adds complexity Dormra doesn't need yet and doesn't fit a
  free product with no obvious "credit" to give.

---

## 7. Seasonal calendar

Vienna dorm demand is sharply seasonal (confirmed repeatedly in
`RESEARCH_STUDENT_VOICE.md`) — the marketing calendar should follow the
academic year, not a generic monthly cadence:

| Window | What's happening for students | What Dormra should be doing |
|---|---|---|
| **Now → intake season** | Content/SEO has lead time to index before the real search spike | Ship the technical SEO items in this PR, build the near-university pSEO pages (§3.3), start a light Reddit/Facebook-group presence establishing genuine helpfulness (no hard promotion yet) |
| **Admissions results → application window** (this is when acceptance letters go out and the "apply to 2-3 providers immediately" behavior from research kicks in) | Highest-intent search volume of the year — students actively comparing providers and reading reviews | Hero content push (§4): application-timeline guide, scam-safety campaign, comparison content; this is also when getting mentioned in a university's pre-arrival email has the most value |
| **Move-in month** | Students physically arriving, dorm-switching regret starts, Meldezettel/registration stress | Campus/QR presence if feasible (§5.4); this is also the best moment to prompt "how's it going so far?" review nudges — Grapevine content freshness matters more than volume here |
| **Mid-semester lull** | Lower housing search volume, but dorm-switching (moving to a WG) starts (research §7) | Hub content (§4) — digest posts, community engagement, technical/content debt paydown, prep next cycle's hero content |
| **Summer-semester intake (smaller, February)** | A second, smaller version of the whole cycle | Reuse the same playbook at smaller scale; good testbed for new content/channels before the big autumn cycle |

---

## 8. Metrics & tracking

Dormra already has `@vercel/analytics` installed. Minimum instrumentation
to actually measure this plan (not built yet — flagged for a follow-up PR,
since analytics event wiring is a real code change, not config):

| Metric | Why it matters | How to get it |
|---|---|---|
| Alert created (count, by source page) | The core conversion event | Custom Vercel Analytics event on `createAlert`/`updateAlert` success |
| Grapevine review posted (count) | Leading indicator for §6's flywheel | Custom event on `createReview` success |
| Organic search sessions to `/dorms/[slug]` vs `/dorms` | Whether BOFU pages (specific dorms) or MOFU/directory pages are doing the work | Vercel Analytics + Search Console query data, cross-referenced |
| Referral traffic by UTM source (Reddit, Facebook groups, Instagram, TikTok) | Which §5 channel is actually working, before spending more effort there | UTM-tag every outbound link used in community posts; Vercel Analytics campaign/referrer view |
| Backlinks from `.ac.at` / university domains | Direct proxy for §3.4 outreach success and for domain authority | Search Console + periodic manual check |
| Reported-review rate (from `/admin/reviews`) | Community health, not growth, but a leading indicator of reputational risk if promotion outpaces moderation capacity | Already visible in the admin dashboard shipped this session |

**Do not chase vanity metrics** (follower counts, impressions) over the
above — for a product this niche and trust-dependent, alert creation and
review posting are the only two numbers that actually indicate the
marketing is working, not just making noise.

---

## 9. Risks & guardrails

- **Marketing before Phase 1 is proven** is the single biggest risk (§0) —
  a scam-anxious, word-of-mouth-driven audience does not give second
  chances after a broken alert.
- **Programmatic SEO overreach** (§3.3) risks a site-wide Google penalty
  under 2026 scaled-content-abuse enforcement if the "one page per
  keyword-swap" pattern is used instead of genuine per-page data synthesis.
  Gate every new page template on the uniqueness checklist in §3.3 before
  shipping it.
- **Review-bombing / moderation load outpacing growth**: any promotion
  push that drives visibility to The Grapevine also increases exposure to
  bad-faith reviews (competitor sabotage, disgruntled-tenant pile-ons).
  The `/admin/reviews` moderation queue exists for exactly this — make
  sure moderation capacity (i.e., someone actually checking it) scales
  with any promotion push, not just afterward.
- **Provider relationships**: aggregating a provider's availability *and*
  hosting public reviews about them is more sensitive than availability
  alone. Keep the "we're a funnel, not a threat" framing from §5.4 explicit
  in any provider-facing communication, and be prepared to explain the
  Grapevine moderation policy (already documented in `/terms` and
  `COMMUNITY_REVIEWS.md`) if a provider objects to a specific review.
- **Inauthentic-feeling community posts** actively backfire with this
  audience per the Gen Z research cited throughout — every §5.2 channel
  entry should be read, in draft, by someone who can honestly say "would
  I trust this if a stranger posted it in my group chat?"

---

## 10. Immediate action list (respecting §0's gate)

**Can start now (code/content, no outreach):**
1. ✅ Technical SEO items in §3.1 — shipped alongside this document.
2. Build the near-university programmatic pages (§3.3) — the single
   highest-leverage SEO investment available, and it reuses data/logic
   (`lib/universities.ts`, rating summaries, availability) that already
   exists.
3. Audit DE/RU copy against real search-intent phrasing (§3.5).
4. Add a real "share this search/dorm" affordance (§6) — cheap, and ready
   the moment promotion starts.
5. Draft (don't post) the Reddit/Facebook-group "helpful, not
   promotional" content described in §5.2, so it's ready the moment §0's
   gate clears.

**Wait for Phase 1 sign-off, then:**
6. Start the owned-channel + community presence in §5.1/5.2.
7. Time the first hero content push (§4/§7) to the next application
   window, not to whenever engineering happens to finish — the calendar in
   §7 matters more than shipping speed here.
8. Begin the university/ÖH outreach in §3.4/§5.4 — these take lead time to
   land (someone has to review and add a link), so start the emails as
   soon as Phase 1 is solid even if the outreach itself isn't "marketing"
   in the promotional sense.
