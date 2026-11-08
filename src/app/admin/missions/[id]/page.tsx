"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { adminDict as d } from "@/lib/i18n/dict/admin";
import { commonDict } from "@/lib/i18n/dict/common";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";

type Region = { id: string; name: string };
type Question = {
  id: string;
  question_type: string;
  prompt: string;
  options: Record<string, unknown>;
  correct_answer: Record<string, unknown>;
  explanation: string | null;
  sort_order: number;
};
type Mission = {
  id: string;
  slug: string;
  title: string;
  description: string;
  region_id: string;
  difficulty: string;
  xp_reward: number;
  status: string;
  sort_order: number;
  learning_objectives: string[];
  questions: Question[];
};

const emptyQuestion = {
  id: "",
  questionType: "multiple_choice",
  prompt: "",
  optionsText: "",
  correctText: "",
  explanation: "",
  sortOrder: 0,
};

function pairsToLines(pairs: Record<string, string>) {
  return Object.entries(pairs)
    .map(([left, right]) => `${left}=${right}`)
    .join("\n");
}

function linesToPairs(text: string) {
  return Object.fromEntries(
    text
      .split("\n")
      .map((line) => line.split("="))
      .filter((parts) => parts.length === 2)
      .map(([left, right]) => [left.trim(), right.trim()])
  );
}

function questionToForm(question: Question) {
  const options = question.options ?? {};
  const correct = question.correct_answer ?? {};
  let optionsText = "";
  let correctText = "";

  if (question.question_type === "multiple_choice") {
    optionsText = ((options.choices as string[]) ?? []).join("\n");
    correctText = String(correct.correct ?? "");
  } else if (question.question_type === "matching") {
    const lefts = (options.lefts as string[]) ?? [];
    const rights = (options.rights as string[]) ?? [];
    const pairs =
      lefts.length > 0
        ? Object.fromEntries(lefts.map((left, index) => [left, rights[index] ?? ""]))
        : ((options.pairs as Record<string, string>) ?? {});
    optionsText = pairsToLines(pairs);
    correctText = pairsToLines((correct.matches as Record<string, string>) ?? pairs);
  } else if (question.question_type === "sequencing") {
    const events = (options.events as string[]) ?? [];
    const order = (correct.order as (string | number)[]) ?? [];
    optionsText = events.join("\n");
    correctText = order
      .map((value) =>
        typeof value === "number" ? (events[value - 1] ?? String(value)) : value
      )
      .join("\n");
  } else {
    optionsText = ((options.instruments as string[]) ?? []).join("\n");
    correctText = String(correct.correct ?? "");
  }

  return {
    id: question.id,
    questionType: question.question_type,
    prompt: question.prompt,
    optionsText,
    correctText,
    explanation: question.explanation ?? "",
    sortOrder: question.sort_order,
  };
}

function formToPayload(form: typeof emptyQuestion) {
  const lines = form.optionsText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const answerLines = form.correctText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  let options: Record<string, unknown> = {};
  let correctAnswer: Record<string, unknown> = {};

  if (form.questionType === "multiple_choice") {
    options = { choices: lines };
    correctAnswer = { correct: form.correctText.trim() };
  } else if (form.questionType === "matching") {
    const pairs = linesToPairs(form.optionsText);
    options = { lefts: Object.keys(pairs), rights: Object.values(pairs) };
    correctAnswer = { matches: pairs };
  } else if (form.questionType === "sequencing") {
    options = { events: lines };
    correctAnswer = { order: answerLines };
  } else {
    options = { instruments: lines };
    correctAnswer = { correct: form.correctText.trim() };
  }

  return {
    questionType: form.questionType,
    prompt: form.prompt,
    options,
    correctAnswer,
    explanation: form.explanation || null,
    sortOrder: Number(form.sortOrder),
  };
}

