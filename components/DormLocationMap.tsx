'use client'

import dynamic from 'next/dynamic'
import { type Dorm } from '@/lib/helpers'
import type { AvailabilityStatus } from '@/lib/availability'
import { Skeleton } from '@/components/ui/skeleton'

const DormsMap = dynamic(() => import('@/components/DormsMap'), {
  ssr: false,
  loading: () => <Skeleton className="h-56 w-full rounded-2xl" />,
})

/** Client wrapper so the server-rendered dorm detail page can embed a
 * client-only Leaflet map (next/dynamic with ssr:false isn't allowed
 * directly inside a Server Component). */
export default function DormLocationMap({
  dorm,
  availability,
}: {
  dorm: Dorm
  availability: AvailabilityStatus
}) {
  return <DormsMap dorms={[dorm]} availability={{ [dorm.id]: availability }} compact />
}
