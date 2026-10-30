# Nusantara Cultural Encyclopedia

Modul ini menambahkan ensiklopedia ke aplikasi LokaQuest yang sudah ada. Migration `20261030000000_nusantara_encyclopedia.sql` bersifat additive dan tidak mengubah tabel misi, profil, atau data pengguna. Publik dapat membaca artikel terbit tanpa login; bookmark, koleksi privat, dan riwayat baca memerlukan akun.

## Setup lokal

1. Pastikan CLI menunjuk ke Supabase lokal/development, bukan proyek produksi.
2. Jalankan migration dengan alur lokal proyek (`npx supabase start` lalu `npx supabase migration up`). Jangan gunakan `supabase db reset` pada production.
3. Kategori dasar di- seed secara repeatable dari `supabase/seed-encyclopedia.sql` setelah migration.
4. Akun aplikasi dengan role `admin` otomatis berwenang penuh. Untuk mengundang editor, masukkan `profile_id`, `editor_role`, dan `created_by` ke `encyclopedia_editor_roles` lewat SQL admin yang aman. Role yang tersedia: `content_administrator`, `cultural_editor`, `reviewer`, `contributor`.

Migration **belum dijalankan** pada Supabase live. Skema production LokaQuest pernah memiliki kolom `image_source_id` di luar migration; fitur ensiklopedia tidak bergantung pada kolom tersebut.

## Alur editorial

Artikel dibuat sebagai `draft`, contributor/editor dapat mengajukan `review`, reviewer menyetujui menjadi `approved` atau meminta perubahan dengan mengembalikan ke `draft`, dan hanya `content_administrator` yang dapat menerbitkan. Publikasi memerlukan setidaknya satu referensi di `encyclopedia_sources`; audit dicatat pada `audit_logs`. Hanya artikel `published` disajikan oleh API publik, sitemap, dan metadata publik.

## API utama

- Publik: `GET /api/v1/encyclopedia/articles`, `GET /api/v1/encyclopedia/articles/[slug]`, `GET /api/v1/encyclopedia/search`, `GET /api/v1/encyclopedia/categories`, `GET /api/v1/encyclopedia/regions`.
- Akun: `GET/POST /api/v1/encyclopedia/bookmarks`, `DELETE /api/v1/encyclopedia/bookmarks/[id]`, `GET/POST/DELETE /api/v1/encyclopedia/collections` (riwayat baca privat).
- Editor: `GET/POST /api/v1/admin/encyclopedia/articles`, `GET/PATCH/DELETE /api/v1/admin/encyclopedia/articles/[id]`, `POST /review`, `POST /publish`, `POST /sources`.

List/search menggunakan filter database dan pagination. Data privat memakai `Cache-Control: private, no-store`; detail artikel publik menggunakan `s-maxage=300, stale-while-revalidate=600`. Perubahan status memicu revalidasi path.

## Media

Metadata media mewajibkan status izin, creator/rights holder, lisensi, dan atribusi. Upload belum diaktifkan. Sebelum upload diaktifkan di production, buat bucket privat `encyclopedia-media` dan policies Storage untuk editor terdaftar, lalu sajikan media hanya setelah metadata berstatus published dan izin diverifikasi. Jangan mengunggah atau menerbitkan ulang materi berhak cipta tanpa izin.

## Konten dan validasi budaya

Seed kategori hanya menyediakan struktur navigasi, bukan klaim tentang tradisi. Tidak ada artikel budaya yang dibuat otomatis. Artikel harus memiliki sumber yang bisa ditelusuri dan tinjauan editorial; bedakan fakta terdokumentasi, interpretasi akademik, tradisi lisan, perspektif komunitas, dan praktik kontemporer.

## Verifikasi lokal

Jalankan `npm run typecheck`, `npm test -- --runInBand`, `npm run lint`, dan `npm run build`. Build tidak menerapkan migration maupun men-deploy aplikasi.
