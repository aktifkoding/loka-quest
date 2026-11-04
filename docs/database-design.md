# Desain Database — Supabase PostgreSQL

## Diagram Relasi (ringkas)

```
auth.users ─1:1─ profiles ─1:n─ mission_attempts ─1:n─ mission_answers
                   │  │                  └──n:1── missions ─1:n─ mission_questions
                   │  │                            missions ─n:1── cultural_regions
                   │  ├─1:1─ player_progress       cultural_regions ─1:n─ cultural_contents
                   │  ├─1:n─ user_achievements ──n:1── achievements
                   │  └─1:n─ user_artifacts ──n:1── cultural_artifacts ──n:1── cultural_regions
                   ├─1:n─ assessment_responses ──n:1── learning_assessments
                   └─1:n─ educator_groups (sebagai edukator) ─1:n─ educator_group_members

audit_logs: log aktivitas administratif (actor_id opsional)
```

## Tabel Utama

| Tabel | Fungsi | Constraint penting |
|---|---|---|
| `profiles` | Profil pengguna, role, XP, level | PK = `auth.users.id` (cascade) |
| `cultural_regions` | Wilayah budaya | `slug` unique; status draft→review→published→archived |
| `cultural_contents` | Konten per wilayah | FK region (cascade); FK source (set null) |
| `cultural_sources` | Register sumber/atribusi | Wajib untuk konten yang dipublikasikan |
| `missions` | Misi per wilayah | `slug` unique; `xp_reward` |
| `mission_questions` | Soal + kunci jawaban | Tipe: mc/sequencing/matching/identification |
| `mission_attempts` | Percobaan misi per pemain | skor & XP dihitung server |
| `mission_answers` | Jawaban per soal | FK attempt (cascade) |
| `player_progress` | Agregat XP/level | `profile_id` unique |
| `achievements` / `user_achievements` | Badge | unique(profile, achievement) — anti duplikat reward |
| `cultural_artifacts` / `user_artifacts` | Koleksi artefak | unique(profile, artifact) |
| `learning_assessments` / `assessment_responses` | Pre/post-test | soal+kunci sebagai JSONB server-only |
| `educator_groups` / `educator_group_members` | Kelompok siswa per edukator | unique(group, member) |
| `audit_logs` | Jejak operasi sensitif | actor, action, resource, details JSONB |

## Row Level Security

Semua tabel mengaktifkan RLS (migrasi awal, lalu diperketat oleh
`20261104000000_security_hardening.sql` dan `20261104000001_feature_expansion.sql`):

- **profiles**: baca/update sendiri; admin baca semua.
- **Konten publik** (regions/contents/missions/questions/sources/artifacts/achievements):
  baca hanya `status = 'published'`; kelola hanya admin/educator.
- **mission_attempts / mission_answers**: hanya pemilik (`auth.uid() = profile_id`).
- **player_progress / user_achievements / user_artifacts / assessment_responses**:
  hanya pemilik.
- **educator_groups / educator_assignments**: edukator hanya kelompoknya sendiri; anggota hanya melihat kelompok dan tugasnya.
- **community_submissions**: publik hanya yang `published`; pemilik melihat kirimannya; admin/edukator meninjau.
- **ai_qa_logs / rate_limits / analytics_events**: hanya admin atau service role.
- **player_streaks / review_items / daily_challenge_completions**: hanya pemilik.
- **quiz_sessions / quiz_participants / quiz_answers**: host dan peserta terautentikasi.
- **audit_logs**: hanya admin yang bisa baca.

Kunci jawaban (`mission_questions.correct_answer`, `learning_assessments.questions`)
dan state game tidak lagi dapat dibaca/ditulis klien setelah migrasi hardening:
kolom sensitif dicabut lewat column grants dan semua penulisan state memakai
service role di route server (lihat `docs/api-contracts.md`).

## Trigger & Function

- `handle_new_user()` — trigger `auth.users` INSERT → buat `profiles` (role `player`).
- `update_updated_at()` — perbarui kolom `updated_at` otomatis di tabel utama.
- `apply_xp(profile, xp, first_completion)` — update XP/level/misi secara atomik.
- `touch_streak(profile)` — hitung streak harian.
- `check_rate_limit(key, limit, window)` — rate limit durable lintas instance.
- `is_group_member(group)` / `is_quiz_participant(session)` / `is_quiz_host(session)` — helper RLS tanpa rekursi.

## Idempotensi & Integritas

- Seed idempoten (`on conflict do nothing` / `on conflict (slug) do nothing`).
- `user_achievements`, `user_artifacts`, `educator_group_members` punya
  unique constraint → reward tidak bisa digandakan.
- Attempt tanpa jawaban dibatalkan (rollback manual di `attempts/route.ts`).
- Index di semua kolom FK dan filter yang sering dipakai (status, profile_id).
