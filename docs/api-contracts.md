# Kontrak API — /api/v1

Semua respons memakai format seragam:

```jsonc
// sukses
{ "success": true, "data": <payload>, "pagination"?: {...} }
// gagal
{ "success": false, "error": "<pesan aman>" }
```

Kode status standar: 200/201 sukses · 400 validasi · 401 tanpa sesi ·
403 tanpa izin · 404 tidak ada · 500 kesalahan server (detail tidak dibocorkan).

---

## Publik (tanpa sesi)

| Method | Path | Catatan |
|---|---|---|
| GET | `/api/v1/regions` | Wilayah `published`, paginasi `?page&limit`, atau `?slug=` |
| GET | `/api/v1/missions` | Misi `published`, paginasi; `?region=<slug>` untuk filter |
| GET | `/api/v1/missions/:id` | Detail misi (id atau `?slug=`) |
| GET | `/api/v1/missions/:id/questions` | Soal **tanpa** kunci jawaban |
| GET | `/api/v1/assessments` | Daftar assessment (pre/post) |

## Terlindungi (wajib sesi)

| Method | Path | Catatan |
|---|---|---|
| GET | `/api/v1/profile` | Profil pemain sendiri |
| PATCH | `/api/v1/profile` | Hanya `full_name`; role/XP diatur server |
| POST | `/api/v1/attempts` | Body: `{ missionId, answers[] }` (maks 50). Skor dihitung server; kembalikan nilai, XP, pembahasan per soal |
| GET | `/api/v1/progress` | XP total, misi selesai, level |
| GET | `/api/v1/achievements` | Badge diraih + semua badge |
| POST | `/api/v1/assessments` | Body: `{ assessmentId, answers[] }` (maks 100). Skor dihitung server |

## Admin (role `admin`)

| Method | Path | Catatan |
|---|---|---|
| GET | `/api/v1/admin/regions` | Semua wilayah termasuk draft |
| GET | `/api/v1/admin/users` | Semua profil (tanpa kredensial) |

## Catatan Keamanan

- Otorisasi dicek **sebelum** validasi body (urutan: auth → validasi → DB).
- `?page`/`?limit` dibatasi (limit maks 100) — paginasi wajib untuk list.
- Array jawaban dibatasi (`max`) untuk mencegah DoS memori saat validasi.
- Kesalahan DB hanya dicatat di log server; klien menerima pesan generik.
