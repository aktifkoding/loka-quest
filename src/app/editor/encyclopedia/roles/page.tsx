"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Trash2, UserPlus } from "lucide-react";

type EditorRole = {
  profile_id: string;
  editor_role: string;
  created_at: string;
  profiles:
    | { email: string; full_name: string | null }
    | { email: string; full_name: string | null }[]
    | null;
};

const roleLabel: Record<string, string> = {
  content_administrator: "Administrator konten",
  cultural_editor: "Editor budaya",
  reviewer: "Reviewer",
  contributor: "Kontributor",
};

export default function EncyclopediaRolesPage() {
  const [roles, setRoles] = useState<EditorRole[]>([]);
  const [email, setEmail] = useState("");
  const [editorRole, setEditorRole] = useState("contributor");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/v1/admin/encyclopedia/roles", {
        cache: "no-store",
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Gagal memuat peran");
      setRoles(json.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function assign(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    setError(null);
    const response = await fetch("/api/v1/admin/encyclopedia/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, editorRole }),
    });
    const json = await response.json();
    if (!response.ok) {
      setError(json.error || "Gagal menetapkan peran");
      return;
    }
    setEmail("");
    setMessage("Peran editorial diperbarui.");
    await load();
  }

  async function remove(profileId: string) {
    if (!confirm("Cabut peran editorial pengguna ini?")) return;
    const response = await fetch(
      `/api/v1/admin/encyclopedia/roles/${profileId}`,
      { method: "DELETE" }
    );
    if (!response.ok) {
      const json = await response.json();
      setError(json.error || "Gagal mencabut peran");
      return;
    }
    setMessage("Peran dicabut.");
    await load();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
        <Link href="/editor/encyclopedia">
          <ArrowLeft className="size-4" aria-hidden="true" />
          CMS ensiklopedia
        </Link>
      </Button>

      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Peran editorial
        </h1>
        <p className="mt-2 text-muted-foreground">
          Berikan akses kontributor, reviewer, editor, atau administrator konten.
        </p>
      </header>

      {error && (
        <div role="alert" className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {message && (
        <p role="status" className="mt-5 text-sm text-primary">
          {message}
        </p>
      )}

      <Card className="mt-6 p-6">
        <form onSubmit={assign} className="grid gap-4 sm:grid-cols-[1fr_200px_auto]">
          <label className="block text-sm font-medium">
            Email pengguna
            <Input
              className="mt-1"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nama@email.com"
            />
          </label>
          <label className="block text-sm font-medium">
            Peran
            <select
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
              value={editorRole}
              onChange={(event) => setEditorRole(event.target.value)}
            >
              <option value="contributor">Kontributor</option>
              <option value="reviewer">Reviewer</option>
              <option value="cultural_editor">Editor budaya</option>
              <option value="content_administrator">Administrator konten</option>
            </select>
          </label>
          <div className="flex items-end">
            <Button type="submit">
              <UserPlus className="size-4" aria-hidden="true" />
              Tetapkan
            </Button>
          </div>
        </form>
      </Card>

      <div className="mt-8">
        {loading ? (
          <p className="text-sm text-muted-foreground">Memuat…</p>
        ) : roles.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Belum ada peran editorial. Administrator aplikasi tetap memiliki akses penuh.
          </p>
        ) : (
          <Card className="divide-y divide-border">
            {roles.map((role) => {
              const profile = Array.isArray(role.profiles)
                ? role.profiles[0]
                : role.profiles;
              return (
                <div key={role.profile_id} className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {profile?.full_name || profile?.email || role.profile_id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {profile?.email} · {roleLabel[role.editor_role] ?? role.editor_role}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => remove(role.profile_id)}
                    aria-label="Cabut peran"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              );
            })}
          </Card>
        )}
      </div>
    </div>
  );
}
