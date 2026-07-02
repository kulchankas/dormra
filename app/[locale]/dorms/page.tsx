import { Suspense } from 'react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/i18n-metadata'
import { createClient } from '@/lib/supabase/server'
import { type Dorm } from '@/lib/helpers'
import { getAvailabilityStatusBulk, availabilityMapToRecord } from '@/lib/availability'
import { localizeAvailabilityRecord } from '@/lib/i18n-availability'
import DormsDirectory from '@/components/DormsDirectory'
import DormsLoading from './loading'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return buildPageMetadata(locale, '/dorms', t('dormsTitle'), t('dormsDescription'))
}

async function DormsUnavailable() {
  const t = await getTranslations('dorms')
  return (
    <main className="min-h-screen bg-background">
      <div className="hero-glow border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {t('title')}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-amber-500/10">
          <AlertTriangle className="size-6 text-amber-600" />
        </div>
        <p className="text-base font-medium text-foreground">{t('loadError')}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t('loadErrorHint')}</p>
        <Button
          nativeButton={false}
          className="mt-6 h-10 rounded-full px-6 text-sm"
          render={<Link href="/dorms" />}
        >
          {t('tryAgain')}
        </Button>
      </div>
    </main>
  )
}

async function DormsContent() {
  const tAvail = await getTranslations('availability')

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('dorms')
      .select('*')
      .eq('active', true)

    if (error) throw error

    const dorms = (data ?? []) as Dorm[]
    const availabilityMap = await getAvailabilityStatusBulk(
      dorms.map((d) => d.id),
      supabase,
    )

    const availability = localizeAvailabilityRecord(
      availabilityMapToRecord(availabilityMap),
      (key) => tAvail(key),
    )

    return <DormsDirectory dorms={dorms} availability={availability} />
  } catch {
    return <DormsUnavailable />
  }
}

export default async function DormsPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <Suspense fallback={<DormsLoading />}>
      <DormsContent />
    </Suspense>
  )
}
