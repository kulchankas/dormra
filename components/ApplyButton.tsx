'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ExternalLink } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { recordApplyClick } from '@/app/[locale]/dashboard/saved/actions'
import { Button } from '@/components/ui/button'

function applyUrlWithSource(href: string): string {
  try {
    const url = new URL(href)
    if (!url.searchParams.has('utm_source')) {
      url.searchParams.set('utm_source', 'dormra')
    }
    return url.toString()
  } catch {
    return href
  }
}

export default function ApplyButton({
  dormId,
  dormSlug,
  applyHref,
  provider,
  isLoggedIn,
}: {
  dormId: string
  dormSlug: string
  applyHref: string
  provider: string
  isLoggedIn: boolean
}) {
  const t = useTranslations('dormDetail')
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function handleApply() {
    const outbound = applyUrlWithSource(applyHref)
    try {
      sessionStorage.setItem(`dormra-applied-${dormSlug}`, Date.now().toString())
    } catch {
      // sessionStorage unavailable — tracker still updates via server action
    }
    window.open(outbound, '_blank', 'noopener,noreferrer')

    if (!isLoggedIn) return

    startTransition(async () => {
      const result = await recordApplyClick(dormId)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(t('appliedToast', { provider }))
      router.refresh()
    })
  }

  return (
    <Button
      size="lg"
      className="h-12 w-full gap-2 rounded-2xl text-sm"
      disabled={pending}
      onClick={handleApply}
    >
      {t('applyOn', { provider })}
      <ExternalLink className="size-3.5" aria-hidden="true" />
    </Button>
  )
}
