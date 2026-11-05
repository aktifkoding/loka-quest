# 📖 Panduan Lengkap Aplikasi LokaQuest

> **LokaQuest — Jelajahi Nusantara, Hidupkan Warisan Budaya**
> URL produksi: https://www.lokaquest.web.id/
> Platform pembelajaran budaya Indonesia yang menggabungkan game edukatif (Phaser), ensiklopedia berbasis editorial, modul bahasa daerah, kelas virtual untuk guru, dan asisten AI berbasis RAG.

---

## Daftar Isi

1. [Ringkasan Cara Kerja Aplikasi](#1-ringkasan-cara-kerja-aplikasi)
2. [Akun Demo untuk Testing](#2-akun-demo-untuk-testing)
3. [Panduan Pengguna (Player)](#3-panduan-pengguna-player)
4. [Panduan Edukator (Guru)](#4-panduan-edukator-guru)
5. [Panduan Editor Ensiklopedia](#5-panduan-editor-ensiklopedia)
6. [Panduan Admin Sistem](#6-panduan-admin-sistem)
7. [Arsitektur & Cara Kerja Teknis](#7-arsitektur--cara-kerja-teknis)
8. [Peta Halaman & Endpoint API](#8-peta-halaman--endpoint-api)
9. [Deployment & Konfigurasi](#9-deployment--konfigurasi)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Ringkasan Cara Kerja Aplikasi

LokaQuest adalah platform belajar budaya dengan alur **"Jelajah → Main Misi → Kumpulkan → Tinjau Ulang"**:

```
┌─────────────────────────────────────────────────────────────────────┐
│  PENGUNJUNG BARU                                                    │
│  Landing (/) ──► Jelajahi Peta (/explore) ──► Detail Wilayah        │
│       │                                                             │
│       ▼                                                             │
│  DAFTAR/MASUK (/auth/register, /auth/login, atau tombol "Coba Demo")│
└──────────────┬──────────────────────────────────────────────────────┘
               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PLAYER (Dasbor /player/dashboard)                                  │
│  • Misi game Phaser (/missions) → jawaban dikoreksi SERVER → XP     │
│  • Tantangan harian + streak (bonus +25 XP/hari)                    │
│  • Review spaced repetition (/player/review)                        │
│  • Koleksi artefak (/player/collection) + achievement               │
│  • Assessment pre/post (/player/assessments)                        │
│  • Rekomendasi personal (dasbor) & jalur belajar adaptif            │
└──────────────┬──────────────────────────────────────────────────────┘
               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PENDALAMAN                                                         │
│  • Ensiklopedia (/encyclopedia) — 18 artikel terverifikasi + sumber │
│  • Modul bahasa daerah (/bahasa) — kuis kosakata (+15 XP/jawaban)   │
│  • Grafik budaya (/jelajahi) — relasi antarwarisan                  │
│  • Asisten AI (/asisten) — jawaban bersitasi                        │
│  • Papan peringkat (/leaderboard) & Komunitas (/komunitas)          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  EDUCATOR (/educator) — kelas, kode join, tugas misi, kuis live     │
│  ADMIN (/admin) — CRUD konten, peran, moderasi, audit, analitik     │
│  EDITOR (/editor) — alur draf → review → terbit ensiklopedia        │
└─────────────────────────────────────────────────────────────────────┘
```

**Prinsip inti (gameplay):**
- Semua jawaban **dikoreksi di server** (`POST /api/v1/attempts`) — kunci jawaban tidak pernah dikirim ke browser (aman dari kecurangan).
- XP hanya dibayar dari **kenaikan skor terbaik** — main ulang untuk memperbaiki nilai tetap berimbal hasil, tanpa farming.
- Level = setiap **500 XP**. Artefak diberikan pada **penyelesaian pertama** misi.
- Soal yang dijawab salah otomatis masuk antrean **review spaced repetition** (algoritma SM-2 sederhana: interval makin panjang kalau benar, reset kalau salah).

---

## 2. Akun Demo untuk Testing

> ⚠️ Akun di bawah ini dibuat oleh `scripts/seed-content.mjs` (jalankan: `npm run db:seed:content`).
> Untuk lingkungan produksi yang serius, segera ganti password atau nonaktifkan akun demo via `/admin/users`.

| Peran | Email | Password | Akses |
|---|---|---|---|
| **Admin sistem** | `admin@lokaquest.web.id` | `LokaQuest2026!` | Semua: `/admin/*`, `/editor/*`, `/educator/*`, `/player/*` |
| **Edukator (guru)** | `guru@lokaquest.web.id` | `LokaQuest2026!` | `/educator/*`, `/player/*`, moderasi `/admin/submissions` |
| **Siswa (player)** | `siswa@lokaquest.web.id` | `Siswa2026!` | `/player/*` — sudah tergabung di kelas demo |
| **Pemain lain (isi leaderboard)** | `rara.wijaya@`, `bima.pratama@`, `sari.dewi@` | (tidak untuk login) | Data papan peringkat |

**Tambahan untuk demo:**
- Kode join kelas demo: **`LQ8B2026`** (Kelas 8B — SMP Nusantara, guru: Bu Sari)
- Akun "throwaway" satu ketuk: tombol **"Coba Demo"** di `/auth/login` (membuat `demo-xxxx@lokaquest.dev`)
- 3 kiriman komunitas demo di `/admin/submissions` — 2 sudah terbit, 1 `pending` (siap dimoderasi saat demo)
- Kuis live: guru membuat sesi di `/educator/quiz` → dapat kode 6 karakter → siswa buka `/kuis/[kode]`

**Matriks hak akses:**

| Fitur | Pengunjung | Player | Educator | Admin |
|---|---|---|---|---|
| Lihat misi/ensiklopedia/peta/graph | ✅ | ✅ | ✅ | ✅ |
| Main misi, XP, achievement, artefak | — (perlu login) | ✅ | ✅ | ✅ |
| Bookmark/riwayat baca ensiklopedia | — | ✅ | ✅ | ✅ |
| Gabung kelas dengan kode | — | ✅ | ✅ | ✅ |
| Buat kelas/tugas/kuis live | — | — | ✅ | ✅ |
| Moderasi komunitas | — | — | ✅ | ✅ |
| CRUD wilayah/misi/konten/pengguna | — | — | — | ✅ |
| Terbitkan artikel ensiklopedia | — | — | — | ✅ (atau peran editorial `content_administrator`) |

---

## 3. Panduan Pengguna (Player)

### 3.1 Masuk Pertama Kali
1. Buka https://www.lokaquest.web.id/ → klik **"Masuk/Daftar"**.
2. Pilih: **Daftar** (email + password ≥8 karakter, huruf besar/kecil + angka, verifikasi via email) atau **"Coba Demo"** untuk langsung main tanpa daftar.
3. Setelah masuk, Anda diarahkan ke **Dasbor** (`/player/dashboard`).

### 3.2 Dasbor (`/player/dashboard`)
Menampilkan: total XP, level + progress ke level berikutnya (500 XP/level), misi selesai, lencana/achievement, 5 percobaan terakhir, **delta nilai pretest vs posttest**, kartu **Tantangan Harian** (misi hari ini + streak "X hari"), dan **Rekomendasi Personal Untukmu** (kartu langkah belajar pilihan).

### 3.3 Main Misi (`/missions`)
1. Buka **Misi** di navbar → pilih misi. Kartu berlabel **Pemula/Menengah/Lanjutan**; badge **"Rekomendasi kesulitan"** muncul dari jalur belajar adaptif.
2. Di halaman misi ada **Panduan Media** (video/audio budaya terkait) sebelum mulai.
3. Klik mulai → game **Phaser** berjalan. Suara gamelan sintetis (WebAudio) bisa di-mute (tersimpan di `localStorage`).
4. Jawab semua soal (pilihan, teks, menjodohkan, mengurutkan) → jawaban dikirim sekaligus ke server → skor & XP muncul dengan konfeti.
5. Kalah? Ulangi — XP akan bertambah hanya sebesar kenaikan skor terbaik.

### 3.4 Tantangan Harian & Streak
- Kartu di dasbor menampilkan misi deterministik per hari (rota otomatis dari daftar misi).
- Selesaikan hari itu → **+25 XP bonus**. Bolong sehari → streak reset; rekor terpanjang tetap dicatat.

### 3.5 Review Spaced Repetition (`/player/review`)
- Soal yang salah saat misi otomatis masuk antrean. Halaman menampilkan soal jatuh tempo (maks 20) + **Jalur Belajar Adaptif** (tahap: Fondasi → Eksplorasi → Maestro).
- Jawab satu per satu: benar → interval tinjau berikutnya makin panjang; salah → reset ke 1 hari.

### 3.6 Koleksi & Achievement
- **Koleksi artefak** (`/player/collection`): artefak di dapat pada penyelesaian pertama misi, dengan rarity Umum/Tak Biasa/Langka/Legendaris.
- **Achievement** otomatis: misi pertama, misi sempurna (skor 100), total misi 3/6/12, dan misi spesifik (Saman, Pinisi, Subak, dll.). Bonus XP ikut ditambahkan.

### 3.7 Assessment Pre/Post (`/player/assessments`)
Kerjakan **Pretest** sebelum belajar dan **Posttest** setelahnya — dasbor menampilkan delta kenaikan pemahaman sebagai bukti pembelajaran.

### 3.8 Ensiklopedia (`/encyclopedia`)
- **Explore**: grid semua artikel terbit; filter kategori/wilayah; pencarian full-text (`/encyclopedia/search`).
- **Artikel**: 8 bagian terstruktur (latar belakang, konteks historis, makna budaya, karakteristik, fungsi sosial, praktik, pelestarian) + **fakta terverifikasi** + **daftar sumber** (UNESCO dsb.) + galeri media (audio/video) + kosakata bahasa terkait + artikel & misi terkait.
- **Simpan** (bookmark) → baca lagi di `/encyclopedia/favorites`; riwayat baca otomatis tercatat di `/encyclopedia/collections`.
- Temukan koreksi? Gunakan **"Kirim koreksi atau masukan"** di bawah artikel (tanpa login).

### 3.9 Modul Bahasa Daerah (`/bahasa`)
- Pelajari kosakata per kategori (sapaan, sehari-hari, ungkapan, budaya, alam, bilangan) dengan tombol **pelafalan** (audio → fallback suara browser).
- Kuis kosakata dikoreksi server: **+15 XP per jawaban benar**.

### 3.10 Grafik Budaya (`/jelajahi`)
Visualisasi node–edge hubungan antarwarisan (berawal dari, mempengaruhi, bagian dari, dst.) — cara melihat Nusantara sebagai jaringan, bukan pulau terpisah.

### 3.11 Asisten AI (`/asisten`)
- Tulis pertanyaan budaya (mis. "Apa filosofi motif Parang Rusak?") → jawaban **selalu disertai sitasi** ke konten terverifikasi + disclaimer untuk cek sumber asli.
- Bekerja dengan retrieval berbasis kata kunci; jika LLM dikonfigurasi (`ZAI_API_KEY`), jawaban dirangkai model; jika tidak, mode extractive (kutipan langsung).

### 3.12 Komunitas & Leaderboard
- **/komunitas**: kirim artikel budaya (masuk antrean moderasi); galeri hanya menampilkan yang sudah disetujui.
- **/leaderboard**: 20 XP tertinggi — hanya nama tampilan + level + XP, tanpa email. Bisa dibagikan via tombol share.

---

## 4. Panduan Edukator (Guru)

Login sebagai `guru@lokaquest.web.id` → navbar menampilkan area **Edukator**.

### 4.1 Membuat Kelas
1. `/educator/groups` → **Buat kelas** → sistem membuat **kode join 6 karakter**.
2. Bagikan kode ke siswa; siswa membuka `/player/classes` dan memasukkan kode.
3. Pantau anggota (nama, level, XP) langsung di halaman kelas.

### 4.2 Menugaskan Misi
1. Di halaman kelas → **Tugaskan misi** → pilih misi + tenggat (opsional).
2. Siswa melihat tugas di `/player/classes` lengkap dengan **nilai terbaik** mereka.
3. Ganti tenggat atau hapus tugas kapan saja.

### 4.3 Kuis Live
1. `/educator/quiz` → pilih misi → buat sesi → dapat **kode sesi 6 karakter**.
2. Siswa membuka `/kuis/[kode]` dan bergabung (nama tampilan otomatis).
3. Host panel (`/educator/quiz/[kode]`): **Play → Selanjutnya → Akhiri**; papan skor siswa ter-update live (polling).
4. Siswa menjawab per soal aktif; koreksi di server; satu jawaban per soal.

### 4.4 Analitik Kelas
`/educator/analytics` — rata-rata skor & partisipasi misi untuk kelas milik Anda (kepemilikan diverifikasi server).

### 4.5 Moderasi Komunitas
`/admin/submissions` (akses educator & admin) — setujui/tolak kiriman artikel komunitas; hanya yang disetujui tampil di galeri publik.

---

## 5. Panduan Editor Ensiklopedia

Akses untuk pemegang peran di `encyclopedia_editor_roles` (atau akun `admin` yang otomatis berperan *content administrator*).

### Alur Editorial: Draf → Review → Terbit
1. **Buat**: `/editor/encyclopedia/articles/new` — judul, slug, ringkasan, isi, 7 bagian konten, SEO, kategori, wilayah, **sumber wajib**, status `draft` / kirim untuk review. *(API melarang artikel baru langsung `published`.)*
2. **Review**: pemegang peran reviewer+ menekan **Tinjau** → keputusan: *changes_requested* (kembali ke draf), *approved*, *rejected*. Semua tercatat di `encyclopedia_reviews` + audit log.
3. **Terbitkan**: hanya *content administrator*, dan **hanya artikel berstatus approved yang punya ≥1 sumber**. Setelah terbit: penulis menerima email notifikasi (jika Resend terkonfigurasi) dan artikel muncul di `/encyclopedia/explore` + sitemap.
4. **Peran editorial**: `/editor/encyclopedia/roles` (khusus content administrator) — tambah/hapus peran: Administrator konten, Editor budaya, Reviewer, Kontributor.

---

## 6. Panduan Admin Sistem

Login sebagai `admin@lokaquest.web.id` → `/admin` adalah pusat navigasi.

| Halaman | Fungsi |
|---|---|
| `/admin/regions` | CRUD wilayah budaya (12 wilayah terpasang) |
| `/admin/missions` | CRUD misi + kelola soal (4 tipe soal, kunci jawaban, XP) |
| `/admin/contents` | Kelola konten budaya & daftar sumber/lisensi |
| `/admin/users` | Lihat semua pengguna, ubah peran player/educator/admin (tidak bisa ubah peran sendiri; semua perubahan tercatat di audit log) |
| `/admin/submissions` | Moderasi kontribusi komunitas |
| `/admin/audit-logs` | Jejak audit: perubahan peran, aksi editorial, umpan balik artikel |
| `/admin/analytics` | Statistik agregat: pengguna, percobaan misi, wilayah, konten |

---

## 7. Arsitektur & Cara Kerja Teknis

```
Browser ── Next.js 15 App Router (Vercel) ── Supabase (Postgres + Auth + RLS)
              │                                  ▲
              ├─ src/app/(public)   halaman publik
              ├─ src/app/player     area pemain (guard role)
              ├─ src/app/educator   area guru (guard role)
              ├─ src/app/admin      area admin (guard role)
              ├─ src/app/editor     editorial ensiklopedia (guard peran)
              ├─ src/app/api/v1/*   route handlers (semua logika sensitif)
              ├─ src/components/game/phaser-game.tsx  mini-game misi
              └─ src/lib/*          scoring, adaptive, daily, recommendations,
                                    llm (RAG), encyclopedia, auth/session
```

- **Auth**: Supabase Auth (email+password). Trigger `handle_new_user()` otomatis membuat baris `profiles`. Peran (`player|educator|admin`) hanya bisa diubah lewat service role/admin.
- **Keamanan**:
  - RLS ketat + kolom sensitif dikunci: kunci jawaban (`mission_questions.correct_answer`, `learning_assessments.questions`) **tidak di-GRANT SELECT** ke client.
  - RPC `apply_xp`, `touch_streak`, `check_rate_limit` hanya untuk `service_role`.
  - Rate limit durabel (tabel `rate_limits`): attempts 30/menit, demo 10/jam, AI 10/menit, komunitas 5/menit.
  - Security headers (HSTS, X-Frame-Options DENY, nosniff), audit log untuk aksi penting.
- **Scoring**: `src/lib/scoring.ts` membandingkan jawaban ternormalisasi; skor = benar/total×100; XP = skor% × xp_reward (hanya kenaikan skor terbaik); level = `floor(xp/500)+1`.
- **Adaptive** (`src/lib/adaptive.ts`): dari 10 percobaan terakhir + antrean review → rekomendasi kesulitan & tahap belajar.
- **Asisten AI** (`src/lib/llm.ts` + `/api/v1/ai/ask`): keyword retrieval atas konten published → LLM (opsional, OpenAI-compatible) atau fallback extractive → jawaban + sitasi; setiap tanya-jawab dicatat di `ai_qa_logs`.
- **Deployment**: Vercel (region iad1, fungsi API maxDuration 30s) + Supabase. PWA manifest, sitemap dinamis, OG image dinamis per misi/wilayah, dark mode, i18n ID/EN.

---

## 8. Peta Halaman & Endpoint API

**Halaman penting:** `/` landing · `/explore` peta · `/regions/[slug]` wilayah · `/missions` daftar misi · `/missions/[slug]` main misi · `/jelajahi` grafik budaya · `/encyclopedia` (+ `/explore`, `/search`, `/categories`, `/regions`, `/favorites`, `/collections`, `/[slug]`) · `/bahasa` (+ `/[slug]`) · `/asisten` · `/komunitas` · `/leaderboard` · `/kuis/[code]` · `/player/dashboard|review|collection|classes|assessments|profile` · `/educator/dashboard|groups|quiz|analytics` · `/editor/encyclopedia` · `/admin/*` · `/auth/login|register|forgot-password|update-password` · `/tentang` · `/sumber`

**Endpoint utama `/api/v1`:**

| Grup | Endpoint |
|---|---|
| Gameplay | `POST /attempts` (koreksi + XP + achievement + artefak) · `GET /missions`, `/missions/[id]/questions` · `GET/POST /review` · `GET /daily` · `GET /achievements` · `GET /adaptive` · `GET/POST /assessments` |
| Kuis live | `POST /quiz` · `POST /quiz/join` · `GET /quiz/[code]` · `POST /quiz/[code]/answer` · `POST /quiz/[code]/control` |
| Ensiklopedia | `GET /encyclopedia/articles`, `/articles/[slug]`, `/categories`, `/regions`, `/search` · `GET/POST/DELETE /encyclopedia/bookmarks`, `/collections` · `POST /encyclopedia/feedback` |
| Editorial | `GET/POST /admin/encyclopedia/articles` · `PATCH/DELETE /[id]` · `POST /[id]/review`, `[id]/publish`, `[id]/sources` · `GET/POST /admin/encyclopedia/roles` |
| Edukator | `GET/POST /educator/groups` · `POST /groups/join` · `GET/POST /groups/[id]/assignments` · `GET /educator/assignments` |
| Admin | CRUD `/admin/regions`, `/admin/missions`, `/admin/contents` · `GET /admin/users` · `PATCH /admin/users/[userId]` · `PATCH/DELETE /admin/submissions/[id]` |
| Lainnya | `GET/POST /community/submissions` · `POST /ai/ask` · `GET /languages`, `/languages/[slug]`, `/languages/[slug]/quiz` · `GET /regions` · `GET /knowledge/graph` · `GET/PATCH /profile` · `POST /analytics` · `POST /auth/demo` |

Format respons seragam: `{ "success": true, "data": ... }` / `{ "success": false, "error": "..." }`.

---

## 9. Deployment & Konfigurasi

**Env wajib** (Vercel → Settings → Environment Variables, dan `.env.local` untuk lokal):

| Variabel | Fungsi |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL proyek Supabase (publik) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Anon key (publik) |
| `SUPABASE_SECRET_KEY` | **Service role — WAJIB** untuk XP, kuis live, editorial, akun demo. Tanpa ini fitur interaktif gagal 500 |
| `NEXT_PUBLIC_APP_URL` | URL situs (untuk sitemap/OG) — `https://www.lokaquest.web.id` |
| Opsional | `ZAI_API_KEY`/`ZAI_API_BASE`/`ZAI_MODEL` (asisten LLM) · `RESEND_API_KEY`/`EMAIL_FROM` (email) · `ERROR_WEBHOOK_URL` |

**Menjalankan seed data lengkap (lokal maupun produksi):**

```bash
# 1. Salin .env.example → .env.local, isi:
#    NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY
# 2. Jalankan (idempoten — aman diulang):
npm run db:seed:content
#    └─ isi: 9 misi baru + 27 soal, 9 konten Jawa, 12 artefak, 5 achievement,
#       18 artikel ensiklopedia + relasi + media + sumber, graph relasi,
#       kiriman komunitas demo, akun demo (admin/guru/siswa), kelas demo
# 3. Untuk lingkungan lokal: supabase start → supabase db reset → npm run db:seed
#    lalu arahkan .env.local ke localhost:54321 dan jalankan db:seed:content
```

**Migrasi:** semua file di `supabase/migrations/` dijalankan berurutan (nama file = urutan). `supabase db push` untuk remote.

---

## 10. Troubleshooting

| Gejala | Penyebab | Solusi |
|---|---|---|
| Tombol "Coba Demo" 500 | `SUPABASE_SECRET_KEY` belum ada di env produksi | Tambahkan di Vercel → redeploy |
| XP tidak bertambah / kuis live gagal | RPC service-only tidak bisa dipanggil (env hilang) | Sama seperti di atas |
| Artikel ensiklopedia kosong | `seed-encyclopedia-articles.sql` belum dijalankan / script konten belum jalan | `npm run db:seed:content` |
| Grafik budaya kosong | Belum ada relasi di `cultural_relationships` | `npm run db:seed:content` (langkah 11) |
| Email verifikasi/terbit tidak terkirim | `RESEND_API_KEY` belum diset | Tambahkan env; verifikasi domain di Resend |
| Asisten jawaban pendek/kutipan saja | LLM tidak terkonfigurasi (mode extractive) | Set `ZAI_API_KEY` (+ `ZAI_API_BASE`, `ZAI_MODEL`) |
| Ganti password akun demo | — | `/auth/update-password` atau admin panel; untuk keamanan produksi, hapus/nonaktifkan akun demo |

---

*Dokumentasi teknis lain: [architecture.md](architecture.md) · [database-design.md](database-design.md) · [api-contracts.md](api-contracts.md) · [encyclopedia.md](encyclopedia.md) · [deployment-vercel.md](deployment-vercel.md) · [cultural-sources.md](cultural-sources.md)*
