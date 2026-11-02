import { Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { APP_CONFIG } from '../config/appConfig';

/**
 * Memeriksa apakah URL merupakan domain internal bclinnk (*.bclinnk.com)
 */
export function isInternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    return APP_CONFIG.allowedDomains.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

/**
 * Memeriksa apakah URL merupakan berkas unduhan/laporan (Excel, PDF, CSV, dll)
 */
export function isDownloadableFile(url: string): boolean {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.toLowerCase();
    const downloadExtensions = [
      '.xlsx',
      '.xls',
      '.pdf',
      '.csv',
      '.zip',
      '.doc',
      '.docx',
    ];
    return downloadExtensions.some((ext) => pathname.endsWith(ext));
  } catch {
    return false;
  }
}

/**
 * Memeriksa apakah URL merupakan skema native / deep link
 */
export function isCustomScheme(url: string): boolean {
  const customSchemes = [
    'tel:',
    'mailto:',
    'whatsapp:',
    'intent:',
    'gojek:',
    'shopeepay:',
    'dana:',
    'ovo:',
    'market:',
  ];
  const lowerUrl = url.toLowerCase();
  return customSchemes.some((scheme) => lowerUrl.startsWith(scheme));
}

/**
 * Menangani navigasi request WebView.
 * Return true: Izinkan WebView me-load URL
 * Return false: Intercept dan tangani via native linking / In-App Browser
 */
export async function handleNavigationRequest(url: string): Promise<boolean> {
  if (!url || url === 'about:blank') {
    return true;
  }

  // 1. Tangani Skema Khusus (Telepon, Email, WhatsApp, E-Wallet)
  if (isCustomScheme(url)) {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        // Fallback untuk intent:// jika aplikasi tidak terinstall
        if (url.startsWith('intent:')) {
          const fallbackUrlMatch = url.match(/browser_fallback_url=([^;]+)/);
          if (fallbackUrlMatch && fallbackUrlMatch[1]) {
            const fallbackUrl = decodeURIComponent(fallbackUrlMatch[1]);
            await WebBrowser.openBrowserAsync(fallbackUrl);
          }
        }
      }
    } catch (err) {
      console.warn('Gagal membuka native scheme URL:', url, err);
    }
    return false;
  }

  // 2. Tangani Unduhan Berkas / Laporan (Excel, PDF, CSV, dll ke Download Manager)
  if (isDownloadableFile(url)) {
    try {
      await Linking.openURL(url);
    } catch (err) {
      console.warn('Gagal membuka berkas unduhan via native linking:', url, err);
    }
    return false;
  }

  // 3. Tangani Domain Internal Bclinnk (Tetap di dalam WebView)
  if (isInternalUrl(url)) {
    return true;
  }

  // 4. Tangani Domain Eksternal (buka via Chrome Custom Tabs In-App Browser)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      await WebBrowser.openBrowserAsync(url, {
        toolbarColor: APP_CONFIG.colors.primary,
        showTitle: true,
        enableBarCollapsing: true,
      });
    } catch (err) {
      console.warn('Gagal membuka in-app browser:', url, err);
    }
    return false;
  }

  return true;
}
