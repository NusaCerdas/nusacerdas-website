# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Ringkasan Proyek

Situs landing page statis untuk NusaCerdas (nusacerdas.id) — "Sistem Operasi Ruang Kelas Indonesia", perangkat lunak untuk Papan Interaktif di sekolah. Seluruh konten situs berbahasa Indonesia (`lang="id"`).

Tidak ada build system, package manager, framework, test, atau linter — murni HTML/CSS/JS vanilla. Untuk melihat perubahan, jalankan static server sederhana (mis. `python -m http.server`) lalu buka `index.html`.

## Arsitektur Halaman

| Halaman | CSS | JS |
|---|---|---|
| `index.html` (beranda) | `styles.css` | `main.js` |
| `dasbor-kelas.html`, `lab-virtual.html`, `pustaka-digital.html`, `nusaquiz.html` (halaman kategori produk) | `styles.css` | `main.js` |
| `privacy-policy.html` | `styles.css` + `privacy-policy.css` | `script.js` + `privacy-policy.js` (highlight TOC saat scroll) |
| `old_index.html` (arsip "coming soon", `noindex`) | `styles.css` + `index.css` | `script.js` (countdown & form subscribe) |

- `script.js` dan `index.css` adalah peninggalan halaman lama.
- **Halaman kategori adalah salinan statis**: head (meta/canonical/OG/breadcrumb JSON-LD), nav + mega-menu, section terkait dari `index.html` (judul pertama jadi `<h1>` + breadcrumb), CTA, modal, dan footer. Anchor ke section yang tidak ada di halaman itu diarahkan ke halaman kategori yang sesuai atau `index.html#...`. **Perubahan nav, mega-menu, footer, atau isi section Hub/Lab/Lokal/NusaQuiz/Fitur harus disalin ke halaman kategori juga.** Halaman baru → tambahkan ke `sitemap.xml`.
- `<head>` setiap halaman: canonical, Open Graph/Twitter (`assets/og-image.jpg`, 1200×630), JSON-LD, favicon persegi, dan `<script>` kecil yang memasang class `js` di `<html>` (dipakai CSS `html:not(.js)` agar konten animasi tetap terlihat tanpa JS).

## Struktur index.html

Setiap section ditandai komentar `<!-- ============ NAMA ============ -->`: NAV, MEGA-MENU, HERO, CINEMATIC HERO, STAT BAND, MARQUEE, PROBLEM, SOLUTION, PRODUCT REVEAL (`#platform`), HUB (`#hub`), LAB VIRTUAL (`#lab`), HIPER-LOKALISASI (`#lokal`), NUSAQUIZ (`#nusaquiz`), COMPARE, TRUST, FITUR, TESTIMONIALS, CTA (`#contact`), FOOTER. Konten ada di dalam `<main id="main">`; nav memakai class `site-nav`.

## main.js

Satu IIFE berisi fitur yang masing-masing memeriksa elemennya dulu (aman di halaman yang tidak punya semua section), plus fungsi galeri global di bawahnya:
- Interaksi UI: switcher gambar kuis, mega-menu Produk + hamburger (≤ 880px; hover hanya untuk `pointerType === 'mouse'`), tombol "Lihat Selengkapnya", smooth scroll anchor, nav auto-hide, slider hero (autoplay berhenti saat reduced motion / tab tersembunyi / hero di luar layar), aktivasi keyboard untuk `[role="button"]`.
- Modal YouTube: global `openYTModal(videoId)` / `closeYTModal()`, dipanggil dari `onclick` pada `.product-card[role="button"]`.
- Modal galeri: global `openSubjectGallery(subjectKey)` membaca `fileDatabase` yang memetakan kunci subjek (NusaBiology, NusaFisika, NusaChem, NusaMath, NusaPeriodic, NusaAnatomy, NusaCoding, NusaEnglish) ke nama file di `assets/<subjectKey>/`; entri yang mengandung `/` dipakai sebagai path lengkap. **Menambah gambar galeri = menaruh file `.webp` di folder yang sesuai DAN menambahkan namanya ke `fileDatabase`.** NusaCoding & NusaEnglish masih memakai `cover.webp` sementara — ganti dengan screenshot asli (juga `src` gambar kartunya di `index.html` dan `lab-virtual.html`).
- "Cinematic engine": hero sinematik, product reveal 4 frame, particle canvas, master RAF loop. Deteksi perangkat low-end + `prefers-reduced-motion` → `disableScrollFX`: class `reduced-motion` di body (CSS mematikan layout sticky) **dan** semua fungsi update berhenti. iOS melaporkan ≤ 2 core, jadi iPhone selalu masuk mode ini. Pertahankan pola: transform GPU-only, listener `passive: true`, ukur tinggi stage (bukan `innerHeight`).

## Gambar

- Halaman memakai **`.webp`** (lebar maks 1600px) plus varian `-640.webp` untuk `srcset` kartu produk & hero. PNG/JPG sumber yang sudah dikonversi dihapus (ada di riwayat Git); yang tersisa di `assets/` hanya yang dirujuk langsung (logo, favicon, og-image) atau aset sumber brand yang belum dipakai.
- Gambar baru: konversi ke WebP, beri `width`/`height` intrinsik (CSS `:where(img[width][height]) { height: auto }` menjaga rasio), dan `loading="lazy" decoding="async"` bila di bawah hero. Path berspasi di `srcset` wajib di-encode (`%20`).

## Konvensi CSS

- `styles.css` adalah stylesheet global bersama. **Ada dua blok `:root`** (±baris 14 dan ±baris 300) — blok kedua menimpa sebagian nilai blok pertama (mis. `--red-dark` jadi `#a00d24`) dan menambah token (`--ink`, `--red-soft`, `--gray-700`). Blok pertama + aturan `.nav`/`.footer`/`.marquee-section` di atasnya dipakai `privacy-policy.html` dan `old_index.html`.
- Aturan global `nav { position: fixed; height: 64px }` berlaku untuk **semua** elemen `<nav>`. Jangan pakai `<nav>` untuk navigasi sekunder (breadcrumb, daftar isi) — pakai `<div aria-label>` atau reset seperti `nav.toc-nav` di `privacy-policy.css`.
- Aturan global `a:hover { color: var(--red-dark) }` (spesifisitas 0,1,1) mengalahkan selector satu-class seperti `.btn-primary`, jadi setiap anchor yang dipakai sebagai tombol **wajib mendeklarasikan ulang `color` di `:hover`**.
- `.reveal.in { transform }` dipasang JS ke banyak kartu dan menimpa `transform` pada `:hover` biasa — efek hover kartu perlu selector `.x.reveal.in:hover`.
- Teks merah di latar gelap pakai `#ff6b85` (bukan `--red`) agar kontras memenuhi WCAG AA.
- Bagian akhir `styles.css` berisi blok "RESPONSIVE & BUGFIX", galeri, dan halaman kategori.
- Aset gambar dikelompokkan per produk (`NusaMath/`, `NusaChem/`, dst.) plus `nusacerdas-logo/`. Nama file bebas (ada yang berspasi) — cocokkan persis.
- Pesan commit historis ditulis dalam bahasa Indonesia informal.
