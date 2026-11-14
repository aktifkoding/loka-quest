/**
 * Pure helpers untuk rapor kelas (educator report): pembentukan CSV
 * yang aman untuk Excel (BOM + escaping) dan pengumpulan statistik siswa.
 */

export type ReportRow = {
  profileId: string;
  studentName: string;
  studentEmail: string;
  joinedAt: string | null;
  level: number;
  totalXp: number;
  attempts: number;
  missionsCompleted: number;
  avgScore: number | null;
  bestScore: number | null;
  lastActivityAt: string | null;
  assignmentsTotal: number;
  assignmentsCompleted: number;
};

const CSV_COLUMNS = [
  "Nama",
  "Email",
  "Tanggal Bergabung",
  "Level",
  "Total XP",
  "Upaya Misi",
  "Misi Selesai",
  "Rata-rata Skor",
  "Skor Terbaik",
  "Aktivitas Terakhir",
  "Tugas Diterima",
  "Tugas Total",
];

function escapeCsv(value: string | number | null): string {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (/[",;\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/** Bangun isi file CSV dari baris rapor. Excel-safe (BOM, pemisah ;). */
export function buildClassReportCsv(rows: ReportRow[]): string {
  const lines = [CSV_COLUMNS.join(";")];
  for (const row of rows) {
    lines.push(
      [
        row.studentName,
        row.studentEmail,
        row.joinedAt,
        row.level,
        row.totalXp,
        row.attempts,
        row.missionsCompleted,
        row.avgScore,
        row.bestScore,
        row.lastActivityAt,
        row.assignmentsCompleted,
        row.assignmentsTotal,
      ]
        .map(escapeCsv)
        .join(";")
    );
  }
  return "\uFEFF" + lines.join("\r\n");
}

/** Nama file rapor yang ramah sistem file. */
export function reportFileName(groupName: string, dateIso: string): string {
  const safe = groupName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const date = dateIso.slice(0, 10);
  return `rapor-${safe || "kelas"}-${date}.csv`;
}
