import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { APP_CONFIG } from '../config/appConfig';
import { handleNavigationRequest } from '../utils/urlHandler';
import {
  INJECTED_WEBVIEW_BRIDGE_JS,
  handleWebViewBridgeMessage,
} from '../utils/webViewBridge';
import { useBackButton } from '../hooks/useBackButton';
import { useNotifications } from '../hooks/useNotifications';
import { LoadingBar } from './LoadingBar';
import { OfflineView } from './OfflineView';

export const BclinnkWebView: React.FC = () => {
  const webViewRef = useRef<WebView>(null);
  const [currentUri, setCurrentUri] = useState<string>(APP_CONFIG.initialUrl);
  const [canGoBack, setCanGoBack] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Hook penanganan tombol Back fisik Android
  useBackButton({
    webViewRef,
    canGoBack,
  });

  const injectJsToWebView = useCallback((jsCode: string) => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(jsCode);
    }
  }, []);

  // Hook inisialisasi Push Notification & Deep Navigation saat notifikasi di-tap
  const handleNavigateFromNotification = useCallback((targetUrl: string) => {
    setHasError(false);
    setCurrentUri((prev) => {
      if (prev === targetUrl && webViewRef.current) {
        webViewRef.current.reload();
      }
      return targetUrl;
    });
  }, []);

  const { pushToken } = useNotifications({
    onNavigateToUrl: handleNavigateFromNotification,
  });

  // Sinkronisasi pushToken ke WebView saat token siap
  useEffect(() => {
    if (pushToken && webViewRef.current) {
      const safeToken = JSON.stringify(pushToken);
      injectJsToWebView(`
        window.__BCLINNK_PUSH_TOKEN__ = ${safeToken};
        try {
          window.dispatchEvent(new CustomEvent('bclinnk:pushToken', { detail: { token: ${safeToken} } }));
        } catch (_) {}
        true;
      `);
    }
  }, [pushToken, injectJsToWebView]);

  const handleRetry = useCallback(() => {
    setHasError(false);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setHasError(false);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
    // Timeout reset refresh indicator
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  }, []);

  return (
    <View style={styles.container}>
      {/* Progress Loading Bar */}
      <LoadingBar progress={progress} />

      {/* WebView Wrapper */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[APP_CONFIG.colors.primary]}
          />
        }
      >
        <WebView
          ref={webViewRef}
          source={{ uri: currentUri }}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          thirdPartyCookiesEnabled={true}
          sharedCookiesEnabled={true}
          cacheEnabled={true}
          cacheMode="LOAD_DEFAULT"
          allowFileAccess={true}
          setSupportMultipleWindows={false}
          scalesPageToFit={false}
          mixedContentMode="compatibility"
          userAgent={APP_CONFIG.customUserAgent}
          allowsBackForwardNavigationGestures={true}
          injectedJavaScriptBeforeContentLoaded={INJECTED_WEBVIEW_BRIDGE_JS}
          injectedJavaScript={INJECTED_WEBVIEW_BRIDGE_JS}
          onMessage={({ nativeEvent }) => {
            handleWebViewBridgeMessage(
              nativeEvent.data,
              pushToken,
              injectJsToWebView
            );
          }}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={APP_CONFIG.colors.primary} />
            </View>
          )}
          onLoadProgress={({ nativeEvent }) => {
            setProgress(nativeEvent.progress);
          }}
          onNavigationStateChange={(state) => {
            setCanGoBack(state.canGoBack);
            if (!state.loading) {
              setIsRefreshing(false);
            }
          }}
          onShouldStartLoadWithRequest={(request) => {
            // Evaluasi URL
            handleNavigationRequest(request.url).then((shouldLoad) => {
              if (!shouldLoad && webViewRef.current) {
                webViewRef.current.stopLoading();
              }
            });
            return true;
          }}
          onError={(_syntheticEvent) => {
            setHasError(true);
            setIsRefreshing(false);
          }}
          onHttpError={(syntheticEvent) => {
            const { statusCode } = syntheticEvent.nativeEvent;
            if (statusCode >= 400) {
              setHasError(true);
            }
            setIsRefreshing(false);
          }}
        />
      </ScrollView>

      {/* Tampilan Error Offline jika terjadi kegagalan jaringan */}
      {hasError && <OfflineView onRetry={handleRetry} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_CONFIG.colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: APP_CONFIG.colors.background,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: APP_CONFIG.colors.background,
    zIndex: 10,
  },
});
