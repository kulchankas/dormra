import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'

export default async function NotFound() {
  const t = await getTranslations('errors')

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-semibold text-brand/30">404</p>
      <h1 className="mt-4 text-2xl font-medium text-foreground">{t('notFoundTitle')}</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{t('notFoundBody')}</p>
      <Button nativeButton={false} className="mt-6 rounded-full" render={<Link href="/" />}>
        {t('backHome')}
      </Button>
    </main>
  )
}
