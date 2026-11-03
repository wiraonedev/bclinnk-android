const fs = require('fs');
const path = require('path');

/**
 * Konfigurasi Dinamis Expo (app.config.js)
 * Otomatis mendeteksi keberadaan google-services.json untuk Remote FCM Push Notification.
 * Jika file belum tersedia, build Android di GitHub Actions tetap berjalan mulus tanpa error.
 */
module.exports = ({ config }) => {
  const googleServicesPath = path.resolve(__dirname, 'google-services.json');
  const hasGoogleServices = fs.existsSync(googleServicesPath);

  return {
    ...config,
    android: {
      ...config.android,
      ...(hasGoogleServices
        ? { googleServicesFile: './google-services.json' }
        : {}),
    },
  };
};
