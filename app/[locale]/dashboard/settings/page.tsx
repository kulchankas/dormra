import { formatDistanceToNow } from 'date-fns'
import { de, ru, enGB } from 'date-fns/locale'
import { ArrowLeft, Mail } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/i18n-metadata'
import { createClient } from '@/lib/supabase/server'
import { Link, redirect } from '@/i18n/navigation'
import ChangePasswordForm from '@/components/ChangePasswordForm'
import ExportAccountDataButton from '@/components/ExportAccountDataButton'
import DeleteAccountSection from '@/components/DeleteAccountSection'

const DATE_LOCALES = { en: enGB, de, ru } as const

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return buildPageMetadata(locale, '/dashboard/settings', t('settingsPageTitle'))
}

export default async function SettingsPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('settings')
  const tDash = await getTranslations('dashboard')
  const dateLocale = DATE_LOCALES[locale as keyof typeof DATE_LOCALES] ?? enGB

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect({ href: '/login?redirect=/dashboard/settings', locale })
    return
  }

  const { data: deliveryRows } = await supabase
    .from('alert_log')
    .select('id, sent_at, channel, dorm_id')
    .eq('user_id', user.id)
    .order('sent_at', { ascending: false })
    .limit(20)

  const dormIds = [...new Set((deliveryRows ?? []).map((r) => r.dorm_id))]
  const dormById = new Map<string, { name: string; slug: string }>()

  if (dormIds.length > 0) {
    const { data: dorms } = await supabase
      .from('dorms')
      .select('id, name, slug')
      .in('id', dormIds)
    for (const dorm of dorms ?? []) {
      dormById.set(dorm.id, { name: dorm.name, slug: dorm.slug })
    }
  }

  const deliveries = (deliveryRows ?? []).map((row) => ({
    ...row,
    dorm: dormById.get(row.dorm_id) ?? null,
  }))

  const memberSince = user.created_at
    ? formatDistanceToNow(new Date(user.created_at), { addSuffix: true, locale: dateLocale })
    : null

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 md:px-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            {tDash('backToDashboard')}
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>

        <div className="space-y-6">
          <section className="card-elevated rounded-2xl bg-surface p-5">
            <h2 className="text-sm font-semibold text-foreground">{t('accountSection')}</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">{t('email')}</dt>
                <dd className="mt-0.5 font-medium text-foreground">{user.email}</dd>
              </div>
              {memberSince && (
                <div>
                  <dt className="text-xs text-muted-foreground">{t('memberSince')}</dt>
                  <dd className="mt-0.5 text-foreground">{memberSince}</dd>
                </div>
              )}
            </dl>
          </section>

          <section className="card-elevated rounded-2xl bg-surface p-5">
            <h2 className="text-sm font-semibold text-foreground">{t('securitySection')}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{t('securityHint')}</p>
            <div className="mt-4">
              <ChangePasswordForm />
            </div>
          </section>

          <section className="card-elevated rounded-2xl bg-surface p-5">
            <h2 className="text-sm font-semibold text-foreground">{t('emailHistorySection')}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{t('emailHistoryHint')}</p>
            {deliveries.length > 0 ? (
              <ul className="mt-4 divide-y divide-border/60">
                {deliveries.map((row) => (
                  <li key={row.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <Mail className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {row.dorm?.name ?? t('unknownDorm')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(row.sent_at), {
                          addSuffix: true,
                          locale: dateLocale,
                        })}
                        {' · '}
                        {row.channel}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">{t('noEmailHistory')}</p>
            )}
          </section>

          <section className="card-elevated rounded-2xl bg-surface p-5">
            <h2 className="text-sm font-semibold text-foreground">{t('dataSection')}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{t('dataHint')}</p>
            <div className="mt-4">
              <ExportAccountDataButton />
            </div>
          </section>

          <section className="card-elevated rounded-2xl border border-destructive/10 bg-surface p-5">
            <h2 className="text-sm font-semibold text-destructive">{t('dangerSection')}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{t('dangerHint')}</p>
            <div className="mt-4">
              <DeleteAccountSection email={user.email ?? ''} />
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
