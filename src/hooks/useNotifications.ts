import { useEffect, useState, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { initializeNotifications } from '../services/notificationService';
import { isInternalUrl } from '../utils/urlHandler';
import { APP_CONFIG } from '../config/appConfig';

interface UseNotificationsOptions {
  onNavigateToUrl?: (targetUrl: string) => void;
}

/**
 * Custom hook untuk mengelola siklus hidup Push Notification:
 * - Meminta izin Android 13+ & membuat Notification Channel
 * - Mendengarkan aksi tap pada notifikasi untuk membuka halaman terkait di WebView (Deep Navigation)
 * - Menangani tap notifikasi saat aplikasi dibuka dari kondisi mati (Cold Start)
 */
export function useNotifications({ onNavigateToUrl }: UseNotificationsOptions = {}) {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const onNavigateRef = useRef(onNavigateToUrl);

  useEffect(() => {
    onNavigateRef.current = onNavigateToUrl;
  }, [onNavigateToUrl]);

  useEffect(() => {
    let isMounted = true;

    // Helper untuk mengekstrak dan memvalidasi URL dari payload notifikasi
    const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
      const data = response?.notification?.request?.content?.data as
        | Record<string, unknown>
        | undefined;
      const rawUrl = typeof data?.url === 'string' ? data.url.trim() : null;
      if (!rawUrl || !onNavigateRef.current) return;

      let resolvedUrl = rawUrl;
      if (rawUrl.startsWith('/')) {
        try {
          resolvedUrl = new URL(rawUrl, APP_CONFIG.initialUrl).toString();
        } catch {
          resolvedUrl = `${APP_CONFIG.initialUrl}${rawUrl.replace(/^\/+/, '')}`;
        }
      }

      if (isInternalUrl(resolvedUrl)) {
        onNavigateRef.current(resolvedUrl);
      }
    };

    // 1. Inisialisasi izin & ambil token FCM
    initializeNotifications().then((token) => {
      if (isMounted && token) {
        setPushToken(token);
      }
    });

    // 2. Periksa apakah aplikasi dibuka dari notifikasi saat status mati (Cold Start)
    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (isMounted && response) {
          handleNotificationResponse(response);
        }
      })
      .catch((err) => {
        console.warn('Gagal membaca last notification response:', err);
      });

    // 3. Listener saat pengguna men-tap notifikasi (Background / Foreground)
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        handleNotificationResponse(response);
      });

    return () => {
      isMounted = false;
      responseSubscription.remove();
    };
  }, []);

  return { pushToken };
}
