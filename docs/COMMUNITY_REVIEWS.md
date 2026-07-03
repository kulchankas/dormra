# The Grapevine — anonymous dorm reviews & community feature

Last updated: 2026-07-03
Status: Phase 1 (MVP) implemented in `cursor/dorm-community-reviews-fc38`

## 1. Goal

Dormra today is a pure listings/availability tool. The user wants it to also
*feel like a community* — a place where students share the unfiltered truth
about a specific dorm ("the elevator's been broken for months", "management
is actually great about repairs", "walls are thin, bring earplugs") alongside
a star rating. The working name was "gossiping section"; the spirit is right
(informal, peer-to-peer, a little cheeky) but it needs real anonymity and
moderation guardrails since it's user-generated content about real
businesses.

## 2. Research: how similar products handle anonymity & moderation

| Product | Anonymity model | Accountability | Moderation | Takeaway |
|---|---|---|---|---|
| **Reddit** | Persistent pseudonym per account, reused across every post/comment | Full — same handle everywhere, karma history | Subreddit mods + sitewide admins + report queue | Persistent pseudonyms let *content* build trust ("this user has 500 helpful reviews") but also let posts be correlated across time/topics — a privacy leak risk for something as small and identifiable as "one specific dorm building." |
| **Yik Yak / Fizz** (anonymous campus apps) | Fully anonymous *per post* — no username shown at all by default | Backend requires phone or verified `.edu` email; one real account per person | AI filters + student moderator teams + downvote auto-removal (e.g. "-5 votes = removed") | Closest match to what Dormra needs: verified-but-invisible identity. Confirms that "anonymous to other users, accountable to the platform" is a proven, workable model for a youth/campus audience. |
| **Glassdoor** | Marketed as anonymous, but backend increasingly links reviews to a real-name profile (2024 controversy — users discovered real names attached without consent after a Fishbowl merger) | High — arguably too high | Legal team fights identification subpoenas; large moderation org | Cautionary tale: **never let "backend account for abuse-handling" quietly become "linked identity that leaks."** Whatever we store, document it plainly in the ToS and never surface it, even to admins, beyond what moderation strictly requires. |
| **RateMyProfessor** | No persistent identity at all — a rating+comment tied only to the entity being reviewed | Low (this is also its biggest spam/troll weakness) | Keyword filters, report links | Confirms ratings work fine with zero cross-post identity. Also: small sample sizes need honest framing (show the count, don't hide it) rather than a fake-precise average. |

**Conclusion for Dormra:** use the Yik Yak/Fizz model — **require a real
account to post (prevents bot spam, enables one-review-per-dorm, enables
banning abusers), but never show any persistent identity publicly.** Go a
step further than Reddit and even further than Fizz: generate a **brand-new
random pseudonym for every single review**, not one reused across a user's
reviews. Because Dormra only has ~50 dorms and a small user base, a
persistent per-account pseudonym would be far more identifiable than
Reddit's use case (millions of subreddits) — two or three reviews under the
same handle about dorms in the same district could plausibly be
de-anonymized by someone who knows the poster. A fresh pseudonym per review
avoids that correlation entirely while still meeting the "safe like Reddit"
brief (a fun, human-sounding name instead of "User" or a number).

## 3. Legal / trust context (EU Digital Services Act)

Dormra is a small platform (well under the 50-employee / €10M threshold), so
it is exempt from the DSA's heavier "online platform" obligations (Art.
20–28: internal complaint systems, trusted flaggers, transparency reports).
It is **not** exempt from the baseline hosting-service duties that apply to
everyone (Art. 11–18):

- A **notice-and-action mechanism** so users can flag illegal/abusive
  content → the report button on every review.
- A **statement of reasons** when content is removed → the admin
  hide-review flow records a reason, and the ToS explains the categories.
- **Clear terms & conditions** describing what's allowed and how moderation
  works → new "Community content" section in `/terms`.
- A way to **report suspected criminal content** to authorities — out of
  scope for an MVP with near-zero traffic, but documented as a follow-up in
  §8 below.

This isn't legal advice, but building the report → review → hide pipeline
now (rather than retrofitting it after a defamation complaint) is cheap
insurance for a listings site.

## 4. Data model

Two new tables, additive only — no changes to existing schema.

```
dorm_reviews
  id            uuid pk
  dorm_id       uuid fk -> dorms.id (cascade delete)
  user_id       uuid fk -> auth.users.id   -- NEVER exposed to the client; only used to
                                            -- enforce one-review-per-dorm and for moderation
  pseudonym     text     -- generated once at creation, frozen forever after (edits keep it)
  rating        smallint -- 1..5
  body          text     -- 10..2000 chars, enforced in the server action + a DB check
  hidden        boolean default false
  hidden_reason text null
  created_at    timestamptz
  updated_at    timestamptz
  unique (dorm_id, user_id)   -- one review per person per dorm; edit instead of re-posting

dorm_review_reports
  id                uuid pk
  review_id         uuid fk -> dorm_reviews.id (cascade delete)
  reporter_user_id  uuid fk -> auth.users.id
  reason            text  -- 'spam' | 'harassment' | 'false_info' | 'off_topic' | 'other'
  details           text null
  created_at        timestamptz
  unique (review_id, reporter_user_id)  -- one report per person per review
```

RLS:

- `dorm_reviews`: anyone can `select` where `hidden = false`. Authenticated
  users can `insert`/`update`/`delete` only their own row
  (`auth.uid() = user_id`) — including their own hidden row, so users can
  always see/edit/delete something they posted even if it's currently hidden
  pending review. Hiding a review for *other* users is an admin-only action
  done via the service-role client (bypasses RLS), same pattern as the rest
  of the admin dashboard (`lib/supabase/admin.ts`).
- `dorm_review_reports`: authenticated users can `insert` their own report;
  no public `select` (reports are only readable via the service-role admin
  client, so reporters' identities never leak to other users, and review
  authors never see who reported them).

## 5. Anti-abuse for the MVP

- Must be signed in to post or report (no anonymous-anonymous spam).
- One review per user per dorm (DB unique constraint + friendly "edit your
  review instead" UI when a user who already reviewed opens the form).
- Minimum body length (10 chars) blocks empty/placeholder spam; max length
  (2000 chars) keeps reviews skimmable.
- One report per user per review (stops report-bombing a review to hide it).
- All moderation actions (hide/restore) go through the existing `admin`
  gate (`lib/admin-auth.ts`, `ADMIN_EMAILS`), reusing infrastructure already
  in production.

**Explicitly deferred to a later phase** (documented here so it's not
forgotten, not because it doesn't matter):

- Upvote/downvote + auto-hide at a vote threshold (Yik Yak's "-5 = removed").
  Skipped for v1 because with a handful of reviews per dorm, votes would be
  noise; revisit once review volume justifies it.
- Automated content filtering (profanity/keyword flags surfaced to admins
  before a human report comes in).
- Rate limiting beyond the one-review-per-dorm constraint (e.g. N reviews
  per day across all dorms) — worth adding if the feature gets popular.
- Bayesian/weighted rating average to dampen small-sample volatility (a
  dorm with one 1-star review looks the same as a dorm with fifty 1-star
  reviews right now). For ~50 dorms with likely low review counts at launch,
  showing the plain average **and** the review count is honest enough —
  readers can judge confidence themselves. Revisit if/when volume grows.
- Email notification to the review author when their content is moderated
  (DSA "statement of reasons" — currently satisfied by an in-app message
  and the ToS explanation, not a personalized notice).

## 6. UX

- **Dorm detail page**: new "The Grapevine" section below the existing
  content, above "You might also like". Shows the aggregate rating (stars +
  count) near the top of the page (next to the price card), then:
  - If signed in and hasn't reviewed yet: a compact form (star picker +
    textarea) to leave a review.
  - If signed in and already reviewed: their own review shown first,
    editable/deletable inline.
  - If signed out: a "Sign in to share your experience" prompt (matches the
    existing pattern used for the save button).
  - Below: every visible review, newest first, each showing pseudonym, star
    rating, relative timestamp, body, and a report flag icon.
- **Dorm directory (`/dorms`) & cards**: small star + count badge on
  `DormCard`, bulk-fetched in one query (same pattern as
  `getAvailabilityStatusBulk`) so the grid doesn't do 50 round trips.
- **Naming across locales** (keeps the fun "gossip" framing while staying
  legible):
  - EN: **The Grapevine**
  - DE: **Der Buschfunk** (a genuine, widely-understood German idiom for
    "the grapevine"/rumor mill — a natural rather than literal translation)
  - RU: **Слухи и отзывы** ("rumors & reviews" — keeps the playful "rumor"
    connotation while making clear it's reviews, since a literal "grapevine"
    idiom doesn't exist in Russian)

## 7. Phased rollout

- **Phase 1 (this PR)**: schema, pseudonym generation, post/edit/delete a
  review, report a review, admin moderation queue, rating badges on
  card/detail, ToS update.
- **Phase 2 (future)**: voting + auto-hide threshold, reply threads (if
  demand shows up), lightweight automated content flags, per-review "was
  this helpful" signal feeding a smarter (Bayesian) sort/rank.
- **Phase 3 (future)**: tie into alerts ("notify me when a new review lands
  for a saved dorm"), review-based dorm comparison, admin analytics on
  sentiment trends per provider.

## 8. Follow-up manual/ops tasks

Tracked in `docs/MANUAL_TASKS.md`:
- Apply `20260703000000_dorm_reviews.sql` to the production database.
- No seed data needed — this table starts empty and fills from real users.
- Read `/terms`' new "Community content" section once and confirm the
  reporting email/contact point is accurate for your legal setup.
