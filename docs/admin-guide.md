# Panduan Lengkap Dashboard Admin LokaQuest

Panduan ini menjelaskan cara mengakses, menyiapkan, dan mengoperasikan seluruh modul dashboard admin LokaQuest (`/admin`).

---

## 1. Prasyarat Sebelum Memakai Admin

Admin tidak akan berfungsi kalau fondasi berikut belum siap. Urutan pengerjaannya:

1. **Environment variables** — file `.env.local` di root proyek harus berisi:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...   # untuk audit log & sesi demo
   ```
2. **Jalankan semua migrasi** di folder `supabase/migrations/` ke database Supabase Anda.
   - Migrasi dasar: `20240101000000_initial_schema.sql` → `20250101000003_add_knowledge_graph_and_community.sql`.
   - Migrasi ensiklopedia: `20261030000000_nusantara_encyclopedia.sql`.
     > ⚠️ **Status per 2026-10-31**: migrasi ensiklopedia versi terbaru (dengan cast eksplisit `'simple'::regconfig` untuk kolom generated tsvector) **belum dikonfirmasi berhasil dijalankan** di Supabase. Versi lama sempat gagal dengan error `42P17` di SQL Editor. Jalankan ulang isi file terbaru di **Supabase Dashboard → SQL Editor** sampai sukses — tanpa migrasi ini, seluruh modul Ensiklopedia (termasuk admin-nya) akan error.
3. **Seed data** (opsional tapi disarankan): `npm run seed` / script di `scripts/` untuk mengisi 9 wilayah, konten budaya, dan misi contoh.
4. **Jalankan aplikasi**: `npm run dev` → `http://localhost:3000`.

## 2. Mengakses Dashboard Admin

1. Daftar akun biasa di `/auth/register` atau login di **`/auth/login`**.
2. Buka `http://localhost:3000/admin`.
3. Sistem memeriksa kolom `profiles.role` milik akun Anda:
   - `admin` → dashboard terbuka.
   - `player` / `educator` / belum login → **di-redirect** ke halaman utama.
4. Tombol ⎋ di kanan atas navbar admin untuk keluar dari sesi.

> Sesi demo satu-klik di halaman depan **hanya membuat akun `player`** — tidak bisa masuk admin, dan memang seharusnya begitu.

## 3. Menjadikan Admin Pertama (Bootstrap)

Tidak ada admin bawaan, dan halaman "Pengguna & peran" justru butuh admin untuk dipakai (chicken-and-egg). Admin pertama harus dibuat lewat SQL sekali saja:

1. Buka **Supabase Dashboard → SQL Editor**.
2. Jalankan:
   ```sql
   update public.profiles
   set role = 'admin'
   where email = 'email-anda@contoh.com';
   ```
3. Logout dari aplikasi lalu login ulang (role dibaca ulang saat login), buka `/admin`.

Setelah itu, admin berikutnya bisa dibuat dari aplikasi: **Admin → Pengguna** → ubah kolom peran di baris user.

### Memberi peran editorial ensiklopedia (terpisah dari role admin)

Modul Ensiklopedia punya sistem peran editorialnya sendiri di tabel `encyclopedia_editor_roles` (`content_administrator`, `cultural_editor`, `reviewer`, `contributor`). Catatan penting:

- **Akun `admin` otomatis dianggap `content_administrator`** — tidak perlu di-insert.
- Untuk memberi peran editor kepada user lain (mis. kurator budaya), jalankan SQL:
  ```sql
  insert into public.encyclopedia_editor_roles (profile_id, editor_role)
  values ((select id from public.profiles where email = 'kurator@contoh.com'), 'cultural_editor');
  ```

---

## 4. Tur 9 Modul Admin

Navigasi horizontal di bagian atas setiap halaman admin menghubungkan semua modul.

### 4.1 Dasbor (`/admin`)
Ringkasan metrik: jumlah pengguna, misi, dan wilayah, plus tautan cepat ke semua modul manajemen.

### 4.2 Wilayah budaya (`/admin/regions`)
Daftar 9 wilayah Nusantara dengan status editorial (draf/review/terbit/arsip). Data wilayah dikelola terutama lewat seed script; halaman ini untuk memverifikasi dan meninjau.

### 4.3 Misi & soal (`/admin/missions`) — CRUD penuh
Halaman utama untuk konten gameplay:

- **Daftar misi**: judul, wilayah, tingkat kesulitan, XP, jumlah soal, status. Filter berdasarkan status.
- **Ubah status** langsung dari daftar: Draf → Review → Terbit → Arsip. Hanya misi **Terbit** yang muncul ke pemain.
- **Tambah misi** → isi judul (slug dibuat otomatis, bisa diedit), wilayah, deskripsi, tujuan pembelajaran (satu per baris), kesulitan, XP, urutan tampil → **Buat misi & lanjut ke soal**.
- **Editor soal** (di halaman edit misi), 4 jenis soal:
  | Jenis | Input | Bentuk data tersimpan |
  |---|---|---|
  | Pilihan ganda | Pilihan satu-per-baris + pilih jawaban benar | `options.choices[]`, `correct_answer.correct` |
  | Identifikasi | Opsi opsional + jawaban teks persis | `options.choices[]` (opsional), `correct_answer.correct` |
  | Urutkan | Daftar acara + urutan benar dipisah koma | `options.events[]`, `correct_answer.correct` (string urutan) |
  | Jodohkan | Pasangan `kiri = kanan` per baris | `options.pairs{}`, `correct_answer.matches{}` |
