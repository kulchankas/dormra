import { Skeleton } from '@/components/ui/skeleton'

function DormCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <Skeleton className="aspect-video w-full" />
      <div className="space-y-2.5 p-4">
        <Skeleton className="h-3 w-1/3 rounded-full" />
        <Skeleton className="h-4 w-2/3 rounded-full" />
        <Skeleton className="h-3 w-1/2 rounded-full" />
        <Skeleton className="h-3 w-3/4 rounded-full" />
        <Skeleton className="h-5 w-1/2 rounded-full" />
      </div>
    </div>
  )
}

export default function DormsLoading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <div className="flex gap-8 items-start">
          <aside className="hidden md:block w-[260px] shrink-0">
            <Skeleton className="h-[480px] w-full rounded-2xl" />
          </aside>
          <div className="flex-1 min-w-0">
            <Skeleton className="mb-5 h-8 w-48 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <DormCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
