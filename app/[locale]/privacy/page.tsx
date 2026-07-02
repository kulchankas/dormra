import { Link } from '@/i18n/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return { title: t('privacyTitle') }
}

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('privacy')

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
            <h2 className="mb-2 text-base font-medium text-foreground">{t('overviewTitle')}</h2>
            <p>{t('overviewBody')}</p>
          </section>
          <section>
            <h2 className="mb-2 text-base font-medium text-foreground">{t('collectTitle')}</h2>
            <ul className="ml-4 list-disc space-y-1">
              <li>{t('collect1')}</li>
              <li>{t('collect2')}</li>
              <li>{t('collect3')}</li>
              <li>{t('collect4')}</li>
            </ul>
          </section>
          <section>
            <h2 className="mb-2 text-base font-medium text-foreground">{t('useTitle')}</h2>
            <p>{t('useBody')}</p>
          </section>
          <section>
            <h2 className="mb-2 text-base font-medium text-foreground">{t('rightsTitle')}</h2>
            <p>
              {t('rightsBody')}{' '}
              <a href="mailto:hello@dormra.eu" className="text-brand underline-offset-4 hover:underline">
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
