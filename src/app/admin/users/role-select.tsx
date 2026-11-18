"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { adminDict as d } from "@/lib/i18n/dict/admin";
import { Loader2 } from "lucide-react";

const ROLES = ["player", "educator", "admin"] as const;

export function RoleSelect({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const { t } = useI18n();
  const [role, setRole] = useState(currentRole);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const router = useRouter();

  const change = async (next: string) => {
    if (next === role || saving) return;
    setSaving(true);
    setFailed(false);
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: next }),
      });
      if (res.ok) {
        setRole(next);
        router.refresh();
      } else {
        setFailed(true);
      }
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <span className="relative inline-flex items-center gap-2">
      <select
        value={role}
        onChange={(e) => void change(e.target.value)}
        disabled={saving}
        aria-label={t(d.changeRoleAria)}
        aria-invalid={failed || undefined}
        className={`h-8 rounded-md border bg-card px-2 text-[13px] capitalize outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 ${
          failed ? "border-destructive" : "border-input"
        }`}
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      {saving && <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-hidden="true" />}
      {failed && !saving && (
        <span role="alert" className="text-[12px] text-destructive">
          {t(d.roleChangeFailed)}
        </span>
      )}
    </span>
  );
}
