import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { initializeNotifications } from '../services/notificationService';
import { isInternalUrl } from '../utils/urlHandler';

interface UseNotificationsOptions {
  onNavigateToUrl?: (targetUrl: string) => void;
}

/**
 * Custom hook untuk mengelola siklus hidup Push Notification:
 * - Meminta izin Android 13+ & membuat Notification Channel
 * - Mendengarkan aksi tap pada notifikasi untuk membuka halaman terkait di WebView (Deep Navigation)
 */
export function useNotifications({ onNavigateToUrl }: UseNotificationsOptions = {}) {
  const [pushToken, setPushToken] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // 1. Inisialisasi izin & ambil token
    initializeNotifications().then((token) => {
      if (isMounted && token) {
        setPushToken(token);
      }
    });

    // 2. Listener saat pengguna men-tap notifikasi di status bar Android
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as
          | Record<string, unknown>
          | undefined;
        const targetUrl = typeof data?.url === 'string' ? data.url : null;

        if (targetUrl && isInternalUrl(targetUrl) && onNavigateToUrl) {
          onNavigateToUrl(targetUrl);
        }
      });

    return () => {
      isMounted = false;
      responseSubscription.remove();
    };
  }, [onNavigateToUrl]);

  return { pushToken };
}
