# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Ringkasan Proyek

Situs landing page statis untuk NusaCerdas (nusacerdas.id) — "Sistem Operasi Ruang Kelas Indonesia", perangkat lunak untuk Papan Interaktif di sekolah. Seluruh konten situs berbahasa Indonesia (`lang="id"`).

Tidak ada build system, package manager, framework, test, atau linter — murni HTML/CSS/JS vanilla. Untuk melihat perubahan, cukup buka `index.html` di browser (atau jalankan static server sederhana, mis. `python -m http.server`).

## Peringatan Penting: Ukuran index.html

`index.html` hanya ~2000 baris tetapi berisi ~21 gambar base64 inline (`data:image/jpeg;base64,...`) dengan baris hingga 35.000 karakter — total ~314K token. **Jangan pernah Read seluruh file.** Gunakan Grep untuk mencari lokasi, lalu Read dengan offset/limit. Baris-baris base64 terbesar ada di sekitar baris 525–527, 707, dan 1954–2012 (kartu produk mega-menu & galeri). Jika perlu melihat baris panjang, gunakan shell dengan `cut -c1-150`.

## Arsitektur Halaman

Ada tiga halaman dengan pembagian file yang tidak simetris:

| Halaman | CSS | JS |
|---|---|---|
| `index.html` (halaman utama aktif) | `styles.css` + blok `<style>` inline di head (modal galeri) | Seluruhnya inline dalam satu `<script>` mulai ±baris 1213 — **tidak** memakai `script.js` |
| `privacy-policy.html` | `styles.css` + `privacy-policy.css` | `script.js` + `privacy-policy.js` (highlight TOC saat scroll) |
| `old_index.html` (halaman "coming soon" lama, disimpan sebagai arsip) | `styles.css` + `index.css` | `script.js` (countdown & form subscribe) |

Jadi: `script.js` dan `index.css` adalah peninggalan halaman lama — perubahan pada halaman utama dilakukan di `index.html` (markup + JS inline) dan `styles.css`.

## Struktur index.html

Setiap section ditandai komentar `<!-- ============ NAMA ============ -->`: NAV, MEGA-MENU, HERO, CINEMATIC HERO, STAT BAND, MARQUEE, PROBLEM, SOLUTION, PRODUCT REVEAL (`#platform`), HUB (`#hub`), LAB VIRTUAL (`#lab`), HIPER-LOKALISASI (`#lokal`), NUSAQUIZ (`#nusaquiz`), COMPARE, TRUST, FITUR, TESTIMONIALS, CTA (`#contact`), FOOTER. Section HORIZONTAL SCROLL SHOWCASE ada tetapi di-comment-out.

JS inline (±baris 1213 sampai akhir) berisi:
- Interaksi UI: switcher gambar quiz, mega-menu Produk, tombol "Lihat Selengkapnya", smooth scroll anchor, nav auto-hide saat scroll.
- Modal YouTube: fungsi global `openYTModal(videoId)` / `closeYTModal()`, dipanggil dari atribut `onclick` pada `.product-card`.
- Modal galeri gambar: fungsi global `openSubjectGallery(subjectKey)` membaca objek `fileDatabase` (±baris 1811) yang memetakan kunci subjek (NusaBiology, NusaFisika, NusaChem, NusaMath, NusaPeriodic) ke daftar nama file di `assets/<subjectKey>/`. **Menambah gambar galeri = menaruh file di folder assets yang sesuai DAN menambahkan nama filenya ke `fileDatabase`.** Kartu produk tanpa video YouTube memakai galeri ini, sisanya memakai `openYTModal`.
- "Cinematic engine": animasi scroll-driven (hero parallax/zoom, product reveal 4 frame, particle canvas, master RAF loop) dengan deteksi perangkat low-end + `prefers-reduced-motion` — semuanya menambahkan class `reduced-motion` ke body dan mem-bypass animasi bila aktif. Pertahankan pola ini (transform GPU-only, listener `passive: true`) saat menambah animasi baru.

## Konvensi

- `styles.css` adalah stylesheet global bersama. **Ada dua blok `:root`** (±baris 14 dan ±baris 301) — blok kedua menimpa sebagian nilai blok pertama (mis. `--red-dark` jadi `#a00d24`) dan menambah token baru (`--ink`, `--red-soft`, `--gray-700`). Selalu cek blok kedua sebelum berasumsi soal nilai variabel.
- Ada aturan global `a:hover { color: var(--red-dark) }` (±baris 66). Spesifisitasnya (0,1,1) mengalahkan selector satu-class seperti `.btn-primary` (0,1,0), jadi setiap anchor yang dipakai sebagai tombol **wajib mendeklarasikan ulang `color` di state `:hover`-nya**, kalau tidak teksnya akan berubah merah gelap dan hilang di atas background merah.
- Aset gambar di `assets/`, dikelompokkan per produk (folder `NusaMath/`, `NusaChem/`, dst.) plus `nusacerdas-logo/`. Nama file bebas (ada yang berspasi) — cocokkan persis saat mereferensikannya.
- Pesan commit historis ditulis dalam bahasa Indonesia informal.
