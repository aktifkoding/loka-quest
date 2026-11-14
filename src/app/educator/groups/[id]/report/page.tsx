"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useI18n, formatDate, formatNumber } from "@/lib/i18n";
import { educatorDict as d } from "@/lib/i18n/dict/educator";
import { commonDict } from "@/lib/i18n/dict/common";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Download, Printer, Users, Target, Star } from "lucide-react";
import { buildClassReportCsv, reportFileName, type ReportRow } from "@/lib/educator/report-csv";

type ReportData = {
  group: { id: string; name: string; description: string | null; createdAt: string };
  rows: ReportRow[];
  generatedAt: string;
};

export default function GroupReportPage() {
  const { t, lang } = useI18n();
  const params = useParams<{ id: string }>();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/educator/groups/${params.id}/report`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || t(d.reportLoadFailed));
      setReport(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t(d.reportLoadFailed));
    } finally {
      setLoading(false);
    }
  }, [params.id, t]);

  useEffect(() => {
    load();
  }, [load]);

  const downloadCsv = () => {
    if (!report) return;
    const csv = buildClassReportCsv(report.rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = reportFileName(report.group.name, report.generatedAt);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  // Ringkasan kelas
  const studentCount = report?.rows.length ?? 0;
  const totalCompleted = report?.rows.reduce((s, r) => s + r.missionsCompleted, 0) ?? 0;
  const totalAttempts = report?.rows.reduce((s, r) => s + r.attempts, 0) ?? 0;
  const completionRate =
    totalAttempts > 0 ? Math.round((totalCompleted / totalAttempts) * 100) : null;
  const scored = (report?.rows ?? []).filter((r) => r.avgScore !== null);
  const classAvg =
    scored.length > 0
      ? Math.round(
          (scored.reduce((s, r) => s + (r.avgScore ?? 0), 0) / scored.length) * 10
        ) / 10
      : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <div className="no-print">
        <PageHeader
          title={report ? `${t(d.reportTitle)} — ${report.group.name}` : t(d.reportTitle)}
          description={t(d.reportDescription)}
          backLabel={t(commonDict.back)}
          backHref="/educator/groups"
          icon={Users}
          actions={
            report && report.rows.length > 0 ? (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={downloadCsv}>
                  <Download className="size-4" aria-hidden="true" />
                  {t(d.reportDownloadCsv)}
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer className="size-4" aria-hidden="true" />
                  {t(d.reportPrint)}
                </Button>
              </div>
            ) : undefined
          }
        />
      </div>

      {loading ? (
        <div className="mt-8 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : error ? (
        <Card className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3 p-5">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={load}>
              {t(commonDict.retry)}
            </Button>
          </div>
        </Card>
      ) : !report || report.rows.length === 0 ? (
        <div className="mt-8">
          <Card className="p-6">
          <EmptyState
            icon={Users}
            title={t(d.reportEmpty)}
            description={report?.group.description ?? ""}
          />
          </Card>
        </div>
      ) : (
        <>
          {/* Ringkasan kelas */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Card className="border-primary/25 bg-primary/5">
              <div className="flex items-center gap-3 p-5">
                <Users className="size-5 text-primary" aria-hidden="true" />
                <div>
                  <p className="font-display text-2xl font-semibold tabular-nums">
                    {studentCount}
                  </p>
                  <p className="text-[13px] text-muted-foreground">
                    {t(d.reportStudentsCount)}
                  </p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3 p-5">
                <Target className="size-5 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="font-display text-2xl font-semibold tabular-nums">
                    {completionRate !== null ? `${completionRate}%` : "—"}
                  </p>
                  <p className="text-[13px] text-muted-foreground">
                    {t(d.reportCompletionRate)}
                  </p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3 p-5">
                <Star className="size-5 text-gold" aria-hidden="true" />
                <div>
                  <p className="font-display text-2xl font-semibold tabular-nums">
                    {classAvg !== null ? formatNumber(classAvg, lang) : "—"}
                  </p>
                  <p className="text-[13px] text-muted-foreground">
                    {t(d.reportAvgScoreAll)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Tabel rapor */}
          <Card className="mt-6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">{t(d.reportTitle)}</caption>
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-left text-[13px] text-muted-foreground">
                    <th scope="col" className="px-4 py-3 font-medium">{t(d.reportStudent)}</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">{t(d.reportLevel)}</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">{t(d.reportXp)}</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">{t(d.reportAttempts)}</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">{t(d.reportCompleted)}</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">{t(d.reportAvgScore)}</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">{t(d.reportBest)}</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">{t(d.reportAssignments)}</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">{t(d.reportLastActivity)}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {report.rows.map((row) => (
                    <tr key={row.profileId} className="transition-colors hover:bg-secondary/40">
                      <td className="px-4 py-3">
                        <p className="font-medium">{row.studentName}</p>
                        <p className="truncate text-[12px] text-muted-foreground">{row.studentEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{row.level}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatNumber(row.totalXp, lang)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{row.attempts}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{row.missionsCompleted}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {row.avgScore !== null ? formatNumber(row.avgScore, lang) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {row.bestScore !== null ? row.bestScore : "—"}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {t(d.reportAssignmentsPattern, {
                          done: row.assignmentsCompleted,
                          total: row.assignmentsTotal,
                        })}
                      </td>
                      <td className="px-4 py-3 text-right text-[13px] text-muted-foreground">
                        {row.lastActivityAt ? formatDate(row.lastActivityAt, lang) : t(d.reportNever)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="border-t border-border px-4 py-2 text-[12px] text-muted-foreground">
              {t(d.reportGeneratedAt)} {formatDate(report.generatedAt, lang)}
            </p>
          </Card>
        </>
      )}

      {/* Kaki cetak */}
      <p className="mt-4 hidden text-center text-[12px] text-muted-foreground print:block">
        LokaQuest — {t(d.reportTitle)} · {report?.group.name}
      </p>
    </div>
  );
}
