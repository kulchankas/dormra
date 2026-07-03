# Student voice research — what Vienna dorm-hunters actually say

Last updated: 2026-07-03

## Method & a caveat about Reddit

Direct access to reddit.com (both fetching pages and the search API) is
blocked from this environment ("blocked by network security" / bot-policy
wall), and there's no single dedicated Vienna-dorms subreddit — discussions
about Vienna student housing are scattered thinly across `r/wien`,
`r/tuwien`, and `r/Austria` rather than concentrated anywhere. Search results
for those subreddits didn't surface enough indexed threads to quote directly.

Instead I pulled from platforms that carry the same thing Reddit would —
unfiltered, first-person student experiences, not marketing copy:

- **mappaustria.com** — Google-Maps-style star reviews for individual Vienna
  dorm buildings (ÖJAB-Haus Meidling, STUWO Spengergasse, OeAD locations, etc.)
- **gutefrage.net** — Germany/Austria's Quora-equivalent Q&A ("Home4students,
  Wien, gut?" thread with real replies)
- **iAgora.com** — university housing reviews from exchange students
- **wiwi-treff.de** — a long-running German student forum thread on Vienna
  dorms
- Official/semi-official guidance (ÖH dorm guide, university international
  offices, scam-warning posts from ÖH Innsbruck, immigration consultancies)
  for the practical/process side (fees, deadlines, documents)

This is a reasonable proxy for "what would be on Reddit if Vienna had a
bigger presence there" — same voice, same level of unfiltered complaint and
praise, just hosted elsewhere. Worth re-running this research periodically
in case Reddit's indexing/crawl policy changes or a dedicated community
subreddit forms.

## What students actually say

### 1. "Apply to 2-3 providers at once, immediately" is the #1 repeated tip

Every source — official and informal — converges on the same advice:
providers allocate first-come-first-served with no fixed deadlines, popular
Vienna dorms are full months ahead, and *application date* directly
determines queue position. Multiple sources explicitly warn **not** to
apply twice to the *same* provider (resets your queue position) but *do*
apply to several *different* providers in parallel, then drop the ones you
don't take.

> "The most important practical tip: apply to two or three providers at the
> same time... you take the first suitable offer and drop the rest."

### 2. Scams are a huge, recurring fear — and getting more sophisticated

ÖH Innsbruck put out an urgent warning in 2025 about professionally
organized rental scams: fake companies, real Austrian IBANs, and even
staged in-person viewings in rented Airbnbs with someone posing as the
landlord. The advice everywhere is identical: never pay before a signed
contract and a viewing (in person or live video call), and established dorm
providers are explicitly recommended as the *lowest-risk* option compared
to the private/WG market for exactly this reason.

### 3. Fees stack up in ways people don't expect going in

OeAD: €35 (now reportedly up to €70 in some sources) non-refundable
application fee, refunded only if literally no offer can be made — not if
you decline an offer you don't like. Deposits (€950+ typical) plus a
mandatory final-cleaning fee (€55-79) deducted at move-out, refund taking
up to 6 weeks and gated on proof of city de-registration (Abmeldung). One
mappaustria reviewer described an ÖJAB house that tried to collect rent
*twice* through a debt-collection agency and called the contract "designed
to circumvent tenants' cancellation rights." The consistent complaint isn't
that dorms are expensive — it's that **the true all-in cost (application
fee + deposit + cleaning fee + notice period) is opaque until you're already
committed.**

### 4. The building matters far more than the provider brand

The same provider varies wildly by address. mappaustria reviews for
individual ÖJAB and STUWO buildings range from "wouldn't recommend to
anyone" to "most rewarding part of my student life" *within the same
provider*. Recurring specific complaints, almost verbatim across every
source: **small rooms (12-15m²), thin walls/noise, shared-kitchen mess,
slow repairs ("brauchen monate" — take months), unreliable WiFi**. Recurring
specific praise: **staff responsiveness, cleanliness, community/welcome
events, all-inclusive billing (no separate utility bills to manage)**.

### 5. Students explicitly search for building-specific, not provider-level, information