- **Hapus misi** hanya untuk draf; misi yang pernah dikerjakan pemain hanya bisa diarsipkan (proteksi di API).
- Setiap perubahan tercatat di Log audit (`mission.*`).

### 4.4 Ensiklopedia budaya (`/admin/encyclopedia`)
CMS artikel budaya: daftar artikel (status + tanggal update), tombol **artikel baru** ke `/admin/encyclopedia/articles/new`. Alur editorial:

1. `contributor`/`cultural_editor` menulis artikel → simpan **draft** atau **ajukan review**.
2. `reviewer` menyetujui/menolak lewat endpoint review.
3. `content_administrator` (atau admin) **mempublikasikan**.

Artikel terpublikasi muncul di publik `/encyclopedia`. Terkait: sumber artikel, relasi kategori/wilayah/mission, versi revisi, bookmark, dan riwayat baca — semua tabelnya di migrasi ensiklopedia.

### 4.5 Konten & sumber (`/admin/contents`)
Katalog read-only `cultural_contents` + `cultural_sources`. Data diisi lewat seed script.

### 4.6 Moderasi komunitas (`/admin/submissions`)
Antrian usulan konten dari pengguna (tabel `community_submissions`):

- Bagian **Menunggu verifikasi**: tombol **Publikasikan** / **Tolak**, plus catatan admin opsional yang bisa dibaca pengirim.
- Bagian **Riwayat**: keputusan yang sudah diambil.
- API membatasi field yang bisa diubah: hanya `status` (`published`/`rejected`) dan `admin_note` (maks. 1000 karakter).

### 4.7 Pengguna & peran (`/admin/users`)
Daftar semua akun (email, nama, XP, level, tanggal daftar). Ubah peran (`player`/`educator`/`admin`) langsung dari dropdown — tersimpan ke `profiles.role` dan tercatat di audit log.

### 4.8 Log audit (`/admin/audit-logs`)
Jejak aktivitas administratif (siapa, aksi apa, kapan, resource mana). Contoh aksi: `mission.created`, `mission.question.updated`, `encyclopedia.article.created`, perubahan role, dan keputusan moderasi.

### 4.9 Analitik (`/admin/analytics`)
Metrik agregat aplikasi: pengguna, jumlah percobaan misi (`mission_attempts`), wilayah, dan konten.

---

## 5. Alur Kerja Harian (Contoh)

### Skenario A — Menerbitkan misi baru
1. `/admin/missions` → **Tambah misi** → isi detail → buat.
2. Di halaman edit → **Tambah soal** untuk tiap soal (campur jenis sesuai kebutuhan).
3. Cek kembali di daftar → ubah status ke **Terbit**.
4. Verifikasi dari sisi pemain: buka `/missions`, kerjakan misi, pastikan skor & XP masuk.

### Skenario B — Memoderasi usulan komunitas
1. `/admin/submissions` → baca usulan pending.
2. Klik **Publikasikan** (atau **Tolak** + tulis catatan).
3. Usulan pindah ke Riwayat; pengirim dapat lihat statusnya.

### Skenario C — Menambah artikel ensiklopedia
1. `/admin/encyclopedia` → **artikel baru** (atau titipkan ke contributor).
2. Isi konten, kaitkan kategori & wilayah, simpan draft / ajukan review.
3. Sebagai admin (dianggap `content_administrator`) → publish.

---

## 6. Troubleshooting

| Gejala | Penyebab & solusi |
|---|---|
| `/admin` langsung melempar ke beranda | Belum login, atau `profiles.role` bukan `admin`. Cek dengan SQL: `select email, role from profiles where email = '...'` |
| Halaman ensiklopedia error / data kosong | Migrasi `20261030000000_nusantara_encyclopedia.sql` belum ter-apply (lihat §1 langkah 2). Jalankan ulang di SQL Editor |
| "Slug misi sudah dipakai" | Slug harus unik; edit kolom slug (huruf kecil, tanda hubung) |
| "Misi sudah pernah dikerjakan pemain" saat hapus | By design — arsipkan misi alih-alih menghapus, agar riwayat skor pemain utuh |
| API admin membalas 401/403 | Sesi kadaluarsa atau role tidak sesuai; login ulang |
| Perubahan role tidak berefek | Role dibaca saat sesi dibuat — logout lalu login ulang |

---

## 7. Peta API Admin (referensi singkat)

| Endpoint | Metode | Fungsi |
|---|---|---|
| `/api/v1/admin/missions` | GET, POST | Daftar & buat misi |
| `/api/v1/admin/missions/[id]` | PATCH, DELETE | Ubah (status/field) & hapus misi |
| `/api/v1/admin/missions/[id]/questions` | GET, POST | Daftar & tambah soal |
| `/api/v1/admin/missions/[id]/questions/[qid]` | PATCH, DELETE | Ubah & hapus soal |
| `/api/v1/admin/regions` | GET | Daftar wilayah |
| `/api/v1/admin/users`, `/[userId]` | GET, PATCH | Daftar & ubah role pengguna |
| `/api/v1/admin/submissions/[id]` | PATCH | Moderasi usulan |
| `/api/v1/admin/encyclopedia/articles*` | GET/POST/PATCH + publish/review/sources | CMS ensiklopedia |

Semua endpoint di atas memeriksa `requireRole(["admin"])` (atau peran editorial untuk ensiklopedia) di sisi server — bukan hanya menyembunyikan menu di UI.
