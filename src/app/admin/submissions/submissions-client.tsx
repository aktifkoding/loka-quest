"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Reveal } from "@/components/ui/reveal";
import { CheckCircle2, XCircle, Clock, MessageSquare } from "lucide-react";

type Submission = {
  id: string;
  title: string;
  body: string;
  submitter_name: string;
  submitter_email: string;
  region_slug: string | null;
  status: "pending" | "published" | "rejected";
  admin_note: string | null;
  created_at: string;
};

export function AdminSubmissionsClient({ initial }: { initial: Submission[] }) {
  const [items, setItems] = useState<Submission[]>(initial);
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  const updateStatus = async (id: string, status: "published" | "rejected", admin_note?: string) => {
    const res = await fetch(`/api/v1/admin/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, admin_note: admin_note ?? noteText }),
    });
    if (!res.ok) {
      const json = await res.json();
      alert(json.error || "Gagal memperbarui");
      return;
    }
    setItems((items) => items.map((i) => (i.id === id ? { ...i, status, admin_note: admin_note ?? noteText } : i)));
    setNoteFor(null);
    setNoteText("");
  };

  const pending = items.filter((i) => i.status === "pending");
  const reviewed = items.filter((i) => i.status !== "pending");

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-display text-xl font-semibold">Menunggu verifikasi ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Tidak ada usulan baru.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {pending.map((item, index) => (
              <li key={item.id}>
                <Reveal delay={index * 70}>
                  <Card className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-display text-lg font-semibold">{item.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {item.submitter_name} · {item.submitter_email} · {new Date(item.created_at).toLocaleString("id-ID")}
                          {item.region_slug ? ` · ${item.region_slug}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => updateStatus(item.id, "published")}>
                        <CheckCircle2 className="size-4" aria-hidden="true" />
                        Publikasikan
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => updateStatus(item.id, "rejected")}>
                        <XCircle className="size-4" aria-hidden="true" />
                        Tolak
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setNoteFor(noteFor === item.id ? null : item.id)}
                      >
                        <MessageSquare className="size-4" aria-hidden="true" />
                        Catatan
                      </Button>
                    </div>

                    {noteFor === item.id && (
                      <div className="mt-4">
                        <Label htmlFor={`note-${item.id}`}>Catatan admin (opsional)</Label>
                        <textarea
                          id={`note-${item.id}`}
                          className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Alasan publikasi/penolakan..."
                        />
                      </div>
                    )}
                  </Card>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">Riwayat ({reviewed.length})</h2>
        {reviewed.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Belum ada yang diverifikasi.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {reviewed.map((item, index) => {
              const Icon = item.status === "published" ? CheckCircle2 : XCircle;
              const cls = item.status === "published" ? "text-emerald-600" : "text-rose-600";
              return (
                <li key={item.id}>
                  <Reveal delay={index * 70}>
                    <Card className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-display text-lg font-semibold">{item.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{item.submitter_name} · {new Date(item.created_at).toLocaleString("id-ID")}</p>
                        </div>
                        <span className={`flex items-center gap-1.5 text-sm font-medium ${cls}`}>
                          <Icon className="size-4" aria-hidden="true" />
                          {item.status === "published" ? "Dipublikasikan" : "Ditolak"}
                        </span>
                      </div>
                      {item.admin_note && <p className="mt-2 text-sm text-muted-foreground">Catatan: {item.admin_note}</p>}
                    </Card>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
