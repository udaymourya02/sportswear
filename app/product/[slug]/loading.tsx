import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container py-10">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div>
          <Skeleton className="aspect-square w-full" />
          <div className="mt-4 flex gap-2">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="aspect-square w-20" />
              ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-24 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <div className="flex gap-2">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-10 w-10" />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

