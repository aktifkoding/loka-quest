"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/feedback";
import {
  MissionMetaFields,
  toMetaPayload,
  type MissionMetaState,
  type RegionOption,
} from "./mission-meta";

export type MissionRecord = {
  id: string;
  slug: string;
  title: string;
  description: string;
  learning_objectives: string[];
  difficulty: MissionMetaState["difficulty"];
  xp_reward: number;
  status: MissionMetaState["status"];
  sort_order: number;
  region_id: string;
};

type QuestionType = "multiple_choice" | "sequencing" | "matching" | "identification";

type QuestionRow = {
  id: string;
  question_type: QuestionType;
  prompt: string;
  options: Record<string, unknown>;
  correct_answer: Record<string, unknown>;
  explanation: string | null;
  sort_order: number;
};

type QuestionFormState = {
  id: string | null;
  question_type: QuestionType;
  prompt: string;
  choices: string;
  correct_choice: string;
  correct_text: string;
  events: string;
  pairs: string;
  explanation: string;
  sort_order: number;
};

const TYPE_LABEL: Record<QuestionType, string> = {
  multiple_choice: "Pilihan ganda",
  identification: "Identifikasi",
  sequencing: "Urutkan",
  matching: "Jodohkan",
};

const EMPTY_QUESTION: QuestionFormState = {
  id: null,
  question_type: "multiple_choice",
  prompt: "",
  choices: "",
  correct_choice: "",
  correct_text: "",
  events: "",
  pairs: "",
  explanation: "",
  sort_order: 1,
};

const linesOf = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((v) => String(v)) : [];

const pairsOf = (value: unknown): [string, string][] =>
  value && typeof value === "object" && !Array.isArray(value)
    ? Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, String(v)])
    : [];

const parsePairs = (text: string): Record<string, string> | null => {
  const pairs: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const sep = trimmed.indexOf("=");
    if (sep <= 0) return null;
    const left = trimmed.slice(0, sep).trim();
    const right = trimmed.slice(sep + 1).trim();
    if (!left || !right) return null;
    pairs[left] = right;
  }
  return Object.keys(pairs).length > 0 ? pairs : null;
};

const lines = (text: string) =>
  text.split("\n").map((line) => line.trim()).filter(Boolean);

function toQuestionPayload(state: QuestionFormState): Record<string, unknown> | { error: string } {
  const base = {
    question_type: state.question_type,
    prompt: state.prompt.trim(),
    explanation: state.explanation.trim() || null,
    sort_order: state.sort_order,
  };

  if (state.question_type === "multiple_choice") {
    const choices = lines(state.choices);
    if (choices.length < 2) return { error: "Pilihan ganda butuh minimal 2 pilihan." };
    if (!state.correct_choice || !choices.includes(state.correct_choice)) {
      return { error: "Pilih salah satu pilihan sebagai jawaban benar." };
    }
    return { ...base, options: { choices }, correct_answer: { correct: state.correct_choice } };
  }

  if (state.question_type === "identification") {
    const choices = lines(state.choices);
    if (!state.correct_text.trim()) return { error: "Isi jawaban benar." };
    return {
      ...base,
      options: choices.length > 0 ? { choices } : {},
      correct_answer: { correct: state.correct_text.trim() },
    };
  }

  if (state.question_type === "sequencing") {
    const events = lines(state.events);
    if (events.length < 2) return { error: "Urutkan butuh minimal 2 acara." };
    if (!state.correct_text.trim()) return { error: "Isi urutan yang benar (pisahkan dengan koma)." };
    return {
      ...base,
      options: { events },
      correct_answer: { correct: state.correct_text.trim() },
    };
  }

  const pairs = parsePairs(state.pairs);
  if (!pairs) return { error: "Format pasangan: kiri = kanan, satu per baris." };
  return { ...base, options: { pairs }, correct_answer: { matches: pairs } };
}

function fromQuestionRow(row: QuestionRow): QuestionFormState {
  const correct = String((row.correct_answer as Record<string, unknown>)?.correct ?? "");
  return {
    id: row.id,
    question_type: row.question_type,
    prompt: row.prompt,
    choices: linesOf(row.options?.choices).join("\n"),
    correct_choice: row.question_type === "multiple_choice" ? correct : "",
    correct_text: row.question_type === "identification" ? correct : row.question_type === "sequencing" ? correct : "",
    events: linesOf(row.options?.events).join("\n"),
    pairs: pairsOf(row.correct_answer?.matches ?? row.options?.pairs)
      .map(([k, v]) => `${k} = ${v}`)
      .join("\n"),
    explanation: row.explanation ?? "",
    sort_order: row.sort_order,
  };
}

