import { z } from "zod";
import { generateLanguageQuiz, getLanguageBySlug, REGIONAL_VOCABULARIES } from "@/lib/languages";
import { withErrorHandling } from "@/lib/api/handler";
import { parseJsonBody } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/session";
import { createServiceClient } from "@/lib/supabase/service-role";
import { getLangFromRequest } from "@/lib/i18n/server";
import { errorsDict as E } from "@/lib/i18n/dict/errors";

const submitSchema = z.object({
  answers: z.array(
    z.object({
      wordId: z.string(),
      selectedAnswer: z.string(),
    })
  ),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  return withErrorHandling(async () => {
    const lang = getLangFromRequest(request);
    const { slug } = await params;
    const language = getLanguageBySlug(slug);

    if (!language) {
      return Response.json(
        { success: false, error: E.languageNotFound[lang] },
        { status: 404 }
      );
    }

    const url = new URL(request.url);
    const count = Math.min(Math.max(Number(url.searchParams.get("count")) || 5, 1), 10);
    const quiz = generateLanguageQuiz(slug, count);

    return Response.json({
      success: true,
      data: {
        language,
        questions: quiz,
      },
    });
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  return withErrorHandling(async () => {
    const lang = getLangFromRequest(request);
    const { slug } = await params;
    const language = getLanguageBySlug(slug);
    if (!language) {
      return Response.json(
        { success: false, error: E.languageNotFound[lang] },
        { status: 404 }
      );
    }

    const body = await parseJsonBody(request, submitSchema);
    let correctCount = 0;
    const results = body.answers.map((ans) => {
      const vocab = REGIONAL_VOCABULARIES.find((v) => v.id === ans.wordId);
      const isCorrect = vocab ? vocab.meaning.trim() === ans.selectedAnswer.trim() : false;
      if (isCorrect) correctCount++;
      return {
        wordId: ans.wordId,
        word: vocab?.word ?? "",
        phonetic: vocab?.phonetic ?? "",
        correctAnswer: vocab?.meaning ?? "",
        userAnswer: ans.selectedAnswer,
        isCorrect,
        explanation: vocab
          ? lang === "en"
            ? `"${vocab.word}" means ${vocab.meaningEn ?? vocab.meaning}. Example: ${vocab.exampleSentence}`
            : `"${vocab.word}" berarti ${vocab.meaning}. Contoh: ${vocab.exampleSentence}`
          : "",
      };
    });

    const totalQuestions = body.answers.length || 1;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const xpBonus = correctCount * 15; // 15 XP per correct vocabulary answer

    // If authenticated, optionally award XP
    let userXpAwarded = false;
    let newTotalXp: number | null = null;
    try {
      const user = await requireAuth();
      const service = createServiceClient();
      const { data: current } = await service
        .from("player_progress")
        .select("total_xp, current_level")
        .eq("profile_id", user.id)
        .maybeSingle();

      if (current && xpBonus > 0) {
        const updatedXp = (current.total_xp ?? 0) + xpBonus;
        newTotalXp = updatedXp;
        const newLevel = Math.floor(updatedXp / 500) + 1;
        await service.from("player_progress").upsert({
          profile_id: user.id,
          total_xp: updatedXp,
          current_level: newLevel,
          updated_at: new Date().toISOString(),
        });
        await service
          .from("profiles")
          .update({ xp: updatedXp, level: newLevel })
          .eq("id", user.id);
        userXpAwarded = true;
      }
    } catch {
      // Guest play is allowed without login
    }

    return Response.json({
      success: true,
      data: {
        score,
        correctCount,
        totalQuestions,
        xpEarned: xpBonus,
        userXpAwarded,
        newTotalXp,
        results,
      },
    });
  });
}
