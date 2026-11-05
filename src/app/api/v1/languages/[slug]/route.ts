import { getLanguageBySlug, getVocabulariesByLanguage } from "@/lib/languages";
import { withErrorHandling } from "@/lib/api/handler";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  return withErrorHandling(async () => {
    const { slug } = await params;
    const language = getLanguageBySlug(slug);

    if (!language) {
      return Response.json(
        { success: false, error: "Bahasa daerah tidak ditemukan" },
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
