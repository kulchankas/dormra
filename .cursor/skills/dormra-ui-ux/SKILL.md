# Dormra UI/UX Skill

Apply when editing pages, components, copy, or styling in the Dormra codebase.

## Design system

- **Palette**: warm sand background `#FFF8F4`, brand `#C2401E`, accent `#FF6B47`, muted text `#6B5C53`
- **Font**: Poppins (400/500/600) — do not introduce new font families
- **Radius**: cards `rounded-2xl`, buttons often `rounded-full` or `rounded-xl`, pills `rounded-pill`
- **Surfaces**: `bg-surface` (white cards), `bg-background` (page), `border-border`
- **Components**: shadcn/ui (Base UI) in `components/ui/` — reuse before creating new primitives

## UX principles

1. **Honest copy** — only advertise features that work (email alerts yes; Telegram/kanban no until shipped)
2. **Every control must do something** — no decorative inputs; wire search/filters to real navigation or state
3. **Mobile first** — touch targets ≥44px, bottom sheets for filters/search, sticky CTAs where needed
4. **Progressive disclosure** — hide advanced filters; show chips for active filters
5. **Empty states** — icon + headline + one-line explanation + primary action
6. **Student context** — clear €/month pricing, Vienna districts, intake season language

## Patterns to follow

- Hero/search → navigate with query params (`/dorms?maxPrice=600`) so results are shareable
- Availability badges: green accent = available, muted = unknown, neutral dark = fully booked
- Dashboard cards: link active features; dim + "Coming soon" for unreleased features
- Forms: label units explicitly (deposit in **months**, rent in **€/month**)
- Auth: preserve `?redirect=` through login/signup links

## Accessibility

- All icon-only buttons need `aria-label`
- Form fields: `<Label htmlFor>` + `aria-invalid` on errors
- Use semantic landmarks (`main`, `nav`, `section` + `aria-label`)
- Focus rings: `focus-visible:ring-2 focus-visible:ring-ring`
- Escape apostrophes in JSX text with `&apos;` (eslint rule)

## Do not

- Add new dependencies for UI unless necessary
- Over-promise in marketing copy
- Use client-side fetch for listing pages when SSR is available
- Break the warm minimal aesthetic with heavy gradients or dark patterns