const textAreaClass =
  "mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

function QuestionFields({
  state,
  onChange,
}: {
  state: QuestionFormState;
  onChange: (next: QuestionFormState) => void;
}) {
  const set = <K extends keyof QuestionFormState>(key: K, value: QuestionFormState[K]) =>
    onChange({ ...state, [key]: value });

  const choiceLines = lines(state.choices);

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="q-type">Jenis soal</Label>
          <select
            id="q-type"
            value={state.question_type}
            onChange={(e) => set("question_type", e.target.value as QuestionType)}
            className="mt-1 flex h-9 w-full rounded-md border border-input bg-card px-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {(Object.keys(TYPE_LABEL) as QuestionType[]).map((type) => (
              <option key={type} value={type}>
                {TYPE_LABEL[type]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="q-sort">Urutan soal</Label>
          <Input
            id="q-sort"
            className="mt-1"
            type="number"
            min={0}
            max={999}
            value={state.sort_order}
            onChange={(e) => set("sort_order", Number(e.target.value))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="q-prompt">Pertanyaan</Label>
        <textarea
          id="q-prompt"
          className={textAreaClass}
          value={state.prompt}
          onChange={(e) => set("prompt", e.target.value)}
          required
        />
      </div>

      {state.question_type === "multiple_choice" && (
        <>
          <div>
            <Label htmlFor="q-choices">Pilihan (satu per baris)</Label>
            <textarea
              id="q-choices"
              className={textAreaClass}
              value={state.choices}
              onChange={(e) => set("choices", e.target.value)}
              placeholder={"Parang Rusak\nKawung\nSemen Rama"}
            />
          </div>
          {choiceLines.length >= 2 && (
            <div>
              <Label htmlFor="q-correct-choice">Jawaban benar</Label>
              <select
                id="q-correct-choice"
                value={state.correct_choice}
                onChange={(e) => set("correct_choice", e.target.value)}
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-card px-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <option value="" disabled>
                  Pilih jawaban benar
                </option>
                {choiceLines.map((choice) => (
                  <option key={choice} value={choice}>
                    {choice}
                  </option>
                ))}
              </select>
            </div>
          )}
        </>
      )}

      {state.question_type === "identification" && (
        <>
          <div>
            <Label htmlFor="q-hints">Opsi/petunjuk (opsional, satu per baris)</Label>
            <textarea
              id="q-hints"
              className={textAreaClass}
              value={state.choices}
              onChange={(e) => set("choices", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="q-correct-text">Jawaban benar (teks persis)</Label>
            <Input
              id="q-correct-text"
              className="mt-1"
              value={state.correct_text}
              onChange={(e) => set("correct_text", e.target.value)}
              placeholder="Saron"
            />
          </div>
        </>
      )}

      {state.question_type === "sequencing" && (
        <>
          <div>
            <Label htmlFor="q-events">Daftar acara yang ditampilkan (satu per baris)</Label>
            <textarea
              id="q-events"
              className={textAreaClass}
              value={state.events}
              onChange={(e) => set("events", e.target.value)}
              placeholder={"Keluarga kerajaan dibuang\nPangeran lahir di hutan"}
            />
          </div>
          <div>
            <Label htmlFor="q-correct-seq">Urutan yang benar (pisahkan dengan koma)</Label>
            <Input
              id="q-correct-seq"
              className="mt-1"
              value={state.correct_text}
              onChange={(e) => set("correct_text", e.target.value)}
              placeholder="Pangeran lahir di hutan, keluarga kerajaan dibuang"
            />
          </div>
        </>
      )}

      {state.question_type === "matching" && (
        <div>
          <Label htmlFor="q-pairs">Pasangan (kiri = kanan, satu per baris)</Label>
          <textarea
            id="q-pairs"
            className={textAreaClass}
            value={state.pairs}
            onChange={(e) => set("pairs", e.target.value)}
            placeholder={"Parang Rusak = Keberanian\nKawung = Kebersihan"}
          />
        </div>
      )}

      <div>
        <Label htmlFor="q-explanation">Penjelasan (opsional)</Label>
        <textarea
          id="q-explanation"
          className={textAreaClass}
          value={state.explanation}
          onChange={(e) => set("explanation", e.target.value)}
        />
      </div>
    </div>
  );
}

export function MissionEditor({
  mission,
  initialQuestions,
  regions,
}: {
  mission: MissionRecord;
  initialQuestions: QuestionRow[];
  regions: RegionOption[];
}) {
  const router = useRouter();
  const [meta, setMeta] = useState<MissionMetaState>({
    title: mission.title,
    slug: mission.slug,
    region_id: mission.region_id,
    description: mission.description,
    objectives: mission.learning_objectives.join("\n"),
    difficulty: mission.difficulty,
    xp_reward: mission.xp_reward,
    sort_order: mission.sort_order,
    status: mission.status,
  });
  const [savingMeta, setSavingMeta] = useState(false);

  const [questions, setQuestions] = useState<QuestionRow[]>(initialQuestions);
  const [form, setForm] = useState<QuestionFormState | null>(null);
  const [busy, setBusy] = useState(false);
  const { showToast, toastNode } = useToast();

  const saveMeta = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingMeta(true);
    try {
      const res = await fetch(`/api/v1/admin/missions/${mission.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toMetaPayload(meta)),
      });
      const json = await res.json();
      if (!res.ok) {
        showToast("error", json.error || "Gagal menyimpan misi");
        return;
      }
      router.refresh();
      showToast("success", "Perubahan misi tersimpan.");
    } finally {
      setSavingMeta(false);
    }
  };

  const reloadQuestions = async () => {
    const res = await fetch(`/api/v1/admin/missions/${mission.id}/questions`);
    const json = await res.json();
    if (res.ok) setQuestions(json.data ?? []);
  };

  const saveQuestion = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form) return;
    const payload = toQuestionPayload(form);
    if ("error" in payload) {
      showToast("error", String(payload.error));
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(
        form.id
          ? `/api/v1/admin/missions/${mission.id}/questions/${form.id}`
          : `/api/v1/admin/missions/${mission.id}/questions`,
        {
          method: form.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json();
      if (!res.ok) {
        showToast("error", json.error || "Gagal menyimpan soal");
        return;
      }
      setForm(null);
      showToast("success", "Soal tersimpan.");
      await reloadQuestions();
    } finally {
      setBusy(false);
    }
  };

  const deleteQuestion = async (question: QuestionRow) => {
    if (!confirm("Hapus soal ini?")) return;
    setBusy(true);
    try {
      const res = await fetch(
        `/api/v1/admin/missions/${mission.id}/questions/${question.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const json = await res.json();
        showToast("error", json.error || "Gagal menghapus soal");
        return;
      }
      await reloadQuestions();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
        <Link href="/admin/missions">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Daftar misi
        </Link>
      </Button>

      <header>
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Edit misi
        </h1>
        <p className="mt-2 text-muted-foreground">
          {mission.title} · <span className="font-mono text-[13px]">{mission.slug}</span>
        </p>
      </header>

      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold">Detail misi</h2>
        <form onSubmit={saveMeta} className="mt-4">
          <Card>
            <div className="p-6">
              <MissionMetaFields
                state={meta}
                onChange={setMeta}
                regions={regions}
                slugLocked
              />
            </div>
          </Card>
          <div className="mt-4">
            <Button type="submit" disabled={savingMeta}>
              {savingMeta && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              Simpan perubahan
            </Button>
          </div>
        </form>
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold">
            Soal ({questions.length})
          </h2>
          {form === null && (
            <Button onClick={() => setForm({ ...EMPTY_QUESTION })}>
              <Plus className="size-4" aria-hidden="true" />
              Tambah soal
            </Button>
          )}
        </div>

        {form !== null && (
          <form onSubmit={saveQuestion} className="mt-4">
            <Card>
              <div className="p-6">
                <p className="font-display text-lg font-semibold">
                  {form.id ? "Edit soal" : "Soal baru"}
                </p>
                <div className="mt-4">
                  <QuestionFields state={form} onChange={setForm} />
                </div>
                <div className="mt-5 flex gap-3">
                  <Button type="submit" disabled={busy}>
                    {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                    Simpan soal
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setForm(null)}>
                    Batal
                  </Button>
                </div>
              </div>
            </Card>
          </form>
        )}

        <ul className="mt-4 space-y-3">
          {questions.map((question) => (
            <li key={question.id}>
              <Card>
                <div className="flex flex-wrap items-start gap-4 px-6 py-5">
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {TYPE_LABEL[question.question_type] ?? question.question_type}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{question.prompt}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Urutan {question.sort_order}
                      {question.explanation ? ` · ${question.explanation}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setForm(fromQuestionRow(question))}
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => void deleteQuestion(question)}
                      disabled={busy}
                      aria-label="Hapus soal"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </Card>
            </li>
          ))}
          {questions.length === 0 && form === null && (
            <Card>
              <div className="px-6 py-5 text-sm text-muted-foreground">
                Belum ada soal. Tambahkan minimal satu soal sebelum menerbitkan misi.
              </div>
            </Card>
          )}
        </ul>
      </section>
      {toastNode}
    </>
  );
}
