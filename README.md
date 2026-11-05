# LokaQuest — Jelajahi Nusantara, Hidupkan Warisan Budaya

Aplikasi pembelajaran budaya Indonesia yang interaktif dan mengasyikkan.

## Fitur utama

- Misi budaya dengan Phaser, skor/XP dihitung server, achievement, artefak, dan leaderboard.
- Ensiklopedia budaya dengan alur editorial (draf → review → terbit), sumber wajib, bookmark, koleksi, dan riwayat baca.
- Peta Nusantara interaktif dan grafik hubungan budaya.
- Kelas untuk edukator: kode join, daftar siswa, tugas misi, dan analitik kelompok.
- Kuis kelas live, tantangan harian, streak, dan review spaced-repetition.
- Asisten berbasis konten terverifikasi (RAG) dengan sitasi; LLM opsional lewat env.
- Kontribusi komunitas dengan moderasi, audit log, dan notifikasi email opsional.
- Analitik produk dengan consent, SEO/OG image, sitemap, PWA manifest, dan dark mode.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Game Engine**: Phaser 3
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js >= 18.17.0
- npm or pnpm
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd lokaquest
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Configure Supabase:
   - Create a new Supabase project
   - Run **all** migrations in `supabase/migrations/` in filename order (see `docs/deployment-vercel.md` §2.2)
   - Seed demo data: `npm run db:seed`
   - Seed categories and articles: `supabase/seed-encyclopedia.sql`, then `supabase/seed-encyclopedia-articles.sql`
   - **Seed konten lengkap (misi Nusantara, artikel, media, graph, akun demo — lokal & produksi, idempoten):** isi `.env.local` lalu `npm run db:seed:content`. Panduan penggunaan lengkap ada di [docs/panduan-aplikasi.md](docs/panduan-aplikasi.md)

5. Optional integrations (see `.env.example`):
   - `ZAI_API_KEY` / `ZAI_API_BASE` for the grounded LLM assistant
   - `RESEND_API_KEY` / `EMAIL_FROM` for transactional email
   - `SUPABASE_SECRET_KEY` is required for privileged server writes

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000)

## Deployment

See [docs/deployment-vercel.md](docs/deployment-vercel.md) for deployment instructions.

## License

MIT
