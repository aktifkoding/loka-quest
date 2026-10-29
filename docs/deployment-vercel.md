# Panduan Deployment — Vercel + Supabase

Panduan lengkap untuk men-deploy LokaQuest ke produksi dengan database persisten,
tanpa VPS atau Docker.

---

## 1. Prasyarat

- Akun GitHub
- Akun Vercel (plan Hobby gratis cukup untuk demo kompetisi)
- Akun Supabase (plan Free)
- Node.js ≥ 18.17.0 di mesin lokal
- Git

---

## 2. Setup Supabase (± 15 menit)

### 2.1 Buat project

1. Buka [supabase.com](https://supabase.com) → **New project**.
2. Beri nama `lokaquest-production`, pilih region terdekat (mis. `Singapore`).
3. Simpan password database di password manager.

### 2.2 Jalankan migrasi

Buka **SQL Editor** di dashboard Supabase, lalu jalankan file-file berikut
**secara berurutan** (copy-paste seluruh isi file → Run):

1. `supabase/migrations/20240101000000_initial_schema.sql` — tabel, index, constraint.
2. `supabase/migrations/20240101000001_rls_policies.sql` — Row Level Security, trigger, function.

Verifikasi: **Table Editor** harus menampilkan 17 tabel, dan tiap tabel berlabel `RLS enabled`.

### 2.3 Isi data demo

Masih di SQL Editor, jalankan `supabase/seed.sql`.
Script ini idempoten (`on conflict do nothing`) — aman dijalankan berulang.

### 2.4 Konfigurasi Auth

**Authentication → URL Configuration:**

| Field | Nilai |
|---|---|
| Site URL | `http://localhost:3000` (ubah ke domain produksi setelah deploy) |
| Redirect URLs | `http://localhost:3000/auth/callback`, `http://localhost:3000/auth/update-password` |

Tambahkan juga URL produksi (`https://<domain-anda>/auth/callback`) setelah Vercel
memberikan domain.

**Authentication → Providers → Email:** aktif. Untuk uji cepat, matikan
"Confirm email" agar pendaftaran langsung masuk (aktifkan kembali untuk produksi).

### 2.5 Ambil kredensial

**Project Settings → API:**

| Variabel | Sifat | Dari mana |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Publik | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publik (anon key) | Publishable / anon key |
| `SUPABASE_SECRET_KEY` | **Rahasia — hanya server** | Service role / secret key |

> Kunci `SUPABASE_SECRET_KEY` melewati RLS. Jangan pernah menaruhnya di
> variabel `NEXT_PUBLIC_*` atau meng-commitnya ke Git.

---

## 3. Setup Lokal

```bash
git clone <url-repo-anda>
cd lokaquest
npm install
cp .env.example .env.local
# isi .env.local dengan nilai asli dari langkah 2.5
npm run dev
```

Buka `http://localhost:3000`. Register akun baru, mainkan misi, cek dashboard.

---

## 4. Deploy ke Vercel (± 10 menit)

### 4.1 Push ke GitHub

```bash
git add .
git commit -m "feat: LokaQuest production-ready"
git branch -M main
git remote add origin git@github.com:<username>/lokaquest.git
git push -u origin main
```

### 4.2 Import ke Vercel

1. [vercel.com/new](https://vercel.com/new) → pilih repo `lokaquest`.
2. Framework **Next.js** terdeteksi otomatis — biarkan default build command
   (`next build`) dan install command (`npm ci`).
3. Sebelum klik Deploy, buka **Environment Variables** dan tambahkan:

| Nama | Value | Environment |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | dari 2.5 | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | dari 2.5 | Production, Preview, Development |
| `SUPABASE_SECRET_KEY` | dari 2.5 | Production, Preview (tandai **Sensitive**) |
| `NEXT_PUBLIC_APP_URL` | `https://<project>.vercel.app` | Production |

4. **Deploy** — build pertama ± 2 menit.

### 4.3 Kembali ke Supabase

Tambahkan `https://<project>.vercel.app` dan `https://<project>.vercel.app/auth/callback`
ke **Redirect URLs** di Supabase Auth, dan set **Site URL** ke domain produksi.

### 4.4 Verifikasi deployment

Checklist pasca-deploy (kerjakan berurutan):

- [ ] Landing page terbuka di URL Vercel
- [ ] Register akun baru berhasil (cek email verifikasi bila diaktifkan)
- [ ] Login → diarahkan ke `/player/dashboard`
- [ ] `/explore` menampilkan 3 wilayah dari seed
- [ ] Mainkan misi Batik Detective sampai selesai → nilai muncul
- [ ] **Reload browser** → XP dan progres tetap tersimpan
- [ ] `/api/v1/profile` tanpa login → HTTP 401
- [ ] `/player/dashboard` tanpa login → redirect ke login
- [ ] `/admin` dengan akun player → redirect (403)
- [ ] Buka dari HP — layout responsif, game bisa dimainkan sentuh

### 4.5 Domain kustom (opsional)

Vercel → Project → **Settings → Domains** → tambahkan domain. Update
`NEXT_PUBLIC_APP_URL`, Supabase Site URL + Redirect URLs mengikuti domain baru.

---

## 5. Migrasi Produksi

Skema dijalankan manual via SQL Editor (langkah 2.2) — ini proses terkontrol,
bukan otomatis dari Vercel. Untuk perubahan skema berikutnya:

1. Tulis file migrasi baru di `supabase/migrations/<timestamp>_<nama>.sql`.
2. Uji dulu di project Supabase **staging/preview**.
3. Jalankan di project produksi via SQL Editor.
4. Deploy kode yang bergantung pada skema baru.

Rollback: supabase tidak mendukung down-migration otomatis — tulis migrasi
pembalik (`<timestamp>_<nama>_revert.sql`) bila perlu.

## 6. Backup & Recovery

- Supabase Free tidak menyertakan backup otomatis. Untuk backup manual:
  **Database → Backups → Download** (atau `pg_dump` via connection string).
- Sebelum migrasi besar, jalankan backup manual.

## 7. Rollback Deployment

Vercel menyimpan setiap build: **Deployments** → pilih versi sehat →
**⋯ → Promote to Production**. Database tidak ikut ter-rollback —
pastikan migrasi bersifat additif agar versi kode lama tetap kompatibel.

## 8. Troubleshooting

| Gejala | Penyebab umum | Solusi |
|---|---|---|
| Build gagal: "Your project's URL and API key are required" | Env vars belum diisi di Vercel | Isi 4 variabel di 4.2 |
| Login sukses tapi redirect gagal | Site URL / Redirect URLs salah di Supabase | Samakan domain dengan 4.3 |
| API 500 semua endpoint | `NEXT_PUBLIC_SUPABASE_URL` salah / project Supabase pause | Cek URL; unpause project |
| Register sukses tapi profile 404 | Trigger `handle_new_user` belum jalan | Pastikan migrasi #2 sudah dijalankan |
| Halaman dilindungi tetap bisa dibuka tanpa login | Env vars Preview tidak terisi | Pastikan env vars di-set untuk semua environment |
| Data tidak tersimpan setelah reload | RLS policy belum aktif | Verifikasi migrasi #2, cek policy di Table Editor |

## 9. Keamanan — Ringkasan

- Kunci rahasia hanya di server (variabel tanpa `NEXT_PUBLIC_`).
- Kunci jawaban soal **tidak pernah** dikirim ke browser; scoring di server
  (`src/lib/scoring.ts`).
- RLS aktif di semua tabel; pemain hanya bisa baca/tulis data miliknya.
- Semua endpoint `/api/v1` memverifikasi sesi server-side sebelum akses DB.
- Input divalidasi Zod dengan batas ukuran (anti-DoS).

## 10. Biaya (plan gratis)

- **Vercel Hobby**: 100 GB bandwidth/bulan, serverless functions sesuai kuota
  — cukup untuk demo dan pengujian pengguna awal.
- **Supabase Free**: 500 MB database, 50.000 MAU — cukup untuk fase pilot.
- Cek halaman pricing terkini sebelum klaim kapasitas ke juri.
