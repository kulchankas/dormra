import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/i18n-metadata'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  const tAuth = await getTranslations({ locale, namespace: 'auth' })
  return buildPageMetadata(locale, '/login', t('loginPageTitle'), tAuth('loginSubtitle'))
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
