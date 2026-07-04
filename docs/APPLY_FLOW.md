# Apply flow — can Dormra accept applications in-app?

**Short answer:** Not today. Every Vienna student dorm provider runs its own application portal, contract, and room assignment. Dormra is an aggregator and alert service, not a housing operator.

## How it works now

1. Student finds a dorm on Dormra (`/dorms/[slug]`).
2. **Apply** opens the provider's website in a new tab (`apply_url` or `website_url`).
3. Student completes the provider's own registration (OeAD portal, STUWO reservation system, ÖJAB online application, etc.).
4. Optionally, the student **saves** the dorm in Dormra and marks status: Interested → Applied → Accepted / Rejected.

## Why in-app apply is hard

| Blocker | Detail |
|---------|--------|
| No provider APIs | OeAD, STUWO, ÖJAB, home4students do not expose public APIs for third-party applications. |
| Legal / KYC | Providers verify student status, IDs, and contracts directly. |
| Payment | Deposits and first-month rent are collected by the provider, not a middleman. |
| Liability | Dormra would become a data processor for sensitive application documents. |

## What we shipped instead (2026-07-03)

- **Application tracker** on the dorm detail page (save + status dropdown when logged in).
- Clear copy: applications happen on the provider site; Dormra tracks your progress.
- Saved dorms kanban at `/dashboard/saved`.

## Future options (if partnerships exist)

1. **Deep-link prefill** — if a provider adds URL params for name/email (none do today).
2. **Embedded iframe** — blocked by provider CSP and poor UX on mobile.
3. **Official partnership** — provider grants API or white-label apply; requires business agreement.
4. **Application checklist** — in-app wizard that opens provider tabs step-by-step (no data submission).

## Operator action

- [ ] If you negotiate a provider partnership, add their API details here and open a draft queue item for integration.
