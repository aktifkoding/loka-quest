# Arsitektur LokaQuest

## Gambaran Umum

LokaQuest adalah aplikasi pembelajaran budaya Indonesia berbasis game.
Seluruh sistem berjalan dalam **satu project Next.js** yang di-deploy ke Vercel,
dengan Supabase sebagai backend data dan autentikasi. Tidak ada server
terpisah, tidak ada VPS, tidak ada Docker di produksi.

```
┌─────────────────────────────────────────────┐
│                  Browser                     │
│  Next.js (React) + Phaser 3 (client-only)    │
└──────────────┬──────────────────────────────┘
               │ HTTPS
┌──────────────▼──────────────────────────────┐
│                  Vercel                      │
│  • Static/SSR pages (Next.js App Router)     │
│  • /api/v1/** → Vercel Functions             │
└──────────────┬──────────────────────────────┘
               │ Postgres / Auth / Storage
┌──────────────▼──────────────────────────────┐
│                  Supabase                    │
│  • PostgreSQL + Row Level Security           │
│  • Supabase Auth (cookie-based, @supabase/ssr)│
│  • Storage (media budaya)                    │
└─────────────────────────────────────────────┘
```

## Keputusan Teknis Utama

| Keputusan | Alasan |
|---|---|
| Next.js App Router | Satu deploy untuk UI + API (Vercel Functions), SEO untuk landing page |
| Supabase Auth via `@supabase/ssr` | Sesi berbasis cookie, terverifikasi server-side; bukan trust-client |
| Phaser dinamis (`ssr: false`) | Phaser menyentuh `window`/`document` saat import; wajib client-only |
| Scoring 100% server-side | Kunci jawaban tidak pernah dikirim ke browser; anti-cheat |
| Zod di semua input | Validasi + batas ukuran payload (anti-DoS) |
| RLS di semua tabel | Pertahanan lapis kedua di bawah API guards |

## Struktur Kode

```
src/
  app/
    (public)/          Halaman publik: landing, explore, missions, regions, auth
    player/            Dasbor pemain (layout guard: requireAuth)
    educator/          Dasbor edukator (layout guard: role educator|admin)
    admin/             Dasbor admin (layout guard: role admin)
    api/v1/            Route handlers — semua endpoint terlindungi
  components/
    ui/                Primitif UI (button, card, input, label)
    layout/            Navbar
    game/              PhaserGame (client-only, dynamic import)
  lib/
    supabase/          client.ts (browser) | server.ts (RSC/route) — dipisah
    auth/              session.ts — getSessionUser / requireAuth / requireRole
    api/               handler.ts (error mapping), response.ts
    validation/        Skema Zod
    scoring.ts         Logika nilai & XP (murni, unit-tested)
  types/               Tipe domain
supabase/
  migrations/          SQL versioned (skema → RLS)
  seed.sql             Data demo idempoten
tests/unit/            Jest — scoring, validasi
docs/                  Deployment, arsitektur, kontrak API, dll.
```

## Alur Misi (gameplay)

1. Pemain membuka `/missions/<slug>` → halaman fetch misi + soal via API.
2. API `GET /missions/:id/questions` mengembalikan soal **tanpa** `correct_answer`.
3. Phaser (client) mengumpulkan jawaban, mengirim ke `POST /api/v1/attempts`.
4. Server: verifikasi sesi → validasi Zod → muat kunci jawaban → hitung skor
   (`src/lib/scoring.ts`) → simpan attempt + answers → update XP/level.
5. Server mengembalikan skor + pembahasan per soal → UI menampilkan hasil.

## Model Keamanan

- **Autentikasi**: cookie httpOnly dikelola `@supabase/ssr`; sesi diverifikasi
  `supabase.auth.getUser()` di server untuk setiap operasi terlindungi.
- **Otorisasi**: dua lapis — guard di route handler (`requireAuth`/`requireRole`)
  dan RLS di database. Frontend guards hanyalah UX, bukan keamanan.
- **Integritas skor**: kunci jawaban, skor, dan XP semuanya dihitung server;
  payload dari browser tidak pernah dipercaya.
- **Header**: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin` (lihat `next.config.ts`).

## Batasan yang Disengaja

- Tanpa WebSocket / multiplayer real-time — Vercel Functions stateless;
  bila dibutuhkan nanti, pakai layanan realtime eksternal (mis. Supabase Realtime).
- Tanpa state in-memory antar request — semua state persisten di Postgres.
- Audio media menyusul lisensi; mini-game punya fallback teks.
