# Register Sumber & Atribusi Budaya

Prinsip: **tidak pernah mengarang fakta sejarah**, tidak menyatakan tradisi
eksklusif milik satu daerah tanpa bukti, dan hanya mempublikasikan konten
yang sumbernya tercatat di tabel `cultural_sources`.

## Sumber Seed (tersimpan di tabel `cultural_sources`)

| # | Judul | Penulis | Penerbit | Tahun | Lisensi |
|---|---|---|---|---|---|
| 1 | Ensiklopedia Batik Indonesia | Hasan | Gramedia Pustaka Utama | 2010 | CC BY-SA 4.0 |
| 2 | Gamelan: Traditional Music of Indonesia | Sumarsam | Wesleyan University Press | 1995 | CC BY-NC 4.0 |
| 3 | Wayang Kulit: Shadow Puppetry of Java | Brandon | KITLV Press | 1967 | Public Domain |

> **PENTING**: Entri di atas adalah data *placeholder* dari seed demo.
> Sebelum rilis publik, tim konten **wajib memverifikasi** tiap entri:
> cek ISBN/nomor katalog perpustakaan, sesuaikan atribusi dengan lisensi
> sebenarnya, dan ganti URL contoh (`example.com`) dengan tautan katalog
> resmi. Jangan mempublikasikan konten yang sumbernya belum diverifikasi.

## Prosedur Penambahan Konten Baru

1. Riset minimal dua sumber independen yang kredibel (museum, penerbit
   akademik, komunitas adat resmi).
2. Catat di `cultural_sources`: judul, penulis, penerbit, tahun, lisensi,
   kalimat atribusi siap-tampil.
3. Buat `cultural_contents` dengan `status = draft` → review pemeriksa
   (tim budaya) → `published`.
4. Media (gambar/audio) hanya dari aset berlisensi jelas; simpan lisensinya
   di kolom `attribution`.

## Status Editorial

`draft → review → published → archived` diatur lewat kolom `status`
pada `cultural_regions`, `cultural_contents`, dan `missions`.
Publik hanya melihat `published` (dijamin RLS + filter API).

## Klaim yang Dihindari

- Tidak ada klaim efektivitas pembelajaran sebelum pengujian pengguna nyata
  (lihat `docs/user-testing-plan.md`).
- Tidak ada jumlah pengguna, testimoni, penghargaan, atau kemitraan fiktif
  di landing page.
- Motif batik, instrumen gamelan, dan tokoh wayang disajikan lintas-daerah
  sesuai sumber; tidak diklaim eksklusif satu provinsi tanpa bukti.
