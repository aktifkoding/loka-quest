import { getLanguageBySlug, getVocabulariesByLanguage } from "@/lib/languages";
import { withErrorHandling } from "@/lib/api/handler";
import { getLangFromRequest } from "@/lib/i18n/server";
import { errorsDict as E } from "@/lib/i18n/dict/errors";

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
    const category = url.searchParams.get("category") || undefined;
    const difficulty = url.searchParams.get("difficulty") || undefined;

    const vocabularies = getVocabulariesByLanguage(slug, { category, difficulty });

    return Response.json({
      success: true,
      data: {
        language,
        vocabularies,
      },
    });
  });
}
