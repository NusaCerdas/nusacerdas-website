# Cara Deploy NusaCerdas Website

Panduan deploy perubahan terbaru dari GitHub ke server produksi.

> **Sebelum mulai:** pastikan perubahan sudah di-commit dan di-push ke branch `main` di GitHub.

---

## 1. Sambungkan VPN

1. Buka **WireGuard**.
2. Sambungkan (activate) VPN.

## 2. Masuk ke server lewat PuTTY

3. Buka **PuTTY**.
4. Pilih sesi **VPN Anyboard** → klik **Load** → **Open**.
5. Login sebagai:
   ```
   login as: root
   ```

## 3. Masuk ke server alpha

6. Jalankan:
   ```bash
   cd /home
   cd /ssh
   ./alpha.sh
   ```
7. Setelah masuk ke root alpha, pindah ke user `aqso`:
   ```bash
   su aqso
   ```

## 4. Masuk ke folder website

8. Pindah ke home directory, lalu cek isinya:
   ```bash
   cd ~
   ls
   ```
   Harus ada folder `prod-nusacerdas-website`.
9. Masuk ke folder tersebut:
   ```bash
   cd prod-nusacerdas-website
   ```

## 5. Tarik perubahan terbaru

10. Ambil info terbaru dari GitHub:
    ```bash
    git fetch
    ```
11. Cek riwayat commit (tekan `q` untuk keluar):
    ```bash
    git log
    ```
12. Tarik perubahan:
    ```bash
    git pull
    ```

Selesai — buka https://nusacerdas.id untuk memastikan perubahan sudah tampil (gunakan hard refresh `Ctrl + F5` bila masih tampil versi lama).

---

## Ringkasan Cepat

```bash
# WireGuard ON → PuTTY "VPN Anyboard" → Load → login: root
cd /home
cd /ssh
./alpha.sh
su aqso
cd ~
cd prod-nusacerdas-website
git fetch
git log
git pull
```
