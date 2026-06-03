# Get a Live Link (Not Just GitHub)

**GitHub stores your code.** It does **not** run Node.js apps.

Your repo: https://github.com/Thanigaiselvam/heew-attendance-tracker

To get a working URL like `https://heew-attendance.onrender.com`, deploy on **Render** (free).

---

## Step 1 — Push code to GitHub

```powershell
cd c:\Projects\final
git remote remove origin
git remote add origin https://github.com/Thanigaiselvam/heew-attendance-tracker.git
git add .
git commit -m "Prepare for Render deployment"
git branch -M main
git push -u origin main
```

> No space in the URL: `https://github.com/...` not `https:// github.com/...`

---

## Step 2 — Deploy on Render

1. Open https://render.com and sign up with **GitHub**.
2. Click **New +** → **Web Service**.
3. Connect repo **Thanigaiselvam/heew-attendance-tracker**.
4. Settings:

| Field | Value |
|-------|--------|
| Name | `heew-attendance` |
| Region | closest to you |
| Branch | `main` |
| Runtime | **Node** |
| Build Command | `npm run render-build` |
| Start Command | `npm start` |
| Plan | Free |

5. **Environment** → Add variables:

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | any long random string (32+ characters) |
| `ADMIN_EMAIL` | your admin email |
| `ADMIN_PASSWORD` | a strong password |

6. Click **Create Web Service** and wait ~5–10 minutes.

7. Your live link: **https://heew-attendance.onrender.com** (or the URL Render shows).

---

## Step 3 — Test the live app

- Open the Render URL in a browser.
- **Admin** tab → login with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
- Add employees under **Employees**.

---

## Why GitHub Pages does not work

This app needs **Node.js + SQLite + API**. GitHub Pages only hosts static HTML. Use **Render**, **Railway**, or **Fly.io** instead.

---

## If deploy fails on Render

1. Open Render → your service → **Logs**.
2. Common fixes:
   - Build failed → check **Build Command** is `npm run render-build`
   - App crashes → ensure `JWT_SECRET` is set
3. Redeploy: **Manual Deploy** → **Deploy latest commit**
