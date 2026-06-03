# Deploy on Vercel

Vercel is for **static sites** or **serverless**. This repo’s **HTML app** (`docs/index.html`) works on Vercel.

The full **Node + SQLite** app should use **Render** or **Railway**, not Vercel.

## Vercel project settings

In https://vercel.com → your project → **Settings → General**:

| Setting | Value |
|---------|--------|
| Framework Preset | **Other** |
| Root Directory | `.` (leave empty) |
| Build Command | *(leave empty — `vercel.json` handles it)* |
| Output Directory | `docs` |
| Install Command | *(leave empty)* |

`vercel.json` in the repo already sets this.

## Redeploy

1. Push latest code to GitHub.
2. Vercel → **Deployments** → **Redeploy** (or wait for auto-deploy).

## Warnings you can ignore

- `prebuild-install deprecated` — only appears if Vercel runs `npm install` for the Node app. With static config, install is skipped.
- `engines.node >=18` — informational.

## After deploy

Open your Vercel URL, e.g. `https://heew-attendance-tracker.vercel.app`

**Admin:** `admin@heew.com` / `admin123`  
**Employee:** `alice@heew.com` or `bob@heew.com`

Data is stored in each browser (localStorage).

## If build still fails

1. Delete the project on Vercel and re-import the GitHub repo.
2. When importing, set **Framework** to **Other**.
3. Confirm **Output Directory** = `docs`.
