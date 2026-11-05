import { getRegionalLanguages } from "@/lib/languages";
import { withErrorHandling } from "@/lib/api/handler";

export async function GET() {
  return withErrorHandling(async () => {
    const languages = getRegionalLanguages();
    return Response.json(
      { success: true, data: languages },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
    );
  });
}
