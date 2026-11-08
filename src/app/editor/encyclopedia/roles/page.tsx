"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { adminDict as d } from "@/lib/i18n/dict/admin";
import { commonDict } from "@/lib/i18n/dict/common";
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

export default function EncyclopediaRolesPage() {
  const { t } = useI18n();
  const roleLabel: Record<string, string> = {
    content_administrator: t(d.roleContentAdministrator),
    cultural_editor: t(d.roleCulturalEditor),
    reviewer: t(d.roleReviewer),
    contributor: t(d.roleContributor),
  };
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
      if (!response.ok) throw new Error(json.error || t(d.rolesLoadFailed));
      setRoles(json.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t(commonDict.errorGeneric));
    } finally {
      setLoading(false);
    }
  }, [t]);

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
      setError(json.error || t(d.assignRoleFailed));
      return;
    }
    setEmail("");
    setMessage(t(d.roleUpdatedToast));
    await load();
  }

  async function remove(profileId: string) {
    if (!confirm(t(d.revokeRoleConfirm))) return;
    const response = await fetch(
      `/api/v1/admin/encyclopedia/roles/${profileId}`,
      { method: "DELETE" }
    );
    if (!response.ok) {
      const json = await response.json();
      setError(json.error || t(d.revokeRoleFailed));
      return;
    }
    setMessage(t(d.roleRevokedToast));
    await load();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
        <Link href="/editor/encyclopedia">
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t(d.backToCms)}
        </Link>
      </Button>

      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {t(d.rolesTitle)}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t(d.rolesDescription)}
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
            {t(d.userEmailLabel)}
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
            {t(d.roleLabel)}
            <select
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
              value={editorRole}
              onChange={(event) => setEditorRole(event.target.value)}
            >
              <option value="contributor">{t(d.roleContributor)}</option>
              <option value="reviewer">{t(d.roleReviewer)}</option>
              <option value="cultural_editor">{t(d.roleCulturalEditor)}</option>
              <option value="content_administrator">{t(d.roleContentAdministrator)}</option>
            </select>
          </label>
          <div className="flex items-end">
            <Button type="submit">
              <UserPlus className="size-4" aria-hidden="true" />
              {t(d.assignCta)}
            </Button>
          </div>
        </form>
      </Card>

      <div className="mt-8">
        {loading ? (
          <p className="text-sm text-muted-foreground">{t(commonDict.loadingShort)}</p>
        ) : roles.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {t(d.emptyRoles)}
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
                    aria-label={t(d.revokeRoleAria)}
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
