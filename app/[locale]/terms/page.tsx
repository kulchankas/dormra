import { Link } from '@/i18n/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return { title: t('termsTitle') }
}

export default async function TermsPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('terms')

  return (
    <main className="min-h-screen bg-background">
      <article className="mx-auto max-w-2xl px-6 py-14 md:py-20">
        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground hover:underline">
          {t('back')}
        </Link>
        <h1 className="mt-4 text-3xl font-medium text-foreground">{t('title')}</h1>
        <p className="mt-2 text-xs text-muted-foreground">{t('updated')}</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="mb-2 text-base font-medium text-foreground">{t('serviceTitle')}</h2>
            <p>{t('serviceBody')}</p>
          </section>
          <section>
            <h2 className="mb-2 text-base font-medium text-foreground">{t('accuracyTitle')}</h2>
            <p>{t('accuracyBody')}</p>
          </section>
        </div>
      </article>
    </main>
  )
}
