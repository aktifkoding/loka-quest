import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";

export default async function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth/login");
  }
  return <>{children}</>;
}
