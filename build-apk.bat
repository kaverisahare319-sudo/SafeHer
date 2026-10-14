@echo off
findstr /C:"your-safeher-backend" .env.production >nul && (echo Edit .env.production with your Render backend URL first. & exit /b 1)
call npm install || exit /b 1
call npm run build || exit /b 1
if not exist android call npx cap add android
node scripts\patch-android.mjs || exit /b 1
call npx cap sync android || exit /b 1
cd android && call gradlew.bat assembleDebug || exit /b 1
echo APK: android\app\build\outputs\apk\debug\app-debug.apk
