'use client'

import { useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { setReviewHidden } from '@/app/[locale]/admin/reviews/actions'

export default function AdminReviewActionButton({ reviewId, hidden }: { reviewId: string; hidden: boolean }) {
  const t = useTranslations('admin')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const result = await setReviewHidden(reviewId, !hidden)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(hidden ? t('reviewRestoredToast') : t('reviewHiddenToast'))
      router.refresh()
    })
  }

  return (
    <Button
      type="button"
      size="sm"
      variant={hidden ? 'outline' : 'destructive'}
      className="rounded-full"
      onClick={handleClick}
      disabled={isPending}
    >
      {hidden ? t('restoreReview') : t('hideReview')}
    </Button>
  )
}
