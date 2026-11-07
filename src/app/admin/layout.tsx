import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { AdminNav } from "./admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const admin = await requireRole(["admin"]);
    return (
      <>
        <AdminNav email={admin.email} />
        <div className="min-h-[calc(100vh-3.5rem)]">{children}</div>
      </>
    );
  } catch {
    redirect("/");
  }
}
