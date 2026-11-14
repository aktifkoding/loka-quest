-- LokaQuest — ekspansi fitur edukasi (14 Nov 2026)
-- Pemetaan materi misi ke Capaian Pembelajaran (CP) Kurikulum Merdeka:
-- teks bebas berisi elemen CP + fase (contoh: "Fase C — Seni Budaya:
-- mendeskripsikan keragaman seni dan budaya Nusantara").

alter table public.missions
  add column if not exists curriculum_ref text;
