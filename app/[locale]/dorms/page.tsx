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

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return buildPageMetadata(locale, '/dorms', t('dormsTitle'), t('dormsDescription'))
}

async function DormsData() {
  const tAvail = await getTranslations('availability')

  const supabase = await createClient()
  const { data } = await supabase
    .from('dorms')
    .select('*')
    .eq('active', true)

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
}

export default async function DormsPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <Suspense fallback={<DormsLoading />}>
      <DormsData />
    </Suspense>
  )
}
