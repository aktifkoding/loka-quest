import {
  adminContentSchema,
  adminMissionSchema,
  adminQuestionSchema,
  adminRegionSchema,
} from "@/lib/validation/admin";

describe("adminMissionSchema", () => {
  const valid = {
    slug: "detektif-batik",
    title: "Detektif Batik",
    description: "Telusuri motif batik dan maknanya.",
    regionId: "3f0f7b1e-7a4b-4f9f-9a8a-1e2d3c4b5a60",
    difficulty: "beginner",
    xpReward: 100,
    status: "draft",
    sortOrder: 1,
    learningObjectives: ["Mengenal motif"],
  };

  it("accepts a valid mission", () => {
    expect(adminMissionSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an invalid slug and out-of-range XP", () => {
    expect(
      adminMissionSchema.safeParse({ ...valid, slug: "Slug Salah!" }).success
    ).toBe(false);
    expect(
      adminMissionSchema.safeParse({ ...valid, xpReward: 5000 }).success
    ).toBe(false);
  });
});

describe("adminQuestionSchema", () => {
  it("accepts a multiple-choice question", () => {
    const result = adminQuestionSchema.safeParse({
      questionType: "multiple_choice",
      prompt: "Apa motif batik dari Jawa Tengah?",
      options: { choices: ["Parang", "Kawung"] },
      correctAnswer: { correct: "Parang" },
      sortOrder: 1,
    });
    expect(result.success).toBe(true);
  });

  it("requires an answer key object", () => {
    const result = adminQuestionSchema.safeParse({
      questionType: "multiple_choice",
      prompt: "Pertanyaan tanpa kunci",
      options: {},
    });
    expect(result.success).toBe(false);
  });
});

describe("adminRegionSchema", () => {
  it("rejects a too-short description", () => {
    const result = adminRegionSchema.safeParse({
      slug: "bali",
      name: "Bali",
      description: "Terlalu singkat",
    });
    expect(result.success).toBe(false);
  });
});

describe("adminContentSchema", () => {
  const valid = {
    regionId: "3f0f7b1e-7a4b-4f9f-9a8a-1e2d3c4b5a60",
    title: "Batik Pesisir",
    description: "Catatan tentang batik pesisir dan komunitasnya.",
    contentType: "tradition",
    status: "draft",
    sortOrder: 1,
  };

  it("accepts a draft without a source", () => {
    expect(adminContentSchema.safeParse(valid).success).toBe(true);
  });

  it("requires a source before publishing", () => {
    expect(
      adminContentSchema.safeParse({ ...valid, status: "published" }).success
    ).toBe(false);
    expect(
      adminContentSchema.safeParse({
        ...valid,
        status: "published",
        sourceId: "7d9e2c1a-4b6f-4a8e-9c3d-2b1a0f9e8d7c",
      }).success
    ).toBe(true);
  });
});
