# Kontrak API — /api/v1

Semua respons memakai format seragam:

```jsonc
// sukses
{ "success": true, "data": <payload>, "pagination"?: {...} }
// gagal
{ "success": false, "error": "<pesan aman>", "details"?: {...} }
```

Kode status: 200/201 sukses · 400 validasi · 401 tanpa sesi · 403 tanpa izin ·
404 tidak ada · 409 konflik status · 422 data belum lengkap · 429 rate limit ·
500 kesalahan server (detail tidak dibocorkan).

Semua body divalidasi Zod. Endpoint yang rawan penyalahgunaan memakai rate
limiter Postgres (`check_rate_limit`) dan mengembalikan header `Retry-After`.

---

## Publik

| Method | Path | Catatan |
|---|---|---|
| GET | `/regions` | Wilayah `published`; `?page&limit` atau `?slug=` |
| GET | `/missions` | Misi `published`; `?region=<slug>`, paginasi |
| GET | `/missions/:id` | Detail misi (UUID atau slug) |
| GET | `/missions/:id/questions` | Soal tanpa `correct_answer` |
| GET | `/assessments` | Daftar asesmen; kunci jawaban dibuang server |
| GET | `/encyclopedia/articles` | Artikel terbit; `?q&category&region&featured` |
| GET | `/encyclopedia/articles/:slug` | Detail artikel + sumber + media |
| GET | `/encyclopedia/search` | Pencarian full-text (`?q`) |
| GET | `/encyclopedia/categories` | Kategori terbit |
| GET | `/encyclopedia/regions` | Wilayah yang punya artikel terbit |
| GET | `/knowledge/graph` | Graf hubungan; `?seed=<type>:<uuid>&relation=` |
| GET | `/community/submissions` | **Hanya** kontribusi `published`, tanpa email |
| GET | `/daily` | Tantangan hari ini; streak bila ada sesi |

## Terlindungi (sesi pemain)

| Method | Path | Catatan |
|---|---|---|
| GET/PATCH | `/profile` | PATCH hanya `full_name` (dikunci juga di level kolom DB) |
| GET | `/progress` | XP, misi selesai, level |
| GET | `/achievements` | Badge diraih + katalog |
| GET | `/assessments/responses` | Riwayat skor asesmen sendiri |
| POST | `/attempts` | Skor server-side; XP hanya untuk perbaikan skor; bonus harian |
| POST | `/assessments` | Skor server-side |
| GET/POST | `/encyclopedia/bookmarks` | Bookmark sendiri |
| DELETE | `/encyclopedia/bookmarks/:id` | Hapus bookmark |
| GET/POST/DELETE | `/encyclopedia/collections` | Riwayat baca privat |
| POST | `/encyclopedia/feedback` | Koreksi/komentar pembaca (masuk audit log) |
| POST | `/community/submissions` | Kiriman komunitas, status `pending` |
| POST | `/ai/ask` | RAG dari konten terverifikasi; LLM opsional |
| GET | `/review` | Antrean spaced repetition yang jatuh tempo |
| POST | `/review` | Jawab satu kartu review |
| POST | `/auth/demo` | Sesi demo (rate limit per IP) |
| POST | `/groups/join` | Gabung kelompok dengan kode |
| GET | `/educator/assignments` | Tugas untuk kelompok tempat pemain bergabung |
| POST | `/analytics` | Event analitik (hanya setelah consent) |

## Edukator / admin

| Method | Path | Catatan |
|---|---|---|
| GET/POST | `/admin/regions` | Daftar semua wilayah / buat wilayah |
| PATCH | `/admin/regions/:id` | Ubah wilayah + status editorial |
| GET/POST | `/admin/missions` | Daftar misi + jumlah soal / buat misi |
| GET/PATCH/DELETE | `/admin/missions/:id` | Detail, ubah, arsipkan |
| POST | `/admin/missions/:id/questions` | Tambah soal |
| PATCH/DELETE | `/admin/missions/:id/questions/:questionId` | Ubah/hapus soal |
| GET | `/admin/users` | Semua profil (tanpa kredensial) |
| PATCH | `/admin/users/:userId` | Ubah peran (tidak bisa akun sendiri, diaudit) |
| PATCH | `/admin/submissions/:id` | Verifikasi/tolak kontribusi + kirim email |
| GET | `/admin/encyclopedia/articles` | Daftar artikel CMS |
| POST | `/admin/encyclopedia/articles` | Buat draf/review (tidak bisa langsung terbit) |
| GET/PATCH/DELETE | `/admin/encyclopedia/articles/:id` | Detail/ubah/arsipkan |
| POST | `/admin/encyclopedia/articles/:id/review` | Keputusan reviewer |
| POST | `/admin/encyclopedia/articles/:id/publish` | Terbitkan (wajib minimal 1 sumber) |
| POST | `/admin/encyclopedia/articles/:id/sources` | Tambah referensi |
| GET/POST | `/admin/encyclopedia/roles` | Daftar / tetapkan peran editorial |
| DELETE | `/admin/encyclopedia/roles/:profileId` | Cabut peran editorial |
| GET/POST | `/educator/groups` | Daftar / buat kelompok + kode join |
| GET | `/educator/groups/:id` | Detail kelompok + anggota |
| GET/POST | `/educator/groups/:id/assignments` | Daftar / beri tugas misi |
| POST | `/quiz` | Buat sesi kuis live |
| POST | `/quiz/join` | Gabung sesi dengan kode |
| GET | `/quiz/:code` | State sesi + soal aktif + papan skor |
| POST | `/quiz/:code/answer` | Kirim jawaban peserta |
| POST | `/quiz/:code/control` | `start` / `next` / `finish` (host) |

## Catatan keamanan

- Otorisasi dicek **sebelum** validasi body (auth → validasi → DB).
- Kunci jawaban (`mission_questions.correct_answer`, `learning_assessments.questions`)
  tidak dapat dibaca role `anon`/`authenticated`; route memakai service role.
- Penulisan state game (attempt, XP, achievement, artefak, respons asesmen)
  hanya lewat server; role klien tidak punya hak INSERT/UPDATE.
- `profiles` hanya mengizinkan update `full_name` di level kolom.
- `community_submissions`, `ai_qa_logs`, dan `cultural_relationships` memakai RLS.
- Paginasi `limit` maksimal 100; array jawaban dibatasi 50 (misi) / 100 (asesmen).
- Error DB hanya dicatat di server; klien menerima pesan generik.
