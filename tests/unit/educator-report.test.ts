import { buildClassReportCsv, reportFileName, type ReportRow } from "@/lib/educator/report-csv";

const row: ReportRow = {
  profileId: "profile-1",
  studentName: "Siti; \"Nur\" Halimah",
  studentEmail: "siti@sekolah.sch.id",
  joinedAt: "2026-11-01T00:00:00Z",
  level: 3,
  totalXp: 1250,
  attempts: 8,
  missionsCompleted: 5,
  avgScore: 82.5,
  bestScore: 100,
  lastActivityAt: "2026-11-13T10:00:00Z",
  assignmentsTotal: 3,
  assignmentsCompleted: 2,
};

describe("Class report CSV", () => {
  it("emits a header with 12 columns", () => {
    const csv = buildClassReportCsv([]);
    const lines = csv.replace(/^\uFEFF/, "").split("\r\n");
    expect(lines[0].split(";")).toHaveLength(12);
    expect(lines[0]).toContain("Nama");
    expect(lines[0]).toContain("Rata-rata Skor");
  });

  it("prefixes a BOM so Excel opens UTF-8 correctly", () => {
    expect(buildClassReportCsv([row]).charCodeAt(0)).toBe(0xfeff);
  });

  it("escapes semicolons, quotes and newlines in values", () => {
    const csv = buildClassReportCsv([row]);
    expect(csv).toContain('"Siti; ""Nur"" Halimah"');
  });

  it("keeps one line per row after parsing escaped fields", () => {
    const csv = buildClassReportCsv([row, { ...row, studentName: "Budi" }]);
    const body = csv.replace(/^\uFEFF/, "").split("\r\n");
    expect(body).toHaveLength(3);
    expect(body[2].split(";")[0]).toBe("Budi");
  });

  it("writes null numbers and dates as empty cells", () => {
    const csv = buildClassReportCsv([
      { ...row, studentName: "Budi", avgScore: null, lastActivityAt: null },
    ]);
    const cells = csv.replace(/^\uFEFF/, "").split("\r\n")[1].split(";");
    expect(cells[7]).toBe("");
    expect(cells[9]).toBe("");
  });

  it("builds a safe file name", () => {
    expect(reportFileName("Kelas 7A / IPA!", "2026-11-14T00:00:00Z")).toBe(
      "rapor-kelas-7a-ipa-2026-11-14.csv"
    );
  });
});
