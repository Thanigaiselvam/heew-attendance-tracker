# Host on GitHub Pages (Simple HTML — Works Immediately)

The full Node.js app needs Render. This **HTML version** runs in the browser and works on GitHub Pages.

## Enable GitHub Pages

1. Open: https://github.com/Thanigaiselvam/heew-attendance-tracker/settings/pages
2. **Build and deployment** → Source: **Deploy from a branch**
3. Branch: **main** → Folder: **/docs**
4. Click **Save**
5. Wait 1–2 minutes

## Your live link

```
https://thanigaiselvam.github.io/heew-attendance-tracker/
```

(If you chose `/root` instead of `/docs`, use the root `index.html` redirect.)

## Default logins

| Role | Login |
|------|--------|
| Admin | `admin@heew.com` / `admin123` |
| Employee | `alice@heew.com` or `bob@heew.com` (email only) |

Data is stored in the **browser** (localStorage). Each visitor has their own data unless they use the same browser.

## Push updates

```powershell
cd c:\Projects\final
git add docs index.html
git commit -m "Add static HTML for GitHub Pages"
git push origin main
```
