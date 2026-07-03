import { ArrowLeft } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/i18n-metadata'
import { createClient } from '@/lib/supabase/server'
import AlertForm from '@/components/AlertForm'
import type { AlertPayload } from '@/app/[locale]/dashboard/alerts/actions'
import { Link, redirect } from '@/i18n/navigation'

type PageProps = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    maxPrice?: string
    districts?: string
    maxDeposit?: string
    pets?: string
    couples?: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return buildPageMetadata(locale, '/dashboard/alerts/new', t('newAlertPageTitle'))
}

function parseDistricts(raw: string | undefined): number[] {
  return (raw ?? '')
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => !Number.isNaN(value) && value >= 1 && value <= 23)
}

function parsePositiveInt(raw: string | undefined): number | null {
  if (!raw) return null
  const value = Number(raw)
  if (Number.isNaN(value) || value <= 0) return null
  return value
}

function parseFlag(raw: string | undefined): boolean {
  return raw === '1' || raw === 'true'
}

export default async function NewAlertPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('dashboard')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect({ href: '/login?redirect=/dashboard/alerts/new', locale })
    return
  }

  const sp = await searchParams
  const districts = parseDistricts(sp.districts)
  const maxPrice = parsePositiveInt(sp.maxPrice)
  const maxDeposit = parsePositiveInt(sp.maxDeposit)

  const prefilled: Partial<AlertPayload> = {}
  if (districts.length > 0) prefilled.districts = districts
  if (maxPrice != null) prefilled.price_max = maxPrice
  if (maxDeposit != null) prefilled.deposit_max = maxDeposit
  if (parseFlag(sp.pets)) prefilled.pets_required = true
  if (parseFlag(sp.couples)) prefilled.couples = true

  return (
    <main className="min-h-screen bg-background">
      <div className="hero-glow border-b border-border/40">
        <div className="mx-auto max-w-2xl px-4 py-8 md:px-8 md:py-10">
          <Link
            href="/dashboard/alerts"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            {t('backToAlerts')}
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('newAlertTitle')}</h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">{t('newAlertSubtitle')}</p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6 pb-28 md:px-8 md:py-8 md:pb-8">
        <AlertForm mode="create" defaultValues={prefilled as AlertPayload} />
      </div>
    </main>
  )
}
