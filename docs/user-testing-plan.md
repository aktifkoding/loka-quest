# Rencana Pengujian Pengguna (User Testing Plan)

Tujuan: mengukur keterbacaan, keterlibatan, dan — secara awal —
pemahaman budaya, **tanpa mengklaim efektivitas pendidikan** sebelum data
nyata terkumpul.

## 1. Cakupan Pilot

- Peserta: 15–30 siswa/pengguna umum, dikelompokkan via `educator_groups`.
- Durasi: 1 sesi 30–45 menit per peserta.
- Perangkat: ponsel Android/iOS + desktop (uji lintas perangkat).

## 2. Alur Sesi

1. Pre-test (3 soal) — baseline pengetahuan.
2. Bebas menjelajah: `/explore` → pilih wilayah → kerjakan misi.
3. Post-test (3 soal) — bandingkan dengan baseline.
4. Kuesioner pengalaman (SUS 10 pertanyaan + pertanyaan terbuka).

## 3. Metrik yang Dicatat

| Metrik | Sumber data | Catatan |
|---|---|---|
| Skor pre vs post | `assessment_responses` | Laporkan selisih + jumlah sampel + keterbatasan (bukan bukti kausal) |
| Misi selesai | `mission_attempts.completed` | Tingkat penyelesaian per misi |
| Waktu per misi | `started_at` → `completed_at` | Indikasi keterlibatan |
| Retensi konten | jawaban salah berulang | Identifikasi soal membingungkan |
| Kemudahan pakai | skor SUS | Target ≥ 68 (rata-rata industri) |

## 4. Etika & Privasi

- Setuju peserta sebelum sesi; data anak di bawah umur butuh persetujuan orang tua.
- Tidak mengumpulkan PII di luar email + nama tampilan.
- Hasil dilaporkan agregat, tanpa mengidentifikasi individu.

## 5. Pelaporan yang Jujur

Template klaim yang diizinkan setelah pilot:

> "Pada pilot dengan N peserta, rata-rata skor naik dari X ke Y.
> Ini indikasi awal, bukan bukti efektivitas; diperlukan studi
> lebih besar dengan kelompok kontrol."

**Dilarang**: "terbukti meningkatkan pemahaman budaya" tanpa studi
terkontrol.
