import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { APP_CONFIG } from '../config/appConfig';

export const ANDROID_CHANNEL_ID = 'bclinnk-cm-alerts';

/**
 * Konfigurasi agar notifikasi tetap muncul sebagai Pop-up Banner (Heads-up)
 * beserta suara meskipun aplikasi sedang terbuka di layar (Foreground)
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Inisialisasi Channel Android & Meminta Izin Notifikasi (Android 13+)
 * Mengembalikan Device Push Token (FCM) jika Firebase sudah dikonfigurasi
 */
export async function initializeNotifications(): Promise<string | null> {
  try {
    // 1. Buat Notification Channel Prioritas Tinggi untuk Android 8.0+
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
        name: 'Notifikasi Operasional & Reservasi',
        description: 'Pemberitahuan booking baru, pembatalan, dan update Channel Manager',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: APP_CONFIG.colors.primary,
        enableVibrate: true,
        enableLights: true,
        showBadge: true,
      });
    }

    // 2. Cek dan minta izin POST_NOTIFICATIONS pada perangkat fisik
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Izin Push Notification belum diberikan oleh pengguna.');
        return null;
      }

      // 3. Coba ambil Native Device Push Token (FCM) jika google-services.json tersedia
      try {
        const tokenData = await Notifications.getDevicePushTokenAsync();
        return tokenData.data;
      } catch {
        // Normal jika google-services.json belum dipasang; mode Local & WebView Bridge tetap aktif
        return null;
      }
    }
  } catch (err) {
    console.warn('Gagal menginisialisasi sistem notifikasi:', err);
  }

  return null;
}

/**
 * Memicu Notifikasi Native Android (Instan atau Terjadwal)
 */
export async function triggerNativeNotification(
  title: string,
  body: string,
  data: Record<string, unknown> = {},
  delaySeconds = 0
): Promise<string | null> {
  try {
    const trigger: Notifications.NotificationTriggerInput =
      delaySeconds > 0
        ? {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: delaySeconds,
            channelId: ANDROID_CHANNEL_ID,
          }
        : null;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: title || APP_CONFIG.appName,
        body: body || '',
        data,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger,
    });

    return notificationId;
  } catch (err) {
    console.warn('Gagal memunculkan notifikasi native:', err);
    return null;
  }
}
