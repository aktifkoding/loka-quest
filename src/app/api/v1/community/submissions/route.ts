import { withErrorHandling } from "@/lib/api/handler";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const submissionSchema = {
  title: "string",
  body: "string",
  region_slug: "string?",
  submitter_name: "string",
  submitter_email: "string",
};

export async function GET() {
  return withErrorHandling(async () => {
    const supabase = await createClient();
    const url = new URL("http://localhost" + "/api/v1/community/submissions");

    const status = url.searchParams.get("status") ?? "pending";
    const { data, error } = await supabase
      .from("community_submissions")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error("Failed to load submissions");
    }

    return Response.json({ success: true, data: data ?? [] });
  });
}

export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const user = await requireAuth();
    const supabase = await createClient();
    const body = await request.json();

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const bodyText = typeof body.body === "string" ? body.body.trim() : "";
    const regionSlug = typeof body.region_slug === "string" ? body.region_slug.trim() : null;
    const submitterName = typeof body.submitter_name === "string" ? body.submitter_name.trim() : "";
    const submitterEmail = typeof body.submitter_email === "string" ? body.submitter_email.trim() : "";

    if (!title || !bodyText || !submitterName || !submitterEmail) {
      return Response.json(
        { success: false, error: "Judul, isi, nama, dan email pengirim wajib diisi" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("community_submissions")
      .insert({
        submitter_id: user.id,
        submitter_name: submitterName,
        submitter_email: submitterEmail,
        title,
        body: bodyText,
        region_slug: regionSlug,
        status: "pending",
      })
      .select("*")
      .single();

    if (error) {
      throw new Error("Failed to submit contribution");
    }

    return Response.json({ success: true, data }, { status: 201 });
  });
}
