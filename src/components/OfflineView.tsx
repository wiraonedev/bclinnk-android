import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { APP_CONFIG } from '../config/appConfig';

interface OfflineViewProps {
  onRetry: () => void;
  errorMessage?: string;
}

export const OfflineView: React.FC<OfflineViewProps> = ({
  onRetry,
  errorMessage,
}) => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/BCLinnk-Logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>📡</Text>
      </View>
      <Text style={styles.title}>Koneksi Terputus</Text>
      <Text style={styles.description}>
        {errorMessage ||
          'Tidak dapat memuat halaman Channel Manager. Periksa koneksi internet Anda dan coba lagi.'}
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={onRetry}
        activeOpacity={0.8}
      >
        <Text style={styles.retryButtonText}>Coba Lagi</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: APP_CONFIG.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 900,
  },
  logo: {
    width: 200,
    height: 50,
    marginBottom: 20,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 36,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: APP_CONFIG.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: APP_CONFIG.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
