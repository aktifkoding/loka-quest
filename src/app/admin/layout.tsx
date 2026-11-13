import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { AdminNav } from "./admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth/login");
  }
  if (user.role !== "admin" && user.role !== "educator") {
    redirect("/");
  }
  return (
    <>
      {user.role === "admin" && <AdminNav email={user.email} />}
      <div className="min-h-[calc(100vh-3.5rem)]">{children}</div>
    </>
  );
}
