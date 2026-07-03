import { Link } from '@/i18n/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/i18n-metadata'
import { Search, Bell, Mail, Clock, Map, ShieldCheck } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'

type PageProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return buildPageMetadata(locale, '/how-it-works', t('howItWorksTitle'))
}

export default async function HowItWorksPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('howItWorks')

  const steps = [
    { n: '01', icon: Search, title: t('step1Title'), desc: t('step1Desc') },
    { n: '02', icon: Bell, title: t('step2Title'), desc: t('step2Desc') },
    { n: '03', icon: Mail, title: t('step3Title'), desc: t('step3Desc') },
  ]

  const highlights = [
    { icon: Clock, label: t('highlight1') },
    { icon: Map, label: t('highlight2') },
    { icon: ShieldCheck, label: t('highlight3') },
  ]

  const faq = [
    { q: t('faq1q'), a: t('faq1a') },
    { q: t('faq2q'), a: t('faq2a') },
    { q: t('faq3q'), a: t('faq3a') },
    { q: t('faq4q'), a: t('faq4a') },
    { q: t('faq5q'), a: t('faq5a') },
    { q: t('faq6q'), a: t('faq6a') },
    { q: t('faq7q'), a: t('faq7a') },
  ]

  return (
    <main className="min-h-screen bg-background">
      <section className="hero-glow">
        <div className="mx-auto max-w-3xl px-6 pb-16 pt-14 text-center md:pt-20">
          <span className="inline-flex rounded-full border border-border/60 bg-surface/80 px-3 py-1 text-xs font-medium text-brand backdrop-blur-sm">
            {t('badge')}
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
            {t('title')}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
            {t('subtitle')}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            {highlights.map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5">
                <Icon className="size-3.5 text-brand" aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <h2 className="mb-6 text-center text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {t('stepsTitle')}
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map(({ n, icon: Icon, title, desc }) => (
            <div key={n} className="card-elevated rounded-2xl bg-surface p-5">
              <div className="mb-3 flex items-center justify-between">
                <Icon className="size-5 text-brand" />
                <span className="text-[11px] font-semibold tracking-widest text-brand/50">{n}</span>
              </div>
              <p className="font-semibold text-foreground">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button size="lg" className="h-11 rounded-full px-7 text-sm" nativeButton={false} render={<Link href="/dorms" />}>
            {t('browseCta')}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-11 rounded-full px-7 text-sm"
            nativeButton={false}
            render={<Link href="/signup?redirect=/dashboard/alerts/new" />}
          >
            {t('alertCta')}
          </Button>
        </div>
      </section>

      <section className="border-t border-border/60 bg-surface-soft/50 py-14">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="mb-6 text-center text-xl font-semibold text-foreground">{t('faqTitle')}</h2>
          <Accordion className="w-full">
            {faq.map(({ q, a }, i) => (
              <AccordionItem key={q} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium">{q}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </main>
  )
}
