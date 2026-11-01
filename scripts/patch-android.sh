#!/usr/bin/env bash
set -euo pipefail

echo "=== Menjalankan Patch Kompatibilitas Android & Compose Compiler ==="

# 1. Pastikan expo-modules-core menggunakan Compose Compiler 1.5.14 yang cocok dengan Kotlin 1.9.24
if [ -f node_modules/expo-modules-core/android/build.gradle ]; then
  echo "Memperbarui Compose Compiler di expo-modules-core..."
  sed -i 's/"1.5.15"/"1.5.14"/g' node_modules/expo-modules-core/android/build.gradle || true
fi

# 2. Tambahkan suppress check ke build.gradle untuk semua subproject Kotlin
if [ -f android/build.gradle ]; then
  echo "Menyuntikkan suppressKotlinVersionCompatibilityCheck ke android/build.gradle..."
  cat << 'EOF' >> android/build.gradle

allprojects {
    tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
        kotlinOptions {
            freeCompilerArgs += [
                "-P",
                "plugin:androidx.compose.compiler.plugins.kotlin:suppressKotlinVersionCompatibilityCheck=true"
            ]
        }
    }
}
EOF
fi

echo "=== Patch Selesai ==="
