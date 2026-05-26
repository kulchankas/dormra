import Link from 'next/link'

export const metadata = { title: 'Terms of Service — Dormra' }

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <article className="mx-auto max-w-2xl px-6 py-14 md:py-20">
        <Link
          href="/"
          className="text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          ← Back to home
        </Link>
        <h1 className="mt-4 text-3xl font-medium text-foreground">Terms of Service</h1>
        <p className="mt-2 text-xs text-muted-foreground">Last updated: 2026-05-17</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="mb-2 text-base font-medium text-foreground">Service</h2>
            <p>
              Dormra is a student-housing aggregator. We display availability data from
              third-party providers and notify you when matching rooms become available.
              We are not a housing provider and do not handle bookings or payments
              between you and any provider.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-medium text-foreground">Use of the service</h2>
            <p>
              You agree to use Dormra for your own personal housing search. Scraping,
              automated access, or reselling our data is not permitted without prior
              written consent.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-medium text-foreground">Availability of data</h2>
            <p>
              We work hard to keep data accurate but cannot guarantee that listings are
              available at the exact moment you contact the provider. Availability
              changes within minutes during peak season. Always confirm with the
              provider before relying on a listing.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-medium text-foreground">Liability</h2>
            <p>
              Dormra is provided &quot;as is&quot;. We are not liable for any rental
              decisions you make based on information shown on our service.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-medium text-foreground">Contact</h2>
            <p>
              Questions about these terms? Email{' '}
              <a
                href="mailto:hello@dormra.eu"
                className="text-brand underline-offset-4 hover:underline"
              >
                hello@dormra.eu
              </a>
              .
            </p>
          </section>
        </div>
      </article>
    </main>
  )
}
