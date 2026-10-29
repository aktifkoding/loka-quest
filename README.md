# LokaQuest — Jelajahi Nusantara, Hidupkan Warisan Budaya

Aplikasi pembelajaran budaya Indonesia yang interaktif dan mengasyikkan.

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
   - Run migrations: `npm run db:push`
   - Seed demo data: `npm run db:seed`

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Deployment

See [docs/deployment-vercel.md](docs/deployment-vercel.md) for deployment instructions.

## License

MIT
