# Bclinnk Android WebView App (React Native)

Aplikasi Android WebView wrapper berbasis React Native & Expo untuk platform reservasi kamar dan properti **Bclinnk** (dengan default konfigurasi grup **Bali Cabin**).

Aplikasi ini dirancang khusus untuk menangani tantangan WebView pada alur booking hotel/kamar:
- **Google reCAPTCHA v2 support** (User-Agent Mobile Chrome standar & persistent session cookies).
- **Penanganan Link `target="_blank"`** (tidak macet saat klik "View Rooms").
- **Pembayaran Aman & Deep Linking** (dukungan redirect bank 3D-Secure, QRIS, GoPay, OVO, Dana, ShopeePay via `Linking.openURL()`).
- **In-App Browser (Chrome Custom Tabs)** untuk membuka website eksternal (website hotel, media sosial) tanpa keluar dari alur pemesanan.
- **Android Back Button** (mundur riwayat halaman WebView dan double-tap untuk keluar aplikasi).
- **Resilience & Offline Screen** (tampilan error offline yang ramah pengguna dengan tombol Coba Lagi).
- **100% Free Cloud Build** via GitHub Actions (menghasilkan file `.apk` tanpa perlu install Android Studio di komputer lokal).

---

## 🚀 Panduan Build APK Gratis Menggunakan GitHub Actions

Anda tidak perlu menginstall Android Studio atau SDK di laptop. Cukup manfaatkan GitHub Actions (gratis & unlimited untuk public repo):

### Langkah 1: Buat Git Repository & Push ke GitHub
```bash
git init
git add .
git commit -m "feat: initial commit base project bclinnk webview"
git branch -M main
git remote add origin https://github.com/<USERNAME-ANDA>/<NAMA-REPO-ANDA>.git
git push -u origin main
```

### Langkah 2: Jalankan Build APK di GitHub
1. Buka repository Anda di browser GitHub.
2. Klik tab **Actions** di bagian atas.
3. Di sisi kiri, klik workflow **"Build Android APK"**.
4. Klik tombol dropdown **Run workflow** (di sebelah kanan).
5. Pilih branch `main` dan pilih jenis APK (`debug` untuk testing instan tanpa sign, atau `release`).
6. Klik tombol hijau **Run workflow**.

### Langkah 3: Unduh File APK
1. Tunggu proses build selesai (~5-8 menit).
2. Klik pada hasil eksekusi workflow yang telah bercentang hijau.
3. Gulir ke bawah ke bagian **Artifacts**.
4. Klik **`bclinnk-android-apk`** untuk mengunduh file `.zip` yang berisi file `.apk`.
5. Ekstrak zip tersebut dan kirimkan file `.apk` ke HP Android Anda untuk diinstall!

---

## ⚙️ Mengubah Target URL (Dinamis)

Aplikasi ini dirancang modular. Jika Anda ingin mengarahkan WebView ke properti lain atau halaman utama portal Bclinnk:
1. Buka file [`src/config/appConfig.ts`](file:///Users/raiwirawan/Desktop/MAGANG_BC_SOLUTIONS_2026/WEBSITE_DEVELOPMENT/November/01-11-2026-membuat-aplikasi-android-bclinnk/src/config/appConfig.ts).
2. Ubah baris `initialUrl`:
   ```typescript
   export const APP_CONFIG = {
     appName: 'Bclinnk',
     initialUrl: 'https://booking.bclinnk.com/booking-group2.php?id=bali-cabin', // Ganti dengan URL baru
     // ...
   };
   ```

---

## 📂 Struktur Direktori Proyek

```
├── .github/
│   └── workflows/
│       └── build-apk.yml        # CI/CD otomatisasi build APK Android
├── assets/                      # Icon, Splash Screen, Adaptive Icon
├── src/
│   ├── components/
│   │   ├── BclinnkWebView.tsx   # Komponen utama WebView wrapper
│   │   ├── LoadingBar.tsx       # Indikator loading halus di atas
│   │   └── OfflineView.tsx      # Halaman saat koneksi internet terputus
│   ├── config/
│   │   └── appConfig.ts         # Konfigurasi URL dan tema
│   ├── hooks/
│   │   ├── useBackButton.ts     # Penanganan tombol Back Android
│   └── utils/
│       └── urlHandler.ts        # Klasifikasi link internal, eksternal, & deep link
├── App.tsx                      # Entry point React Native
├── app.json                     # Konfigurasi package ID (com.bclinnk.app) & Expo
└── package.json
```