export default function AdminMissionDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { t } = useI18n();
  const [mission, setMission] = useState<Mission | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [question, setQuestion] = useState({ ...emptyQuestion });

  const load = useCallback(async () => {
    try {
      const [missionRes, regionRes] = await Promise.all([
        fetch(`/api/v1/admin/missions/${id}`, { cache: "no-store" }),
        fetch("/api/v1/admin/regions", { cache: "no-store" }),
      ]);
      const missionJson = await missionRes.json();
      const regionJson = await regionRes.json();
      if (!missionRes.ok) throw new Error(missionJson.error || t(d.loadMissionsFailed));
      setMission(missionJson.data);
      setRegions(regionJson.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t(commonDict.errorGeneric));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveMission(event: React.FormEvent) {
    event.preventDefault();
    if (!mission) return;
    setError(null);
    setMessage("");
    const response = await fetch(`/api/v1/admin/missions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: mission.slug,
        title: mission.title,
        description: mission.description,
        regionId: mission.region_id,
        difficulty: mission.difficulty,
        xpReward: mission.xp_reward,
        status: mission.status,
        sortOrder: mission.sort_order,
        learningObjectives: mission.learning_objectives ?? [],
      }),
    });
    const json = await response.json();
    if (!response.ok) {
      setError(json.error || t(d.saveMissionFailed));
      return;
    }
    setMessage(t(d.missionSavedToast));
    await load();
  }

  async function saveQuestion(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage("");
    const editing = Boolean(question.id);
    const url = editing
      ? `/api/v1/admin/missions/${id}/questions/${question.id}`
      : `/api/v1/admin/missions/${id}/questions`;
    const response = await fetch(url, {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formToPayload(question)),
    });
    const json = await response.json();
    if (!response.ok) {
      setError(json.error || t(d.saveQuestionFailed));
      return;
    }
    setQuestion({ ...emptyQuestion });
    setShowQuestion(false);
    setMessage(editing ? t(d.questionUpdatedToast) : t(d.questionAddedToast));
    await load();
  }

  async function deleteQuestion(questionId: string) {
    if (!confirm(t(d.questionDeleteConfirm))) return;
    const response = await fetch(
      `/api/v1/admin/missions/${id}/questions/${questionId}`,
      { method: "DELETE" }
    );
    if (!response.ok) {
      const json = await response.json();
      setError(json.error || t(d.deleteQuestionFailed));
      return;
    }
    setMessage(t(d.questionDeletedToast));
    await load();
  }

  const inputClass =
    "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

  if (loading) {
    return <p className="p-10 text-center text-sm text-muted-foreground">{t(commonDict.loadingShort)}</p>;
  }

  if (!mission) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="font-medium">{t(d.missionNotFound)}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/admin/missions">{t(commonDict.back)}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-14">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
        <Link href="/admin/missions">
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t(d.backToMissions)}
        </Link>
      </Button>

      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {mission.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">/{mission.slug}</p>
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
        <form onSubmit={saveMission} className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            {t(d.titleLabel)}
            <Input
              className={inputClass}
              value={mission.title}
              onChange={(event) => setMission({ ...mission, title: event.target.value })}
            />
          </label>
          <label className="block text-sm font-medium">
            {t(d.slugLabel)}
            <Input
              className={inputClass}
              value={mission.slug}
              onChange={(event) => setMission({ ...mission, slug: event.target.value })}
            />
          </label>
          <label className="block text-sm font-medium sm:col-span-2">
            {t(d.descriptionLabel)}
            <textarea
              className={inputClass}
              rows={3}
              value={mission.description}
              onChange={(event) =>
                setMission({ ...mission, description: event.target.value })
              }
            />
          </label>
          <label className="block text-sm font-medium">
            {t(d.regionLabel)}
            <select
              className={inputClass}
              value={mission.region_id}
              onChange={(event) =>
                setMission({ ...mission, region_id: event.target.value })
              }
            >
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            {t(d.statusLabel)}
            <select
              className={inputClass}
              value={mission.status}
              onChange={(event) => setMission({ ...mission, status: event.target.value })}
            >
              <option value="draft">{t(d.statusDraft)}</option>
              <option value="review">{t(d.statusReview)}</option>
              <option value="published">{t(d.statusPublished)}</option>
              <option value="archived">{t(d.statusArchived)}</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            {t(d.difficultyLabel)}
            <select
              className={inputClass}
              value={mission.difficulty}
              onChange={(event) =>
                setMission({ ...mission, difficulty: event.target.value })
              }
            >
              <option value="beginner">{t(d.difficultyBeginner)}</option>
              <option value="intermediate">{t(d.difficultyIntermediate)}</option>
              <option value="advanced">{t(d.difficultyAdvanced)}</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            XP
            <Input
              className={inputClass}
              type="number"
              min={10}
              max={1000}
              value={mission.xp_reward}
              onChange={(event) =>
                setMission({ ...mission, xp_reward: Number(event.target.value) })
              }
            />
          </label>
          <div className="sm:col-span-2">
            <Button type="submit">
              <Save className="size-4" aria-hidden="true" />
              {t(d.saveMissionCta)}
            </Button>
          </div>
        </form>
      </Card>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold">
              {t(d.questionsHeading, { n: mission.questions.length })}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t(d.questionsNote)}
            </p>
          </div>
          <Button
            onClick={() => {
              setQuestion({ ...emptyQuestion, sortOrder: mission.questions.length + 1 });
              setShowQuestion(true);
            }}
          >
            <Plus className="size-4" aria-hidden="true" />
            {t(d.newQuestionCta)}
          </Button>
        </div>

        {showQuestion && (
          <Card className="mt-4 p-6">
            <form onSubmit={saveQuestion} className="grid gap-4">
              <label className="block text-sm font-medium">
                {t(d.questionTypeLabel)}
                <select
                  className={inputClass}
                  value={question.questionType}
                  onChange={(event) =>
                    setQuestion({ ...question, questionType: event.target.value })
                  }
                >
                  <option value="multiple_choice">{t(d.typeMultipleChoice)}</option>
                  <option value="matching">{t(d.typeMatching)}</option>
                  <option value="sequencing">{t(d.typeSequencing)}</option>
                  <option value="identification">{t(d.typeIdentification)}</option>
                </select>
              </label>
              <label className="block text-sm font-medium">
                {t(d.promptLabel)}
                <textarea
                  className={inputClass}
                  rows={2}
                  required
                  value={question.prompt}
                  onChange={(event) =>
                    setQuestion({ ...question, prompt: event.target.value })
                  }
                />
              </label>
              <label className="block text-sm font-medium">
                {question.questionType === "matching"
                  ? t(d.optionsMatching)
                  : question.questionType === "sequencing"
                    ? t(d.optionsSequencing)
                    : question.questionType === "identification"
                      ? t(d.optionsIdentification)
                      : t(d.optionsChoices)}
                <textarea
                  className={inputClass}
                  rows={4}
                  required
                  value={question.optionsText}
                  onChange={(event) =>
                    setQuestion({ ...question, optionsText: event.target.value })
                  }
                />
              </label>
              <label className="block text-sm font-medium">
                {question.questionType === "sequencing"
                  ? t(d.correctSequencing)
                  : question.questionType === "matching"
                    ? t(d.correctMatching)
                    : t(d.correctDefault)}
                <textarea
                  className={inputClass}
                  rows={question.questionType === "sequencing" || question.questionType === "matching" ? 4 : 1}
                  required
                  value={question.correctText}
                  onChange={(event) =>
                    setQuestion({ ...question, correctText: event.target.value })
                  }
                />
              </label>
              <label className="block text-sm font-medium">
                {t(d.explanationLabel)}
                <textarea
                  className={inputClass}
                  rows={2}
                  value={question.explanation}
                  onChange={(event) =>
                    setQuestion({ ...question, explanation: event.target.value })
                  }
                />
              </label>
              <label className="block max-w-[160px] text-sm font-medium">
                {t(d.orderLabel)}
                <Input
                  className={inputClass}
                  type="number"
                  min={0}
                  value={question.sortOrder}
                  onChange={(event) =>
                    setQuestion({ ...question, sortOrder: Number(event.target.value) })
                  }
                />
              </label>
              <div className="flex gap-3">
                <Button type="submit">{t(d.saveQuestionCta)}</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowQuestion(false);
                    setQuestion({ ...emptyQuestion });
                  }}
                >
                  {t(commonDict.cancel)}
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="mt-4 space-y-3">
          {mission.questions.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              {t(d.emptyQuestions)}
            </p>
          ) : (
            mission.questions.map((item, index) => (
              <Card key={item.id} className="flex flex-wrap items-start gap-3 p-4">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.prompt}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.question_type} · {t(d.orderSuffix, { n: item.sort_order })}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setQuestion(questionToForm(item));
                    setShowQuestion(true);
                  }}
                >
                  {t(d.editCta)}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteQuestion(item.id)}
                  aria-label={t(d.deleteQuestionAria)}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
