import { Skeleton } from "@/components/ui/skeleton";

const ROW_GRID =
  "grid grid-cols-[--spacing(14)_minmax(0,1fr)] gap-0.75 sm:grid-cols-[--spacing(18)_minmax(0,1fr)]";

export default function Loading() {
  return (
    <div aria-busy aria-label="Загрузка">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <div>
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="mt-3.5 h-8 w-44 lg:mt-5 lg:h-13 lg:w-64" />
        </div>
        <Skeleton className="h-12 w-60 lg:h-14 lg:w-68" />
      </div>
      <div className="mt-7 flex flex-col gap-0.75 border-3 border-ink bg-ink lg:mt-10">
        <div className={ROW_GRID}>
          <span className="bg-ink" />
          <div className="h-16 bg-paper" />
        </div>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className={ROW_GRID}>
            <Skeleton />
            <div className="bg-paper px-4.5 py-5 sm:px-5.5">
              <Skeleton className="h-4.5 w-48" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
