# Sparkpretty Closet — Production Deployment Guide

## Architecture
- **Frontend:** Vercel (static build, Vite + React)
- **Backend:** Railway (Node.js + Express)
- **Database:** MongoDB Atlas (free M0 cluster) or Railway Mongo plugin
- **File uploads:** Railway persistent volume (or S3-compatible storage later)

---

## 1. MongoDB Atlas Setup

1. Go to https://www.mongodb.com/atlas → Sign up → Create free M0 cluster
2. Under **Database Access** → Add a user:
   - Username + strong password (save it)
   - Leave "Read and write to any database" default
3. Under **Network Access** → Add IP address:
   - Allow access from anywhere: `0.0.0.0/0`
4. Under **Clusters** → Connect → Drivers:
   - Copy the connection string, e.g.:
     `mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/`
5. Append the database name: `sparkpretty`
   - Final URI: `mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/sparkpretty`
---

## 2. Backend → Railway Deployment

### Option A — Railway Dashboard (no CLI needed)
1. Go to https://railway.app → New Project → **Deploy from GitHub repo**
2. Select the repo → Railway auto-detects Nixpacks (uses `backend/railway.json`)
3. Set root directory to `backend`
4. Wait for build, then add environment variables:

| Variable | Value |
|----------|-------|
| `PORT` | `5000` |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | your Atlas connection string |
| `JWT_SECRET` | random 64-char string (`openssl rand -hex 32`) |
| `JWT_EXPIRES_IN` | `7d` |
| `SITE_URL` | `https://sparkpretty.co.ke` |
| `CORS_ORIGIN` | `https://sparkpretty.co.ke,https://sparkpretty-closet.vercel.app` |
| `MPESA_CONSUMER_KEY` | your Daraja sandbox key |
| `MPESA_CONSUMER_SECRET` | your Daraja sandbox secret |
| `MPESA_SHORTCODE` | `174379` |
| `MPESA_PASSKEY` | from Safaricom developer portal |
| `MPESA_CALLBACK_URL` | `https://<your-railway-domain>/api/payments/mpesa/callback` |
| `MPESA_BASE_URL` | `https://sandbox.safaricom.co.ke` |

5. Deploy → grab the generated domain, e.g. `sparkpretty-backend.up.railway.app`
6. (Recommended) Add a custom domain: Settings → Networking → Custom Domain → `api.sparkpretty.co.ke`

### Option B — Railway CLI
```bash
railway login
railway init
railway up            # from backend/ directory
railway variables --set "MONGODB_URI=mongodb+srv://..." 
railway up
```

---

## 3. Seed the Database (once)

From your local machine, with `backend/.env` pointing at production Atlas URI:

```bash
cd backend
npm install
npm run seed
```

This creates:
- 5 categories
- 15 products
- Admin user: `admin@sparkpretty.co.ke` / `admin123`
- 3 blog posts

**IMPORTANT:** Log in and change the admin password immediately after seeding.

---

## 4. Frontend → Vercel Deployment

1. Go to https://vercel.com → New Project → Import the repo
2. Root directory: `frontend`
3. Framework preset: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
4. Env variable:
   - `VITE_API_URL` = `https://sparkpretty-backend.up.railway.app/api`
   - (or `https://api.sparkpretty.co.ke/api` if you set the custom domain)
5. Deploy

---

## 5. Post-Deploy Checklist

- [ ] `https://<backend>/api/health` returns `{ "ok": true }`
- [ ] `https://<domain>/shop` loads products from DB
- [ ] Register a regular user works
- [ ] Admin login works, change the seed password
- [ ] M-Pesa sandbox test payment succeeds (needs ngrok tunnel for callback)
- [ ] `https://<domain>/sitemap.xml` serves valid XML
- [ ] Set up Google Search Console for the sitemap

---

## Reminders / Gotchas

- **Never** commit `backend/.env` to git after putting real secrets in it (`.gitignore` already ignores it)
- M-Pesa sandbox callbacks need a public HTTPS URL → use `ngrok http 5000` pointing at your Railway instance (or a Railway public domain directly)
- Railway free tier sleeps after inactivity — hibernate may cause slow first request. Consider Hobby plan for production store.
- The seed script wipes all existing data (`deleteMany`) — only run it on a fresh database.
- File uploads: Railway free tier has no persistent volume; uploads are stored on the ephemeral disk. For a truly production store, add a Railway Volume mounted at `/uploads` (Settings → Volume) or move to S3 later.