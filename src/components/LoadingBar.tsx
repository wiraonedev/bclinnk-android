import React from 'react';
import { View, StyleSheet } from 'react-native';
import { APP_CONFIG } from '../config/appConfig';

interface LoadingBarProps {
  progress: number; // nilai 0 sampai 1
}

export const LoadingBar: React.FC<LoadingBarProps> = ({ progress }) => {
  // Hanya tampil jika progress antara 0% hingga 99%
  if (progress <= 0 || progress >= 1) {
    return null;
  }

  const widthPercentage = `${Math.min(Math.max(progress * 100, 5), 100)}%`;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.bar,
          {
            width: widthPercentage as any,
            backgroundColor: APP_CONFIG.colors.accent,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 3,
    width: '100%',
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 999,
  },
  bar: {
    height: '100%',
  },
});
