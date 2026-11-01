import { useEffect, useRef } from 'react';
import { BackHandler, ToastAndroid, Platform } from 'react-native';
import type { WebView } from 'react-native-webview';
import { APP_CONFIG } from '../config/appConfig';

interface UseBackButtonOptions {
  webViewRef: React.RefObject<WebView | null>;
  canGoBack: boolean;
}

/**
 * Custom hook untuk menangani tombol Back fisik pada Android
 * - Navigasi mundur pada history WebView jika ada
 * - Double tap back dengan Toast info untuk keluar aplikasi jika berada di halaman awal
 */
export function useBackButton({ webViewRef, canGoBack }: UseBackButtonOptions) {
  const lastBackPressedRef = useRef<number>(0);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onBackPress = () => {
      // 1. Jika masih ada riwayat halaman sebelumnya di WebView, kembali ke halaman tersebut
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }

      // 2. Jika sudah di halaman paling awal, terapkan double-tap to exit
      const now = Date.now();
      if (now - lastBackPressedRef.current < APP_CONFIG.doubleBackExitDelayMs) {
        BackHandler.exitApp();
        return true;
      }

      lastBackPressedRef.current = now;
      ToastAndroid.show('Tekan sekali lagi untuk keluar', ToastAndroid.SHORT);
      return true;
    };

    const backSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    return () => {
      backSubscription.remove();
    };
  }, [canGoBack, webViewRef]);
}
