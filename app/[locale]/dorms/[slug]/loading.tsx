import { Skeleton } from '@/components/ui/skeleton'

export default function DormDetailLoading() {
  return (
    <main className="min-h-screen bg-background pb-24 md:pb-12">
      <div className="mx-auto max-w-3xl px-4 pt-6 md:px-8 md:pt-8">
        <Skeleton className="mb-6 h-4 w-28 rounded-full" />
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <div className="mt-6 space-y-3">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-8 w-3/4 rounded-lg" />
          <Skeleton className="h-4 w-1/2 rounded-full" />
          <Skeleton className="h-4 w-2/3 rounded-full" />
        </div>
        <div className="mt-8 flex gap-3">
          <Skeleton className="h-11 flex-1 rounded-full" />
          <Skeleton className="h-11 w-32 rounded-full" />
        </div>
      </div>
    </main>
  )
}
