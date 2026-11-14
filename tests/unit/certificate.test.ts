import { evaluateCertificate } from "@/lib/certificate";

const missions = [
  { id: "m1" },
  { id: "m2" },
  { id: "m3" },
];

describe("Region certificate eligibility", () => {
  it("is eligible when every region mission is completed", () => {
    const attempts = [
      { mission_id: "m1", completed: true, completedAt: "2026-11-01T00:00:00Z" },
      { mission_id: "m2", completed: true, completedAt: "2026-11-02T00:00:00Z" },
      { mission_id: "m3", completed: true, completedAt: "2026-11-03T00:00:00Z" },
    ];
    const outcome = evaluateCertificate(missions, attempts);
    expect(outcome.eligible).toBe(true);
    expect(outcome.completedMissions).toBe(3);
    expect(outcome.totalMissions).toBe(3);
    expect(outcome.lastCompletedAt).toBe("2026-11-03T00:00:00Z");
  });

  it("is not eligible when one mission is missing", () => {
    const attempts = [
      { mission_id: "m1", completed: true, completedAt: "2026-11-01T00:00:00Z" },
      { mission_id: "m2", completed: true, completedAt: "2026-11-02T00:00:00Z" },
    ];
    const outcome = evaluateCertificate(missions, attempts);
    expect(outcome.eligible).toBe(false);
    expect(outcome.completedMissions).toBe(2);
  });

  it("counts only completed attempts, not failures", () => {
    const attempts = [
      { mission_id: "m1", completed: false, completedAt: null },
      { mission_id: "m2", completed: true, completedAt: "2026-11-02T00:00:00Z" },
    ];
    const outcome = evaluateCertificate(missions, attempts);
    expect(outcome.eligible).toBe(false);
    expect(outcome.completedMissions).toBe(1);
  });

  it("ignores attempts from other regions", () => {
    const attempts = [
      { mission_id: "other-region", completed: true, completedAt: "2026-11-01T00:00:00Z" },
    ];
    const outcome = evaluateCertificate(missions, attempts);
    expect(outcome.completedMissions).toBe(0);
    expect(outcome.eligible).toBe(false);
  });

  it("repeated completions keep the latest date", () => {
    const attempts = [
      { mission_id: "m1", completed: true, completedAt: "2026-11-05T00:00:00Z" },
      { mission_id: "m1", completed: true, completedAt: "2026-11-01T00:00:00Z" },
      { mission_id: "m2", completed: true, completedAt: "2026-11-03T00:00:00Z" },
      { mission_id: "m3", completed: true, completedAt: "2026-11-02T00:00:00Z" },
    ];
    expect(evaluateCertificate(missions, attempts).lastCompletedAt).toBe(
      "2026-11-05T00:00:00Z"
    );
  });

  it("empty region can never be eligible", () => {
    const outcome = evaluateCertificate([], []);
    expect(outcome.eligible).toBe(false);
    expect(outcome.totalMissions).toBe(0);
  });
});
