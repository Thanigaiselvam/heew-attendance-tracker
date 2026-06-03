# HEEW Attendance Tracker

Web-based employee attendance and work-hour tracking for small teams. Employees check in, take breaks, and log out; administrators monitor attendance, manage employees, and generate payroll summaries.

## Features

### Employee
- Sign in with email
- Check in, take break, resume work, final logout
- Attendance history
- Daily and monthly work summaries
- Days worked tracking
- Live work status

### Admin
- Password-protected login
- Dashboard overview
- Employee management and hourly rates
- Attendance monitoring and session logs
- Monthly reports and payroll calculation
- System settings

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, React Router |
| Backend | Node.js, Express |
| Database | SQLite (better-sqlite3) |
| Auth | JWT |

## Quick Start (Local)

### Prerequisites
- Node.js 18+

### Setup

```bash
# Clone and enter project
cd heew-attendance-tracker

# Install dependencies
npm install
cd client && npm install && cd ..

# Environment
copy .env.example .env

# Seed database (admin + sample employees)
npm run seed

# Build frontend
npm run build

# Start server (API + UI on one port)
npm start
```

Open **http://localhost:3002**

### Development (hot reload)

Terminal 1:
```bash
npm run dev:server
```

Terminal 2:
```bash
npm run dev:client
```

Open **http://localhost:5173** (API proxied to port 3002)

## Default Credentials

| Role | Login |
|------|--------|
| Admin | `admin@heew.com` / `admin123` |
| Employee | `alice@heew.com`, `bob@heew.com`, or `carol@heew.com` (email only) |

Change admin password in **Admin → Settings** before production.

## Deploy Live (GitHub + Render)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "HEEW Attendance Tracker initial release"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/heew-attendance-tracker.git
git push -u origin main
```

### 2. Deploy on Render (free tier)

1. Go to [render.com](https://render.com) and sign in with GitHub.
2. **New → Web Service** → connect your repo.
3. Settings:
   - **Build Command:** `npm install && npm run build && npm run seed`
   - **Start Command:** `npm start`
   - **Environment:** add `JWT_SECRET` (long random string), optionally `ADMIN_EMAIL` and `ADMIN_PASSWORD`
4. Deploy. Your app will be live at `https://your-app.onrender.com`.

> SQLite data persists on Render only if you attach a **disk** (paid) or use an external DB. For production at scale, migrate to PostgreSQL.

### Alternative: Railway / Fly.io

Same build/start commands. Set `PORT` from the platform and `NODE_ENV=production`.

## Project Structure

```
├── client/          # React frontend (Vite)
├── server/          # Express API + SQLite
├── data/            # SQLite database (created at runtime)
├── package.json
└── README.md
```

## API Overview

- `POST /api/auth/employee/login` — employee email login
- `POST /api/auth/admin/login` — admin email + password
- `POST /api/employee/check-in|break|resume|logout`
- `GET /api/employee/history|summary/daily|summary/monthly`
- `GET /api/admin/dashboard|employees|attendance|sessions|reports/*`

## License

MIT — use freely for your organization.
