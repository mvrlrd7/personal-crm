import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div aria-busy aria-label="Загрузка">
      <Skeleton className="h-3.5 w-36" />
      <div className="mt-6 grid items-start gap-x-16 gap-y-12 lg:mt-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="grid grid-cols-[minmax(0,1fr)_--spacing(10)] gap-0.75 border-3 border-ink bg-ink sm:grid-cols-[minmax(0,1fr)_--spacing(16)]">
          <div className="space-y-4 bg-paper px-4.5 pt-4.5 pb-5 sm:px-7 sm:pt-7 sm:pb-8">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-3.5 w-48" />
            <Skeleton className="h-28 w-full" />
          </div>
          <Skeleton />
        </div>
        <div className="space-y-5">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
  );
}
