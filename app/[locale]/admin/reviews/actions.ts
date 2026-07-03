'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/admin-emails'

async function assertAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email)) return null
  return user
}

export async function setReviewHidden(reviewId: string, hidden: boolean): Promise<{ error?: string }> {
  const admin = await assertAdmin()
  if (!admin) return { error: 'Not authorized' }

  const service = createAdminClient()
  const { error } = await service
    .from('dorm_reviews')
    .update({
      hidden,
      hidden_reason: hidden ? 'Hidden by moderator after user report(s)' : null,
    })
    .eq('id', reviewId)

  if (error) return { error: error.message }

  revalidatePath('/admin/reviews')
  return {}
}
