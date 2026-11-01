/**
 * Konfigurasi Utama Aplikasi Android WebView Bclinnk
 * Ubah URL di sini untuk mengarahkan ke halaman grup properti lain atau halaman utama portal.
 */
export const APP_CONFIG = {
  // Nama aplikasi
  appName: 'Bclinnk',

  // URL awal yang akan dimuat oleh WebView
  initialUrl: 'https://booking.bclinnk.com/booking-group2.php?id=bali-cabin',

  // Domain internal yang diperbolehkan tetap dibuka di dalam WebView
  allowedDomains: [
    'booking.bclinnk.com',
    'bclinnk.com',
    'payku.php', // sub-path payment payku internal
  ],

  // User-Agent standar Chrome Mobile untuk memastikan kompatibilitas reCAPTCHA & responsive viewport
  customUserAgent:
    'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36 BclinnkApp/1.0',

  // Durasi jendela waktu (dalam milidetik) untuk menekan tombol Back kedua kali sebelum keluar aplikasi
  doubleBackExitDelayMs: 2000,

  // Warna tema aplikasi
  colors: {
    primary: '#1E3A8A', // Deep Blue
    accent: '#3B82F6',
    background: '#FFFFFF',
    text: '#1F2937',
    error: '#EF4444',
  },
};
