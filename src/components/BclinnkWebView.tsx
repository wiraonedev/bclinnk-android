import React, { useRef, useState, useCallback } from 'react';
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
import { useBackButton } from '../hooks/useBackButton';
import { LoadingBar } from './LoadingBar';
import { OfflineView } from './OfflineView';

export const BclinnkWebView: React.FC = () => {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Hook penanganan tombol Back fisik Android
  useBackButton({
    webViewRef,
    canGoBack,
  });

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
          source={{ uri: APP_CONFIG.initialUrl }}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          thirdPartyCookiesEnabled={true}
          sharedCookiesEnabled={true}
          setSupportMultipleWindows={false}
          scalesPageToFit={false}
          mixedContentMode="compatibility"
          userAgent={APP_CONFIG.customUserAgent}
          allowsBackForwardNavigationGestures={true}
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
