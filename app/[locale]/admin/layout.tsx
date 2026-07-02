import { setRequestLocale, getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { buildPageMetadata } from '@/lib/i18n-metadata'
import { requireAdmin } from '@/lib/admin-auth'
import AdminNav from '@/components/AdminNav'
import ScanningPillServer from '@/components/ScanningPillServer'
import type { Locale } from '@/i18n/routing'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return buildPageMetadata(locale, '/admin', t('adminTitle'))
}

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const user = await requireAdmin(locale as Locale)
  if (!user) notFound()

  const t = await getTranslations('admin')

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand/70">
              {t('badge')}
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('title')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          </div>
          <ScanningPillServer />
        </div>
        <AdminNav />
        {children}
      </div>
    </div>
  )
}
