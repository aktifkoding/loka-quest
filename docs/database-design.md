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

Semua 17 tabel mengaktifkan RLS (migrasi `20240101000001_rls_policies.sql`):

- **profiles**: baca/update sendiri; admin baca semua.
- **Konten publik** (regions/contents/missions/questions/sources/artifacts/achievements):
  baca hanya `status = 'published'`; kelola hanya admin/educator.
- **mission_attempts / mission_answers**: hanya pemilik (`auth.uid() = profile_id`).
- **player_progress / user_achievements / user_artifacts / assessment_responses**:
  hanya pemilik.
- **educator_groups**: edukator hanya kelompoknya sendiri.
- **audit_logs**: hanya admin yang bisa baca.

Kunci jawaban (`mission_questions.correct_answer`) tetap terbaca oleh klien
terautentikasi pada level RLS — perlindungan aktual ada di lapis API yang
tidak pernah memproyeksikan kolom tersebut ke browser (lihat
`docs/api-contracts.md`). Untuk penguncian penuh di level DB, bisa
ditambahkan policy `select` yang menyensor kolom via view — dicatat
sebagai penyempurnaan lanjutan.

## Trigger & Function

- `handle_new_user()` — trigger `auth.users` INSERT → buat `profiles` (role `player`).
- `update_updated_at()` — perbarui kolom `updated_at` otomatis di tabel utama.

## Idempotensi & Integritas

- Seed idempoten (`on conflict do nothing` / `on conflict (slug) do nothing`).
- `user_achievements`, `user_artifacts`, `educator_group_members` punya
  unique constraint → reward tidak bisa digandakan.
- Attempt tanpa jawaban dibatalkan (rollback manual di `attempts/route.ts`).
- Index di semua kolom FK dan filter yang sering dipakai (status, profile_id).
