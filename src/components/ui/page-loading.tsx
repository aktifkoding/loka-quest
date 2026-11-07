import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton pemuatan bertema — dipakai oleh loading.tsx tiap route group.
 * Murni CSS (shimmer), aman untuk server component.
 */
export function PageLoading({ label = "Memuat halaman" }: { label?: string }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14" aria-busy="true" aria-label={label}>
      <Skeleton className="h-7 w-52" />
      <Skeleton className="mt-4 h-10 w-80 max-w-full" />
      <Skeleton className="mt-3 h-4 w-full max-w-xl" />
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-36 rounded-xl" />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-52 rounded-xl" />
        <Skeleton className="h-52 rounded-xl" />
      </div>
    </div>
  );
}
