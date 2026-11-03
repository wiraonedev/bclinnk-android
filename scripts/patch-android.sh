#!/usr/bin/env bash
set -euo pipefail

echo "=== Menjalankan Patch Kompatibilitas Android & Offline Bundle ==="

# 1. Pastikan expo-modules-core menggunakan Compose Compiler 1.5.14 yang cocok dengan Kotlin 1.9.24
if [ -f node_modules/expo-modules-core/android/build.gradle ]; then
  echo "Memperbarui Compose Compiler di expo-modules-core..."
  sed -i 's/"1.5.15"/"1.5.14"/g' node_modules/expo-modules-core/android/build.gradle || true
fi

# 2. Patch NetInfoModule untuk menghilangkan warning deprecated [removal] onCatalystInstanceDestroy
NETINFO_FILE="node_modules/@react-native-community/netinfo/android/src/main/java/com/reactnativecommunity/netinfo/NetInfoModule.java"
if [ -f "$NETINFO_FILE" ]; then
  echo "Menambahkan @SuppressWarnings(\"removal\") ke NetInfoModule.java..."
  node -e "
    const fs = require('fs');
    const p = '$NETINFO_FILE';
    let c = fs.readFileSync(p, 'utf8');
    if (!c.includes('@SuppressWarnings(\"removal\")')) {
      c = c.replace('public void onCatalystInstanceDestroy()', '@SuppressWarnings(\"removal\")\n    public void onCatalystInstanceDestroy()');
      fs.writeFileSync(p, c);
    }
  " || true
fi

# 3. Tambahkan suppress check & suppress compiler warnings ke build.gradle untuk semua subproject Kotlin
if [ -f android/build.gradle ]; then
  echo "Menyuntikkan suppress warnings & Kotlin compatibility ke android/build.gradle..."
  cat << 'EOF' >> android/build.gradle

allprojects {
    tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
        kotlinOptions {
            suppressWarnings = true
            freeCompilerArgs += [
                "-P",
                "plugin:androidx.compose.compiler.plugins.kotlin:suppressKotlinVersionCompatibilityCheck=true"
            ]
        }
    }
}
EOF
fi

# 4. Konfigurasi Standalone Offline Bundle & Signing agar APK berjalan mandiri (tanpa butuh Metro / PC)
if [ -f android/app/build.gradle ]; then
  echo "Mengonfigurasi Standalone Offline Bundle & Signing di android/app/build.gradle..."
  cat << 'EOF' >> android/app/build.gradle

// Pastikan JavaScript di-bundle offline ke dalam APK (berfungsi mandiri tanpa server Metro)
react {
    debuggableVariants = []
}

android {
    signingConfigs {
        release {
            initWith(signingConfigs.debug)
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
        debug {
            signingConfig signingConfigs.debug
        }
    }
}
EOF
fi

echo "=== Patch Selesai ==="