This is the clearest signal in the research: "experiences vary significantly
by building... recommended to search specifically for the address of the
individual dormitory on review platforms or forums like Reddit to get the
most accurate information." That's precisely the gap Dormra's per-dorm
Grapevine reviews (shipped in this session) are built to fill — it's a real,
named gap in the market, not a nice-to-have.

### 6. International/exchange students have extra, time-critical steps

Passport + admission letter to apply; Meldezettel (city registration) is
mandatory and requires a confirmed address, and must happen within days of
arrival — students are told to plan housing so this isn't blocked. OeAD
gives international students priority.

### 7. WG (shared flat) is the unofficial "phase 2" for many students

Multiple sources note the common pattern: start in a dorm for the easy,
low-commitment first year, then move to a private WG once you know the city
and have friends to share with. Facebook groups ("WG Wien") and WG-Gesucht
are the dominant discovery channel — completely outside anything Dormra
tracks today.

## What we can use for Dormra

Prioritized by (impact on the exact pain points above) ÷ (effort given
what's already built).

### Ship now (small, high-confidence)

1. **Review tags on the Grapevine.** The complaint/praise vocabulary above
   is remarkably consistent and specific ("thin walls", "slow repairs",
   "shared kitchen mess", "reliable WiFi", "responsive staff", "party
   dorm"/"quiet dorm"). Adding quick-select tags to the review form (in
   addition to the free-text body already shipped) makes reviews faster to
   write (lower friction → more reviews) and lets a dorm's page show
   "Frequently mentioned: 🔇 Thin walls (4), 🛠️ Slow repairs (3)" — exactly
   the scannable, building-specific signal students say they're hunting
   for. **Implemented in this session** — see `lib/review-tags.ts`.
2. **"Apply to more than one provider" nudge on the saved-dorms dashboard.**
   The #1 repeated tip is something Dormra is uniquely positioned to
   surface: we already know which dorms a user has saved/applied to. If
   they've only got one "Applied" entry, a small nudge to add a backup
   matches exactly what every source recommends, and it's a two-line
   addition to a page that already exists. **Implemented in this session.**
3. **Scam-safety + application-strategy FAQ entries** on `/how-it-works`.
   Cheap, reinforces the "community/trust" goal, and addresses the single
   most emotionally loaded fear in the research (getting scammed while
   house-hunting from abroad). **Implemented in this session.**

### Reasonable next steps (not built yet — flagged for a future PR)

4. **Transparent total-cost-to-move-in messaging.** Not a per-dorm scraped
   field (we don't have verified application-fee/cleaning-fee data for all
   ~50 dorms, and shipping wrong numbers would be worse than shipping
   nothing) but a general "what to budget for beyond monthly rent"
   explainer, generalized across providers, would directly address pain
   point #3. Do this once we have a reliable way to verify provider-level
   fee data (contact providers directly, or crowd-source via the Grapevine
   and only show a fee once corroborated by multiple reviewers).
5. **"Vibe" filter (social/party vs. quiet/studious).** Once the Grapevine
   has enough tagged reviews per dorm, derive a dorm-level "mostly reviewers
   say: quiet" signal and expose it as a filter alongside pets/couples/
   furnished. Premature today — needs review volume first.
6. **Documents checklist / arrival timeline** ("Meldezettel must happen
   within N days, here's what to bring") as structured content on the dorm
   detail page or a dedicated "moving to Vienna" guide. Content-only, no
   schema changes, but a bigger writing effort than the FAQ additions above
   — worth a dedicated pass.

### Bigger scope, not now

7. **WG (shared flat) aggregation.** A real, named gap (students explicitly
   route around Dormra entirely to Facebook/WG-Gesucht once they outgrow
   dorms) but a different data source, different scraping targets, and a
   different trust model (private individuals, not institutions) —
   effectively a second product. Worth revisiting once the dorm-focused
   product has traction, not before.
8. **Seeding initial Grapevine content from other review platforms.**
   Tempting for the cold-start problem (a dorm with zero reviews is less
   useful than one with five), but copying other platforms' user-submitted
   content without permission is an attribution/ToS risk, not just a
   technical one. Better cold-start options: reach out to ÖH (the Austrian
   student union, who already runs a dorm guide) for a possible content
   partnership, or accept slow organic growth and consider a light
   incentive (e.g., a "founding reviewer" badge) once accounts have
   identities worth badging.
