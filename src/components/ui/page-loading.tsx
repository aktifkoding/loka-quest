import { Skeleton } from "@/components/ui/skeleton";
import { getServerI18n } from "@/lib/i18n/server";
import { commonDict } from "@/lib/i18n/dict/common";

/**
 * Skeleton pemuatan bertema — dipakai oleh loading.tsx tiap route group.
 * Murni CSS (shimmer), aman untuk server component.
 */
export async function PageLoading({ label }: { label?: string }) {
  const { t } = await getServerI18n();

  return (
    <div
      className="mx-auto max-w-6xl px-4 py-10 md:py-14"
      aria-busy="true"
      aria-label={label ?? t(commonDict.loading)}
    >
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
