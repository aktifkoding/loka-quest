import type { Localized } from "../types";

/**
 * String UI untuk halaman statis: tentang kami dan register sumber budaya.
 */
export const staticDict = {
  // Label kembali
  backHomeLabel: { id: "Beranda", en: "Home" },

  // Halaman tentang
  aboutMetaTitle: { id: "Tentang Kami", en: "About Us" },
  aboutTitle: { id: "Tentang LokaQuest", en: "About LokaQuest" },
  aboutDescription: {
    id: "LokaQuest lahir dari satu keyakinan: warisan budaya paling hidup ketika generasi muda menyentuhnya lewat cara mereka paling suka — bermain. Tiga misi kami (batik, gamelan, wayang) dibangun di atas konten bersumber dan teknologi yang menghormati privasi pemain.",
    en: "LokaQuest was born from a single belief: cultural heritage is most alive when the younger generation touches it through what they love most — play. Our three missions (batik, gamelan, wayang) are built on sourced content and technology that respects player privacy.",
  },
  aboutRoleDeveloper: { id: "Pengembang Produk", en: "Product Developer" },
  aboutRoleDeveloperBody: {
    id: "Merancang dan membangun LokaQuest: Next.js, Phaser 3, dan Supabase — dengan nilai jawaban dinilai di server dan data dilindungi keamanan tingkat baris.",
    en: "Designed and built LokaQuest: Next.js, Phaser 3, and Supabase — with answers graded on the server and data protected by row-level security.",
  },
  aboutRoleEconomics: {
    id: "Pengampu Ekonomi & Bisnis",
    en: "Economics & Business Lead",
  },
  aboutRoleEconomicsBody: {
    id: "Menjaga agar produk berjalan pada kuota layanan gratis, merancang jalur keberlanjutan, dan menyiapkan model pertumbuhan pasca-kompetisi.",
    en: "Keeps the product running within free service quotas, designs the sustainability path, and prepares the growth model for after the competition.",
  },
  aboutRoleCulture: {
    id: "Pengampu Substansi Kebudayaan",
    en: "Cultural Content Lead",
  },
  aboutRoleCultureBody: {
    id: "Memverifikasi setiap tradisi yang ditulis, menjaga register sumber dan lisensi, serta memastikan penyajian yang hormat pada masyarakat pemilik budaya.",
    en: "Verifies every tradition written, maintains the source register and licenses, and ensures the presentation stays respectful to the communities who own the culture.",
  },
  aboutCollaborateQuestion: {
    id: "Ingin berkolaborasi atau memakai LokaQuest di kelas Anda?",
    en: "Want to collaborate or use LokaQuest in your classroom?",
  },
  aboutSourceRegisterLink: {
    id: "Lihat register sumber budaya kami",
    en: "See our cultural source register",
  },
  aboutTransparencySuffix: {
    id: "untuk transparansi penuh atas rujukan dan lisensi.",
    en: "for full transparency on references and licenses.",
  },

  // Halaman sumber budaya
  sourcesMetaTitle: { id: "Sumber Budaya", en: "Cultural Sources" },
  sourcesMetaDescription: {
    id: "Register sumber rujukan budaya yang digunakan LokaQuest — transparansi akar budaya dan hak karya.",
    en: "The register of cultural reference sources used by LokaQuest — transparency on cultural roots and creators' rights.",
  },
  sourcesPageTitle: { id: "Sumber budaya", en: "Cultural sources" },
  sourcesPageDescription: {
    id: "LokaQuest menulis tradisi, artefak, dan cerita hanya dari referensi yang tercatat dan berlisensi jelas. Daftar ini adalah register terbuka atas semua rujukan yang kami pakai — bukan fakta karangan.",
    en: "LokaQuest writes traditions, artifacts, and stories only from references that are catalogued and clearly licensed. This list is an open register of every reference we use — no invented facts.",
  },
  licenseOnRecord: { id: "lisensi dicatat", en: "license on record" },
  catalogCta: { id: "Katalog", en: "Catalog" },
  sourcesLicenseNote: {
    id: "Memperhatikan lisensi budaya? Kami juga: setiap elemen permainan (termasuk bunyi gamelan) dibangkitkan secara sintetis dan ilustrasi memakai motif geometris generik — bukan reprodigsi karya berhak cipta.",
    en: "Care about cultural licensing? So do we: every game element (including gamelan sounds) is generated synthetically and illustrations use generic geometric motifs — not reproductions of copyrighted works.",
  },
} satisfies Record<string, Localized>;
