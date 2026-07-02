import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/i18n-metadata'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  const tAuth = await getTranslations({ locale, namespace: 'auth' })
  return buildPageMetadata(locale, '/signup', t('signupPageTitle'), tAuth('signupSubtitle'))
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children
}
