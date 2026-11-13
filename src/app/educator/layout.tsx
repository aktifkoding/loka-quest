import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";

export default async function EducatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth/login");
  }
  if (user.role !== "educator" && user.role !== "admin") {
    redirect("/");
  }
  return <>{children}</>;
}
