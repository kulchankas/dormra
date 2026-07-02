'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('errors')

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-medium text-foreground">{t('errorTitle')}</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{t('errorBody')}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Button onClick={reset} className="rounded-full">
          {t('tryAgain')}
        </Button>
        <Button variant="outline" nativeButton={false} className="rounded-full" render={<Link href="/" />}>
          {t('backHome')}
        </Button>
      </div>
    </main>
  )
}
