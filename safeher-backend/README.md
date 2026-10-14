# SafeHer Backend (Express + MongoDB)

Campus-only safety app backend. Roles: **admin** and **user (female student)**.

## Run locally
1. `npm install`
2. Edit `.env` (a test one is included: admin `admin@college.edu` / `Admin@12345`, OTP is shown on screen because `DEV_SHOW_OTP=true`)
3. `npm start` -> http://localhost:5000  (`npm test` is not defined; run `node test_api.js` while the server is running)

## How accounts work
1. Student signs up with college email, phone, password, **college ID card photo** and a declaration.
2. A 6-digit OTP is emailed (Gmail SMTP). She must verify the email.
3. Admin sees the ID card in the dashboard and **approves or rejects**. The ID photo is deleted right after the decision.
4. Only approved students can sign in. Admin can block any account later (token stops working immediately).
5. The admin account is created from `ADMIN_EMAIL` / `ADMIN_PASSWORD` on server start.

## Complaints are anonymous
`models/Complaint.js` has no name/email/id field. Only a one-way HMAC key is stored so a student can see her own complaints and so we can rate-limit (5/day). No API returns it, and the admin dashboard cannot show who filed a complaint.

## Privacy rules enforced in code
- No stored location: `/api/location/update` only works during an active SOS and keeps it in memory for max 2 h (`utils/liveShare.js`).
- Walk-me-home is time-limited (max 120 min), the public link shows only the latest position and dies when she taps "I'm safe".
- No fake police / security responses, no fake "verified" rides, no fake buddies, no automatic labelling of people.
- Reports/escort/heatmap routes need an approved login. Reports store no identity.

## API summary
| Route | Who |
|---|---|
| POST /api/auth/signup, /verify-email, /resend-otp, /login, /forgot-password, /reset-password | public |
| POST /api/complaints, GET /api/complaints/mine | approved student |
| GET /api/admin/stats, /users, /users/:id/id-card, /complaints, /escorts; POST /users/:id/approve, /reject, /block; PATCH /complaints/:id, /escorts/:id | admin |
| /api/contacts, /api/sos/*, /api/nightout/*, /api/campus/*, /api/reports/* | approved student |

## Deploy on Render
Push this folder to GitHub, create a Web Service (or use `render.yaml`), and set the variables from `.env.example`. Set `NODE_ENV=production` and `DEV_SHOW_OTP=false`.
