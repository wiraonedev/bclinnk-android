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
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify(payload));
    }
  }

  // 1. Helper Resmi untuk Website cm.bclinnk.com
  window.BclinnkNative = {
    notify: function(title, body, data) {
      postToNative({
        type: 'NOTIFY',
        title: String(title || 'Bclinnk CM'),
        body: String(body || ''),
        data: data || {}
      });
    },
    scheduleNotification: function(title, body, delaySeconds, data) {
      postToNative({
        type: 'SCHEDULE_NOTIFICATION',
        title: String(title || 'Bclinnk CM'),
        body: String(body || ''),
        delaySeconds: Number(delaySeconds) || 1,
        data: data || {}
      });
    },
    getPushToken: function() {
      postToNative({ type: 'REQUEST_PUSH_TOKEN' });
      return window.__BCLINNK_PUSH_TOKEN__;
    }
  };

  // 2. Polyfill HTML5 Web Notification API agar mendukung Android WebView
  function CustomWebNotification(title, options) {
    var opts = options || {};
    this.title = title;
    this.body = opts.body || '';
    this.data = opts.data || {};
    postToNative({
      type: 'NOTIFY',
      title: String(title || 'Bclinnk CM'),
      body: String(this.body),
      data: this.data
    });
  }
  CustomWebNotification.permission = 'granted';
  CustomWebNotification.requestPermission = function(callback) {
    if (typeof callback === 'function') callback('granted');
    return Promise.resolve('granted');
  };
  window.Notification = CustomWebNotification;

  // Minta token saat halaman selesai dimuat
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
