"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export type MissionStatus = "draft" | "review" | "published" | "archived";

export type MissionMetaState = {
  title: string;
  slug: string;
  region_id: string;
  description: string;
  objectives: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  xp_reward: number;
  sort_order: number;
  status: MissionStatus;
};

export type RegionOption = { id: string; name: string };

export const emptyMeta = (defaultSort: number): MissionMetaState => ({
  title: "",
  slug: "",
  region_id: "",
  description: "",
  objectives: "",
  difficulty: "beginner",
  xp_reward: 100,
  sort_order: defaultSort,
  status: "draft",
});

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function toMetaPayload(state: MissionMetaState) {
  return {
    title: state.title,
    slug: state.slug,
    region_id: state.region_id,
    description: state.description,
    learning_objectives: state.objectives
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    difficulty: state.difficulty,
    xp_reward: Number(state.xp_reward) || 0,
    sort_order: Number(state.sort_order) || 0,
    status: state.status,
  };
}

const textAreaClass =
  "mt-1 flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

export function MissionMetaFields({
  state,
  onChange,
  regions,
  slugLocked,
}: {
  state: MissionMetaState;
  onChange: (next: MissionMetaState) => void;
  regions: RegionOption[];
  slugLocked?: boolean;
}) {
  const set = <K extends keyof MissionMetaState>(key: K, value: MissionMetaState[K]) =>
    onChange({ ...state, [key]: value });

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="md:col-span-2">
        <Label htmlFor="mission-title">Judul misi</Label>
        <Input
          id="mission-title"
          className="mt-1"
          value={state.title}
          onChange={(e) => {
            const title = e.target.value;
            onChange({
              ...state,
              title,
              slug: slugLocked ? state.slug : slugify(title),
            });
          }}
          placeholder="Contoh: Petualangan Batik Detective"
          required
        />
      </div>

      <div>
        <Label htmlFor="mission-slug">Slug (URL)</Label>
        <Input
          id="mission-slug"
          className="mt-1"
          value={state.slug}
          onChange={(e) => set("slug", slugify(e.target.value))}
          placeholder="petualangan-batik-detective"
          required
        />
      </div>

      <div>
        <Label htmlFor="mission-region">Wilayah budaya</Label>
        <select
          id="mission-region"
          value={state.region_id}
          onChange={(e) => set("region_id", e.target.value)}
          required
          className="mt-1 flex h-9 w-full rounded-md border border-input bg-card px-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <option value="" disabled>
            Pilih wilayah
          </option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-2">
        <Label htmlFor="mission-description">Deskripsi</Label>
        <textarea
          id="mission-description"
          className={textAreaClass}
          value={state.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Cerita singkat misi dan apa yang akan dipelajari pemain..."
          required
        />
      </div>

      <div className="md:col-span-2">
        <Label htmlFor="mission-objectives">Tujuan pembelajaran (satu per baris)</Label>
        <textarea
          id="mission-objectives"
          className={textAreaClass}
          value={state.objectives}
          onChange={(e) => set("objectives", e.target.value)}
          placeholder={"Mengenal motif batik klasik\nMemahami filosofi motif"}
        />
      </div>

      <div>
        <Label htmlFor="mission-difficulty">Tingkat kesulitan</Label>
        <select
          id="mission-difficulty"
          value={state.difficulty}
          onChange={(e) =>
            set("difficulty", e.target.value as MissionMetaState["difficulty"])
          }
          className="mt-1 flex h-9 w-full rounded-md border border-input bg-card px-2 text-sm capitalize outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <option value="beginner">Pemula</option>
          <option value="intermediate">Menengah</option>
          <option value="advanced">Lanjut</option>
        </select>
      </div>

      <div>
        <Label htmlFor="mission-status">Status</Label>
        <select
          id="mission-status"
          value={state.status}
          onChange={(e) => set("status", e.target.value as MissionStatus)}
          className="mt-1 flex h-9 w-full rounded-md border border-input bg-card px-2 text-sm capitalize outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <option value="draft">Draf</option>
          <option value="review">Review</option>
          <option value="published">Terbit</option>
          <option value="archived">Arsip</option>
        </select>
      </div>

      <div>
        <Label htmlFor="mission-xp">XP reward</Label>
        <Input
          id="mission-xp"
          className="mt-1"
          type="number"
          min={0}
          max={10000}
          value={state.xp_reward}
          onChange={(e) => set("xp_reward", Number(e.target.value))}
        />
      </div>

      <div>
        <Label htmlFor="mission-sort">Urutan tampil</Label>
        <Input
          id="mission-sort"
          className="mt-1"
          type="number"
          min={0}
          max={9999}
          value={state.sort_order}
          onChange={(e) => set("sort_order", Number(e.target.value))}
        />
      </div>
    </div>
  );
}
