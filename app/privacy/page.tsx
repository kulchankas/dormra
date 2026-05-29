import Link from 'next/link'

export const metadata = { title: 'Privacy Policy — Dormra' }

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <article className="mx-auto max-w-2xl px-6 py-14 md:py-20">
        <Link
          href="/"
          className="text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          ← Back to home
        </Link>
        <h1 className="mt-4 text-3xl font-medium text-foreground">Privacy Policy</h1>
        <p className="mt-2 text-xs text-muted-foreground">Last updated: 2026-05-17</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="mb-2 text-base font-medium text-foreground">Overview</h2>
            <p>
              Dormra (&quot;we&quot;, &quot;us&quot;) operates a student-housing aggregator
              for Vienna and respects your privacy. This policy explains what data we
              collect, how we use it, and the choices you have. We are in private beta —
              this page will be updated with final legal text before public launch.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-medium text-foreground">Data we collect</h2>
            <ul className="ml-4 list-disc space-y-1">
              <li>Account email and authentication metadata (Supabase Auth, EU region).</li>
              <li>Your saved search criteria and alert preferences.</li>
              <li>Application status you choose to track in your personal kanban.</li>
              <li>
                Anonymous analytics on which pages you visit, used only to improve the
                product.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-medium text-foreground">How we use it</h2>
            <p>
              We use your data only to deliver the service: matching new dorm
              availability against your saved criteria, sending you alerts by email or
              Telegram, and showing you your own application tracker. We do not sell or
              share your data with third parties for advertising.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-medium text-foreground">Your rights</h2>
            <p>
              You can export or delete your account and all associated data at any time
              from your account settings. For any privacy question, write to{' '}
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
