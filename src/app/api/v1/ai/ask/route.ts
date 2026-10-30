import { withErrorHandling } from "@/lib/api/handler";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

type ContentHit = {
  id: string;
  title: string;
  body: string | null;
  content_type: string;
  region_name: string | null;
  source_title: string | null;
  source_license: string | null;
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function score(text: string, queryTokens: string[]): number {
  const lower = text.toLowerCase();
  return queryTokens.reduce((acc, t) => (lower.includes(t) ? acc + 1 : acc), 0);
}

export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const user = await requireAuth();
    const { question } = await request.json();

    const q = typeof question === "string" ? question.trim() : "";
    if (!q || q.length < 3) {
      return Response.json(
        { success: false, error: "Pertanyaan minimal 3 karakter" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const queryTokens = tokenize(q);

    // Retrieve candidate contents with joined region + source
    const { data: contents } = await supabase
      .from("cultural_contents")
      .select(
        "id, title, body, content_type, region_id, source_id, region:cultural_regions!region_id (name), source:cultural_sources!source_id (title, license)"
      )
      .eq("status", "published")
      .limit(200);

    const rows = (contents ?? []) as unknown as ContentHit[];
    const scored = rows
      .map((c) => {
        const hay = [c.title, c.body ?? "", c.region_name ?? "", c.source_title ?? ""].join(" ");
        return { ...c, _score: score(hay, queryTokens) };
      })
      .filter((c) => c._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, 5);

    const citations = scored.map((c) => ({
      content_id: c.id,
      title: c.title,
      region: c.region_name,
      source: c.source_title,
      license: c.source_license,
      score: c._score,
    }));

    let answer = "";
    if (scored.length === 0) {
      answer =
        "Saya belum menemukan jawaban yang sesuai di database budaya kami. Coba gunakan kata kunci lain seperti nama wilayah, motif, atau tradisi.";
    } else {
      const top = scored[0];
      const extra = scored.slice(1, 3);
      answer = `Berdasarkan sumber budaya terverifikasi, ${top.title.toLowerCase()} merupakan bagian dari ${top.region_name ?? "warisan budaya Nusantara"}. ${top.body ? top.body.slice(0, 240) : ""}`;
      if (extra.length > 0) {
        answer += ` Topik terkait: ${extra.map((e) => e.title).join(", ")}.`;
      }
      answer += " Selalu teliti kembali dengan sumber asli untuk pembelajaran yang lebih mendalam.";
    }

    // Persist log for quality review (best-effort)
    try {
      await supabase.from("ai_qa_logs").insert({
        profile_id: user.id,
        question: q,
        answer,
        citations,
      });
    } catch {
      // non-blocking
    }

    return Response.json({
      success: true,
      data: {
        answer,
        citations,
        disclaimer:
          "Jawaban dihasilkan dari konten budaya terverifikasi di LokaQuest. Untuk keperluan akademis, selalu cek sumber asli yang tercantum.",
      },
    });
  });
}
