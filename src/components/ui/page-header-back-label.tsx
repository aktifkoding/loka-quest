"use client";

import { useI18n } from "@/lib/i18n";
import { commonDict } from "@/lib/i18n/dict/common";

/**
 * Label tautan kembali bawaan PageHeader — diterjemahkan sesuai bahasa aktif.
 * Client component kecil agar aman dipakai PageHeader baik dari server page
 * maupun client page (selalu berada di dalam I18nProvider root layout).
 */
export function PageHeaderBackLabel({ label }: { label?: string }) {
  const { t } = useI18n();
  return <>{label ?? t(commonDict.back)}</>;
}
