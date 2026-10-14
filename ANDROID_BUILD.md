# SafeHer: Android App (APK) Guide

React frontend is wrapped into an Android app with **Capacitor**. The Express backend is deployed on **Render** and the app calls it over HTTPS.

## 1. Deploy the backend (Render)
1. Push `safeher-backend/` to your GitHub, then Render > New > Web Service (or use `render.yaml`).
2. Set variables from `safeher-backend/.env.example`: `MONGO_URI`, `JWT_SECRET`, `COLLEGE_NAME`, **`ADMIN_EMAIL` + `ADMIN_PASSWORD`**, `SMTP_USER` + `SMTP_PASS` (Gmail App Password), `NODE_ENV=production`.
3. Open `https://<your-service>.onrender.com/api/health`. It should say healthy.

## 2. Build the APK (PC with Node 20+, JDK 21, Android Studio/SDK)
1. Edit `.env.production`: `VITE_API_BASE_URL=<your Render URL>` and `VITE_COLLEGE_NAME=<your college>`
2. Run `./build-apk.sh` (Windows: `build-apk.bat`)
3. APK: `android/app/build/outputs/apk/debug/app-debug.apk`. Copy it to the phone and install.

## 3. First use
- Admin signs in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` and sees the **Admin Dashboard** (Approvals, Complaints, Escorts, Students).
- Students sign up, verify email OTP, wait for approval. The red **COMPLAINT BOX** tab is on the right edge of every student screen.

## Local testing (no phone)
`npm install && npm install --prefix safeher-backend && npm run dev`, then open http://localhost:3000. Test admin: `admin@college.edu` / `Admin@12345` (OTP appears on screen in test mode).

## Notes
- Sample campus area names are in `src/utils/campusData.js`; replace them with your college's real places.
- Release / Play Store: Android Studio > Build > Generate Signed Bundle.
