# Housing hunting strategy — Dormra vs. Roomspot / alert services

Research note for the operator (2026-07-04 queue item). Compares the **unified portal** model (Roomspot.nl) with Dormra’s **monitoring + alerts** model for Vienna/Austria.

---

## What “housing hunting” means here

Two distinct patterns show up in European student housing:

| Model | Example | What the user does | What the platform does |
|-------|---------|-------------------|------------------------|
| **Unified portal** | [Roomspot.nl](https://www.roomspot.nl/en/) (Enschede/Twente) | Register once, browse all listings, respond to ads, sometimes “hospiteren” (group interviews) | Aggregates inventory from housing corps (SJHT, De Veste); runs allocation (random draw or co-optation) |
| **Monitoring + alerts** | DormBuzz, RentAhead, **Dormra** | Set criteria; get notified when something opens; apply on the provider’s own site | Scrapes/monitors many sites; does not own inventory or contracts |

The queue asked whether Dormra should pivot toward a **Roomspot-style “housing hunting” portal**. Short answer: **not as a full pivot** — Austria’s market structure makes the alert-first model a better fit for an indie product. A **light hybrid** (directory + smart tracker + alerts) is the right path.

---

## Roomspot.nl — why it works in the Netherlands

Roomspot is a **city-scale joint venture**: municipality, universities (Twente, Saxion), and two housing corporations publish inventory into **one** system.

Students:

1. Register free (valid ~1 year)
2. Create a search profile → email when matches appear
3. Respond to listings; for shared flats, email motivation to current residents (“co-optation”)
4. Sign lease through the corporation

Key enablers:

- **Few landlords, formal allocation** — SJHT and De Veste dominate student stock in that region
- **Institutional buy-in** — providers post directly to Roomspot; no scraping arms race
- **Single language/market** — Dutch + English for one intake geography

This is closer to a **marketplace with official supply** than to a meta-search engine.

---

## Austria / Vienna — different constraints

Vienna student housing is **more fragmented**:

- **11+ providers** (OeAD, STUWO, home4students, ÖJAB, …) on **8+ separate booking websites**
- **No central allocator** — each org runs its own portal, waitlists, and application windows
- **High international demand** — many applicants refresh sites manually during July–September
- **Legal/commercial barrier** — providers have no incentive to join a third-party portal unless Dormra brings measurable applicants (Phase 3+ partnerships in `docs/STRATEGY.md`)

A Roomspot clone would require:

- Provider agreements to syndicate listings (months of BD, not a nightly agent task)
- Handling deposits, contracts, and GDPR as a intermediary (heavy regulatory surface)
- Competing with well-funded incumbents once you look beyond dorms (Willhaben, Der Standard Immo, etc.)

**Conclusion:** A full housing-hunting portal is a **multi-year, partnership-led** bet — not a pivot from tonight’s codebase.

---

## What Dormra should borrow (without becoming Roomspot)

| Roomspot feature | Dormra equivalent | Status |
|------------------|-------------------|--------|
| One place to search all providers | `/dorms` directory + filters | Shipped |
| Search profile + email alerts | `/dashboard/alerts` | Shipped |
| “Respond” / track interest | Application tracker (auto-mark on Apply click) | Shipped 2026-07-04 |
| Registration validity / identity | Google + email auth | Shipped |
| Official inventory feed | Scrapers + seeds | 3 live, ÖJAB seeded |
| Allocation / lease signing | **Out of scope** — link to provider | By design (`docs/APPLY_FLOW.md`) |

**Positioning for Austria:**

> “We don’t replace STUWO or OeAD — we watch them for you and tell you the second a room opens, then track your application in one dashboard.”

That is honest, matches the UI/UX skill, and avoids over-promising.

---

## “Dormspot.nl” alert competitors

Web search often conflates **Roomspot** (portal) with **alert/monitoring services** (sometimes branded similarly). The relevant comp for Dormra is the **alert tier**:

- **DormBuzz** — monitors Dutch platforms, WhatsApp/email, freemium
- **RentAhead** — city-based rental alerts, subscription
- **NewDomo** — similar pattern

These validate Dormra’s **core thesis**: students pay (or tolerate ads) to **save refresh time**, not to get a new lease counterparty.

For Vienna specifically:

- **Pros:** Less mature dedicated “dorm alert” brand than NL; international students are used to paying for housing tools
- **Cons:** Smaller TAM than Amsterdam; must stay scrappy on scraper maintenance

---

## Recommendation

1. **Stay alert-first + directory** — do not rebrand as “housing hunting portal” unless a provider signs a data feed.
2. **Marketing copy:** “8 websites, 11 providers, one dashboard” (now consistent in app copy).
3. **Product next steps** (aligned with strategy doc):
   - Saved-dorm availability emails (reuse cron + Resend)
   - More live scrapers (ÖJAB, Akademikerhilfe)
   - Optional paid tier for faster checks / SMS — after legal review (`docs/SUBSCRIPTIONS_AUSTRIA.md`)
4. **Partnership path (manual):** pitch OeAD/STUWO marketing teams on “we send qualified clicks” with UTM tracking (`utm_source=dormra` on Apply links) — use data to negotiate listing feeds later.

---

## When a Roomspot model *would* make sense

Revisit unified portal if **any** of these become true:

- A Vienna-wide student housing association agrees to syndicate API/XML feeds
- Dormra reaches sustained traffic (e.g. 5k+ MAU) where providers proactively ask to be listed
- You expand to a city with 1–2 dominant corps (e.g. Graz with clearer duopoly)

Until then, **housing hunting** is a messaging angle (“hunt smarter”) not a product architecture change.
