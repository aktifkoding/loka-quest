import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";

export default async function EducatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireRole(["educator", "admin"]);
    return <>{children}</>;
  } catch {
    redirect("/");
  }
}
