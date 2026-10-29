import {
  registerSchema,
  loginSchema,
  attemptSubmitSchema,
  paginationSchema,
} from "@/lib/validation";

describe("registerSchema", () => {
  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse({
      email: "budi@example.com",
      password: "Rahasia123",
      fullName: "Budi Santoso",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      email: "not-an-email",
      password: "Rahasia123",
      fullName: "Budi",
    });
    expect(result.success).toBe(false);
  });

  it("rejects weak passwords", () => {
    const weak = ["short", "alllowercase1", "NOLOWERCASE1", "NoNumbersHere"];
    for (const password of weak) {
      const result = registerSchema.safeParse({
        email: "budi@example.com",
        password,
        fullName: "Budi",
      });
      expect(result.success).toBe(false);
    }
  });

  it("rejects short full names", () => {
    const result = registerSchema.safeParse({
      email: "budi@example.com",
      password: "Rahasia123",
      fullName: "B",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid credentials shape", () => {
    expect(
      loginSchema.safeParse({ email: "a@b.com", password: "x" }).success
    ).toBe(true);
  });

  it("rejects missing password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com" }).success).toBe(false);
  });
});

describe("attemptSubmitSchema", () => {
  const uuid = "123e4567-e89b-12d3-a456-426614174000";

  it("accepts a valid submission", () => {
    expect(
      attemptSubmitSchema.safeParse({
        missionId: uuid,
        answers: [{ questionId: uuid, answer: { selected: "A" } }],
      }).success
    ).toBe(true);
  });

  it("rejects non-uuid mission ids", () => {
    expect(
      attemptSubmitSchema.safeParse({
        missionId: "not-a-uuid",
        answers: [],
      }).success
    ).toBe(false);
  });

  it("rejects malformed answers", () => {
    expect(
      attemptSubmitSchema.safeParse({
        missionId: uuid,
        answers: [{ questionId: "x", answer: {} }],
      }).success
    ).toBe(false);
  });
});

describe("paginationSchema", () => {
  it("applies defaults for missing params", () => {
    const result = paginationSchema.parse({});
    expect(result).toEqual({ page: 1, limit: 20 });
  });

  it("treats null and empty-string params as missing (API querystrings)", () => {
    expect(paginationSchema.parse({ page: null, limit: null })).toEqual({
      page: 1,
      limit: 20,
    });
    expect(paginationSchema.parse({ page: "", limit: "" })).toEqual({
      page: 1,
      limit: 20,
    });
  });

  it("coerces numeric strings", () => {
    expect(paginationSchema.parse({ page: "2", limit: "50" })).toEqual({
      page: 2,
      limit: 50,
    });
  });

  it("rejects zero, negative, and oversized limits", () => {
    expect(paginationSchema.safeParse({ page: 0 }).success).toBe(false);
    expect(paginationSchema.safeParse({ page: -1 }).success).toBe(false);
    expect(paginationSchema.safeParse({ limit: 101 }).success).toBe(false);
  });
});
