# Strategi Pengujian

## Lapisan Pengujian

| Lapisan | Alat | Cakupan | Perintah |
|---|---|---|---|
| Unit | Jest + next/jest | Logika bisnis murni: scoring, validasi Zod | `npm test` |
| Verifikasi build | `next build` | Tipe + lint + prerender semua halaman | `npm run build` |
| Smoke HTTP | curl | Kode status halaman & API, proteksi auth | manual / CI lanjutan |
| E2E (rencana) | Playwright | Perjalanan pengguna penuh di deployment nyata | menyusul — butuh Supabase live |

## Yang Sudah Terotomatisasi

- **`tests/unit/scoring.test.ts`** — perbandingan jawaban (case/whitespace-insensitive,
  object key-order-insensitive, penolakan jawaban kosong), perhitungan skor
  (clamp 0–100), konversi XP, dan level (500 XP/level).
- **`tests/unit/validation.test.ts`** — skema registrasi (kekuatan password),
  login, submission misi (UUID, batas jawaban), dan paginasi
  (default, null querystring, koersi, penolakan nilai liar).

## Checklist Uji Manual (jalankan setiap rilis)

Lihat §4.4 di `docs/deployment-vercel.md` — mencakup perjalanan pemain
(register → misi → skor → reload persist), proteksi rute, dan uji mobile.

## Skenario Keamanan yang Diuji

1. `POST /api/v1/attempts` tanpa sesi → **401** (terverifikasi via curl).
2. `GET /api/v1/profile` tanpa sesi → **401** (terverifikasi).
3. Payload `answers` > 50 item → **400** oleh Zod.
4. Jawaban yang diforge (`isCorrect: true` dari klien) → **dihiraukan**;
   server membandingkan dengan kunci di DB.
5. RLS — setelah Supabase live: pemain A tidak bisa membaca attempt pemain B
   (query langsung dari klien pemain A harus kosong).

## Batasan Saat Ini

- Tanpa Supabase live, endpoint berbasis DB hanya dapat diuji sampai lapis
  validasi/guard (error 500 dari kredensial placeholder adalah perilaku
  yang diharapkan — bukan lulus ke DB).
- E2E Playwright dibuat setelah URL produksi tersedia agar menguji
  integrasi nyata, bukan mock.
