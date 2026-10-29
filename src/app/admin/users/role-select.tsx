"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const ROLES = ["player", "educator", "admin"] as const;

export function RoleSelect({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const [role, setRole] = useState(currentRole);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const change = async (next: string) => {
    if (next === role) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: next }),
      });
      const json = await res.json();
      if (res.ok) {
        setRole(next);
        router.refresh();
      } else {
        console.error(json.error);
      }
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
        aria-label="Ubah peran pengguna"
        className="h-8 rounded-md border border-input bg-card px-2 text-[13px] capitalize outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      {saving && <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-hidden="true" />}
    </span>
  );
}
