import { Skeleton } from '@/components/ui/skeleton'

export default function SavedDormsLoading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        <Skeleton className="h-4 w-32 rounded-full" />
        <Skeleton className="mt-8 h-8 w-40 rounded-lg" />
        <Skeleton className="mt-2 h-4 w-56 rounded-full" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    </main>
  )
}
