import { setRequestLocale, getTranslations } from 'next-intl/server'
import { formatDistanceToNow } from 'date-fns'
import { de, ru, enGB } from 'date-fns/locale'
import { getReportedReviews } from '@/lib/admin-reviews'
import AdminReviewActionButton from '@/components/AdminReviewActionButton'
import StarRating from '@/components/StarRating'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

const DATE_LOCALES = { en: enGB, de, ru } as const

type PageProps = { params: Promise<{ locale: string }> }

export default async function AdminReviewsPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('admin')
  const tReviews = await getTranslations('reviews')
  const dateLocale = DATE_LOCALES[locale as keyof typeof DATE_LOCALES] ?? enGB

  const reports = await getReportedReviews()

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{t('reviewsTitle')}</h2>
        <p className="text-sm text-muted-foreground">{t('reviewsSubtitle', { count: reports.length })}</p>
      </div>

      {reports.length === 0 ? (
        <div className="card-elevated rounded-2xl bg-surface p-8 text-center">
          <p className="text-sm text-muted-foreground">{t('noReports')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className={cn(
                'card-elevated rounded-2xl bg-surface p-4',
                report.hidden && 'ring-1 ring-amber-500/30',
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dorms/${report.dormSlug}`}
                      className="text-sm font-medium text-foreground hover:text-brand hover:underline"
                    >
                      {report.dormName}
                    </Link>
                    <StarRating value={report.rating} size="sm" ariaLabel={tReviews('ratingAria', { rating: report.rating })} />
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {report.pseudonym} · {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true, locale: dateLocale })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-medium',
                      report.hidden ? 'bg-amber-500/10 text-amber-700' : 'bg-red-500/10 text-red-700',
                    )}
                  >
                    {report.hidden
                      ? t('reviewCurrentlyHidden')
                      : t('reportCount', { count: report.reportCount })}
                  </span>
                  <AdminReviewActionButton reviewId={report.id} hidden={report.hidden} />
                </div>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{report.body}</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {report.reasons.map((reason, i) => (
                  <span
                    key={`${reason}-${i}`}
                    className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                  >
                    {t(`reportReasons.${reason}`)}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
