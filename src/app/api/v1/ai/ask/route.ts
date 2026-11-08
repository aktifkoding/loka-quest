import { z } from "zod";
import { withErrorHandling } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { durableRateLimit } from "@/lib/security/rate-limit-db";
import { completeChat, isLlmConfigured } from "@/lib/llm";
import { type Lang } from "@/lib/i18n";
import { getLangFromRequest } from "@/lib/i18n/server";
import { errorsDict as E } from "@/lib/i18n/dict/errors";

/** Persona asisten mengikuti bahasa UI yang dipilih pengunjung. */
const SYSTEM_PROMPTS: Record<Lang, string> = {
  id:
    "Kamu adalah asisten budaya Nusantara LokaQuest. Jawab HANYA berdasarkan catatan yang diberikan. " +
    "Sertakan sitasi [n] untuk setiap klaim. Jika catatan tidak cukup, katakan bahwa informasinya belum tersedia. " +
    "Jangan mengarang fakta, angka, atau nama. Gunakan bahasa Indonesia yang jelas dan hangat, maksimal 180 kata.",
  en:
    "You are LokaQuest's Nusantara (Indonesian) culture assistant. Answer ONLY based on the provided notes. " +
    "Include a [n] citation for every claim. If the notes are insufficient, say the information is not available yet. " +
    "Do not invent facts, numbers, or names. Answer in clear, warm English, at most 180 words.",
};

const COPY: Record<Lang, {
  noResults: string;
  extractive: (top: { title: string; regionName: string | null; body: string }, extra: { title: string }[]) => string;
  disclaimer: string;
  notesLabel: string;
  questionLabel: string;
}> = {
  id: {
    noResults:
      "Saya belum menemukan jawaban yang sesuai di database budaya kami. Coba gunakan kata kunci lain seperti nama wilayah, motif, atau tradisi.",
    extractive: (top, extra) => {
      let text = `Berdasarkan sumber budaya terverifikasi, ${top.title.toLowerCase()} merupakan bagian dari ${top.regionName ?? "warisan budaya Nusantara"}. ${(top.body ?? "").slice(0, 260)}`;
      if (extra.length > 0) {
        text += ` Topik terkait: ${extra.map((item) => item.title).join(", ")}.`;
      }
      text += " Selalu teliti kembali dengan sumber asli untuk pembelajaran yang lebih mendalam.";
      return text;
    },
    disclaimer:
      "Jawaban dihasilkan dari konten budaya terverifikasi di LokaQuest. Untuk keperluan akademis, selalu cek sumber asli yang tercantum.",
    notesLabel: "Catatan:",
    questionLabel: "Pertanyaan:",
  },
  en: {
    noResults:
      "I could not find a matching answer in our culture database yet. Try other keywords such as a region name, a motif, or a tradition.",
    extractive: (top, extra) => {
      let text = `Based on verified cultural sources, ${top.title.toLowerCase()} is part of ${top.regionName ?? "the Nusantara heritage"}. ${(top.body ?? "").slice(0, 260)}`;
      if (extra.length > 0) {
        text += ` Related topics: ${extra.map((item) => item.title).join(", ")}.`;
      }
      text += " Always double-check the original sources for deeper learning.";
      return text;
    },
    disclaimer:
      "Answers are generated from verified cultural content on LokaQuest. For academic purposes, always check the original sources listed.",
    notesLabel: "Notes:",
    questionLabel: "Question:",
  },
};

type ContentRow = {
  id: string;
  title: string;
  body: string | null;
  content_type: string;
  region: { name: string } | { name: string }[] | null;
  source: { title: string; license: string | null } | { title: string; license: string | null }[] | null;
};

const askSchema = z.object({
  question: z.string().trim().min(3).max(500),
});

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2);
}

function score(text: string, queryTokens: string[]): number {
  const lower = text.toLowerCase();
  return queryTokens.reduce(
    (total, token) => (lower.includes(token) ? total + 1 : total),
    0
  );
}

function one<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const lang = getLangFromRequest(request);
    const copy = COPY[lang];
    const rl = await durableRateLimit(request, "ai-ask", 10, 60);
    if (!rl.ok) {
      return Response.json(
        { success: false, error: E.rateLimitQuestions[lang] },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    const user = await requireAuth();
    const { question } = await parseJsonBody(request, askSchema);

    const supabase = await createClient();
    const queryTokens = tokenize(question);

    const { data: contents } = await supabase
      .from("cultural_contents")
      .select(
        "id, title, body, content_type, region_id, source_id, region:cultural_regions!region_id (name), source:cultural_sources!source_id (title, license)"
      )
      .eq("status", "published")
      .limit(200);

    const rows = (contents ?? []) as unknown as ContentRow[];
    const scored = rows
      .map((row) => {
        const region = one(row.region);
        const source = one(row.source);
        const haystack = [
          row.title,
          row.body ?? "",
          region?.name ?? "",
          source?.title ?? "",
        ].join(" ");
        return { ...row, regionName: region?.name ?? null, source, score: score(haystack, queryTokens) };
      })
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const citations = scored.map((row, index) => ({
      index: index + 1,
      content_id: row.id,
      title: row.title,
      region: row.regionName,
      source: row.source?.title ?? null,
      license: row.source?.license ?? null,
      score: row.score,
    }));

    let answer: string;
    let mode: "llm" | "extractive" = "extractive";

    if (scored.length === 0) {
      answer = copy.noResults;
    } else if (isLlmConfigured()) {
      const context = scored
        .map(
          (row, index) =>
            `[${index + 1}] ${row.title}${row.regionName ? ` (${row.regionName})` : ""}\n${(row.body ?? "").slice(0, 900)}`
        )
        .join("\n\n");

      const generated = await completeChat([
        {
          role: "system",
          content: SYSTEM_PROMPTS[lang],
        },
        {
          role: "user",
          content: `${copy.notesLabel}\n${context}\n\n${copy.questionLabel} ${question}`,
        },
      ]);

      if (generated) {
        answer = generated;
        mode = "llm";
      } else {
        const top = scored[0];
        answer = copy.extractive(
          { title: top.title, regionName: top.regionName, body: `${(top.body ?? "").slice(0, 260)} ` },
          []
        );
      }
    } else {
      const top = scored[0];
      const extra = scored.slice(1, 3);
      answer = copy.extractive(
        { title: top.title, regionName: top.regionName, body: top.body ?? "" },
        extra
      );
    }

    // Best-effort quality log (RLS: users may only insert their own rows).
    try {
      await supabase.from("ai_qa_logs").insert({
        profile_id: user.id,
        question,
        answer,
        citations,
      });
    } catch {
      // logging must not break the answer
    }

    return Response.json({
      success: true,
      data: {
        answer,
        citations,
        mode,
        disclaimer: copy.disclaimer,
      },
    });
  });
}
