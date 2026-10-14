#!/usr/bin/env bash
# One-command Android build. Needs: Node 20+, JDK 21, Android SDK (Android Studio).
set -e
[ -f .env.production ] && grep -q "your-safeher-backend" .env.production && { echo "Edit .env.production with your Render backend URL first."; exit 1; }
npm install
npm run build
[ -d android ] || npx cap add android
node scripts/patch-android.mjs
npx cap sync android
(cd android && ./gradlew assembleDebug)
echo "APK: android/app/build/outputs/apk/debug/app-debug.apk"
