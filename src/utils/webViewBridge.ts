import { triggerNativeNotification } from '../services/notificationService';

export interface BridgeMessagePayload {
  type: 'NOTIFY' | 'SCHEDULE_NOTIFICATION' | 'REQUEST_PUSH_TOKEN';
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
  delaySeconds?: number;
}

/**
 * Script JavaScript yang di-inject ke dalam WebView (cm.bclinnk.com).
 * Menyediakan:
 * 1. window.BclinnkNative.notify(title, body, data)
 * 2. window.BclinnkNative.scheduleNotification(title, body, seconds, data)
 * 3. window.BclinnkNative.getPushToken()
 * 4. Polyfill otomatis untuk HTML5 `new Notification(title, options)`
 */
export const INJECTED_WEBVIEW_BRIDGE_JS = `
(function() {
  if (window.__BCLINNK_BRIDGE_INITIALIZED__) return;
  window.__BCLINNK_BRIDGE_INITIALIZED__ = true;
  window.__BCLINNK_PUSH_TOKEN__ = window.__BCLINNK_PUSH_TOKEN__ || null;

  function postToNative(payload) {
    try {
      if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      }
    } catch (_) {
      // Safe fallback jika context belum siap
    }
  }

  // 1. Helper Resmi untuk Website cm.bclinnk.com
  window.BclinnkNative = {
    notify: function(title, body, data) {
      postToNative({
        type: 'NOTIFY',
        title: String(title || 'Bclinnk CM'),
        body: String(body || ''),
        data: data && typeof data === 'object' ? data : {}
      });
    },
    scheduleNotification: function(title, body, delaySeconds, data) {
      postToNative({
        type: 'SCHEDULE_NOTIFICATION',
        title: String(title || 'Bclinnk CM'),
        body: String(body || ''),
        delaySeconds: Math.max(1, Math.floor(Number(delaySeconds) || 1)),
        data: data && typeof data === 'object' ? data : {}
      });
    },
    getPushToken: function() {
      postToNative({ type: 'REQUEST_PUSH_TOKEN' });
      return window.__BCLINNK_PUSH_TOKEN__;
    }
  };

  // 2. Polyfill Standar HTML5 Web Notification API agar kompatibel dengan Android WebView
  function CustomWebNotification(title, options) {
    var opts = (options && typeof options === 'object') ? options : {};
    this.title = String(title || 'Bclinnk CM');
    this.body = String(opts.body || '');
    this.data = (opts.data && typeof opts.data === 'object') ? opts.data : {};
    this.tag = opts.tag || '';
    this.icon = opts.icon || '';

    // Standard HTML5 Notification methods & handlers
    this.close = function() {};
    this.onclick = null;
    this.onerror = null;
    this.onclose = null;
    this.onshow = null;

    postToNative({
      type: 'NOTIFY',
      title: this.title,
      body: this.body,
      data: this.data
    });
  }

  CustomWebNotification.permission = 'granted';
  CustomWebNotification.maxActions = 2;
  CustomWebNotification.requestPermission = function(callback) {
    if (typeof callback === 'function') {
      try { callback('granted'); } catch (_) {}
    }
    return Promise.resolve('granted');
  };

  window.Notification = CustomWebNotification;

  // Minta token FCM dari native saat halaman dimuat
  postToNative({ type: 'REQUEST_PUSH_TOKEN' });
})();
true;
`;

/**
 * Menangani pesan yang dikirim dari WebView melalui window.ReactNativeWebView.postMessage
 */
export async function handleWebViewBridgeMessage(
  rawData: string,
  pushToken: string | null,
  injectJsToWebView: (jsCode: string) => void
): Promise<void> {
  try {
    const parsed: BridgeMessagePayload = JSON.parse(rawData);
    if (!parsed || typeof parsed.type !== 'string') return;

    switch (parsed.type) {
      case 'NOTIFY':
        await triggerNativeNotification(
          parsed.title || 'Bclinnk CM',
          parsed.body || '',
          parsed.data || {},
          0
        );
        break;

      case 'SCHEDULE_NOTIFICATION':
        await triggerNativeNotification(
          parsed.title || 'Bclinnk CM',
          parsed.body || '',
          parsed.data || {},
          parsed.delaySeconds || 1
        );
        break;

      case 'REQUEST_PUSH_TOKEN':
        if (pushToken) {
          const safeToken = JSON.stringify(pushToken);
          injectJsToWebView(`
            window.__BCLINNK_PUSH_TOKEN__ = ${safeToken};
            window.dispatchEvent(new CustomEvent('bclinnk:pushToken', { detail: { token: ${safeToken} } }));
            true;
          `);
        }
        break;
    }
  } catch {
    // Abaikan pesan postMessage non-JSON dari library pihak ketiga di dalam web
  }
}
