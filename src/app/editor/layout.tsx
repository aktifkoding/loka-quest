import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { requireEncyclopediaRole } from "@/lib/encyclopedia";

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/auth/login");

  try {
    await requireEncyclopediaRole([
      "content_administrator",
      "cultural_editor",
      "reviewer",
      "contributor",
    ]);
  } catch {
    redirect("/");
  }

  return <>{children}</>;
}
