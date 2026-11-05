import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

/**
 * Grid of card-shaped skeletons that mirrors the common 3-column card list.
 * Pass `count` and `className` (for grid columns) to match the final layout.
 */
export function CardSkeletonGrid({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border/70 bg-card p-6 shadow-card"
        >
          <Skeleton className="size-11 rounded-xl" />
          <Skeleton className="mt-5 h-5 w-3/4" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}
