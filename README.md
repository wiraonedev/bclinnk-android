# Bclinnk CM - Android WebView App (React Native)

Aplikasi Android WebView wrapper berbasis React Native & Expo untuk portal **Bclinnk Channel Manager (Extranet)** (`https://cm.bclinnk.com/`).

Aplikasi ini dirancang khusus untuk operasional staf dan pengelola hotel/properti:
- **Target Portal**: `https://cm.bclinnk.com/` (Channel Manager & Operasional Kamar).
- **Persistent Session & Caching**: Sesi login dan cookies disimpan secara persisten sehingga pengguna tidak perlu login berulang kali setiap membuka aplikasi.
- **Dukungan Unduh Laporan**: Link ekspor laporan (Excel, PDF, CSV) otomatis dialihkan ke Download Manager native Android.
- **Dukungan Unggah Berkas & Kamera**: Mendukung `<input type="file">` untuk unggah foto properti atau dokumen dengan izin kamera dan penyimpanan Android.
- **In-App Browser (Chrome Custom Tabs)** untuk membuka tautan eksternal (OTA eksternal, WhatsApp, portal bank) tanpa menutup aplikasi.
- **Android Back Button**: Navigasi mundur riwayat WebView dan proteksi double-tap untuk keluar aplikasi.
- **Resilience & Offline Screen**: Tampilan offline yang ramah pengguna dengan tombol Coba Lagi jika koneksi internet terputus.
- **Hybrid Push Notification (`expo-notifications`)**: Mendukung notifikasi Android native via WebView JS Bridge (`window.BclinnkNative.notify`), polyfill otomatis HTML5 `new Notification()`, Deep Navigation saat notifikasi di-tap, serta siap dihubungkan ke Firebase Cloud Messaging (`google-services.json`).
- **100% Free Cloud Build**: Dibuat langsung menjadi file `.apk` standalone yang siap di-install (*sideload*) melalui GitHub Actions tanpa butuh Android Studio lokal.

---

## 🔔 Cara Menggunakan Fitur Push Notification dari Website (`cm.bclinnk.com`)

Aplikasi ini telah menyuntikkan jembatan JavaScript (*JS Bridge*) ke dalam halaman `cm.bclinnk.com`:

### 1. Memicu Notifikasi Langsung dari Kode Web / Console
```javascript
// Cara A: Menggunakan helper resmi BclinnkNative
window.BclinnkNative.notify(
  'Reservasi Baru Masuk!',
  'Kamar Deluxe - Check-in 15 Nov',
  { url: 'https://cm.bclinnk.com/' } // Opsional: URL tujuan saat notifikasi di-tap
);

// Cara B: Menggunakan standar HTML5 Web Notification (otomatis di-polyfill ke Android Native)
new Notification('Booking Baru #INV-001', {
  body: 'Tamu: Budi Santoso (2 Malam)',
  data: { url: 'https://cm.bclinnk.com/' }
});
```

### 2. Mengaktifkan Remote FCM (Saat Aplikasi Ditutup Total)
Secara default, build GitHub Actions tetap berjalan lancar meskipun belum ada file `google-services.json`. Jika tim backend siap mengirim Remote Push via Firebase:
1. Buat project di [Firebase Console](https://console.firebase.google.com/) dan daftarkan aplikasi Android dengan package ID **`com.bclinnk.app`**.
2. Unduh file **`google-services.json`** dan letakkan di folder utama (root) repositori ini.
3. File [`app.config.js`](file:///Users/raiwirawan/Desktop/MAGANG_BC_SOLUTIONS_2026/WEBSITE_DEVELOPMENT/November/01-11-2026-membuat-aplikasi-android-bclinnk/app.config.js) akan otomatis mendeteksinya saat proses build.
4. Di sisi web `cm.bclinnk.com`, ambil token perangkat menggunakan `window.BclinnkNative.getPushToken()` untuk disimpan ke database user hotel.

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
