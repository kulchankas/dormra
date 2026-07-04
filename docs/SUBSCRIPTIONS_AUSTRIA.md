# Subscriptions in Austria — do you need to register a company?

**Disclaimer:** This is operator research, not legal advice. Consult a Steuerberater (tax advisor) or lawyer before charging users.

## Context

Dormra plans optional paid tiers (advanced alerts, priority notifications). Browsing stays free. Question: must the operator register a formal company (e.g. GmbH) to sell subscriptions in Austria?

## Key points (as of 2026)

### Sole proprietorship (Einzelunternehmen) may suffice early on

- You can invoice as a **Einzelunternehmer** under the EPU (Einzelunternehmen) rules if revenue stays within limits.
- Registration via **GISA** (Gewerbeinformationssystem Austria) for the relevant trade (likely *Dienstleistungen in der automatischen Datenverarbeitung und Informationstechnik* or similar — confirm with advisor).
- Simpler accounting, lower setup cost than GmbH.
- Personal liability — your assets are on the line.

### When a GmbH (or UG) makes sense

- Revenue grows beyond comfortable sole-prop limits.
- You want limited liability (Haftungsbeschränkung).
- Investors or co-founders join.
- B2B contracts require a company entity.

### VAT (Umsatzsteuer)

- **Kleinunternehmerregelung** — if annual turnover ≤ €55,000 (2024 threshold, verify current), you may be exempt from charging VAT. Simplifies invoices.
- Above threshold → UID number (ATU…) required, charge 20% VAT on Austrian B2C subscriptions.

### Payment processing

- **Stripe** (available in Austria) requires business details — sole prop or company both work.
- Keep invoices compliant (UID, address, Leistungsbeschreibung).

### GDPR

- Already relevant as you process emails and accounts. Company form does not replace GDPR obligations.

## Practical recommendation for Dormra beta

| Phase | Suggestion |
|-------|------------|
| **Now (free beta)** | No company needed for $0 product. Keep costs as personal/project expenses. |
| **First paid tier (< ~€10k/yr)** | Register **Einzelunternehmen** + GISA; open business bank account; use Stripe sole-prop. |
| **Scale / liability concerns** | Form **GmbH** (~€35k Stammkapital or flexible variants — ask Steuerberater). |

## Operator checklist before enabling payments

- [ ] Consult Steuerberater on Gewerbe category and Kleinunternehmer eligibility
- [ ] Register GISA Gewerbe (if charging)
- [ ] Business bank account
- [ ] Stripe account (AT)
- [ ] Impressum + Terms updated with company name, UID, contact
- [ ] Privacy policy covers payment data (Stripe processor)

## Sources to verify

- [WKO — Gründung](https://www.wko.at/)
- [BMF — Kleinunternehmer](https://www.bmf.gv.at/)
- Stripe Austria documentation
