import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";

export default async function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const user = await requireAuth();
    if (user.role !== "player" && user.role !== "admin") {
      redirect("/");
    }
    return <>{children}</>;
  } catch {
    redirect("/auth/login");
  }
}
