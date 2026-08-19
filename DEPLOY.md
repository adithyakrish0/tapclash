# 🎯 Tap Clash - Deployment Guide

## Free Hosting Setup

### Step 1: Deploy Backend (Railway or Render)

#### Option A: Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project → Deploy from GitHub repo
4. Select the `backend` folder
5. Set environment variable: `PORT=3000`
6. Railway auto-deploys and gives you a URL like `tap-clash-backend.up.railway.app`

#### Option B: Render
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect your GitHub repo
4. Set:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Environment: Node
5. Deploy and get your URL

### Step 2: Deploy Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your repository
4. Set:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add Environment Variable:
   - `VITE_API_URL` = Your Railway/Render backend URL
6. Deploy

### Step 3: Setup Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Send `/newbot`
3. Name your bot: `Tap Clash Bot`
4. Username: `tapclashbot` (or your choice)
5. BotFather gives you a **Bot Token** - save it!
6. Send `/setmenubutton` to BotFather:
   - Select your bot
   - Set menu button URL: `https://your-app.vercel.app`
   - Text: `🎮 Play Tap Clash`
7. Send `/setwebapp` to BotFather:
   - Select your bot
   - URL: `https://your-app.vercel.app`

### Step 4: Test

1. Open your bot in Telegram
2. Click the menu button or `/start`
3. Play the game!
4. Share challenge links in groups

---

## Local Development

### Backend
```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:3000
```

---

## Cost Breakdown

| Service | Cost |
|---------|------|
| Railway (backend) | Free tier: $5 credit/month |
| Vercel (frontend) | Free: 100GB bandwidth |
| Telegram Bot | Free |
| **Total** | **₹0** |

---

## Adding Custom Domain (Optional)

1. Buy domain from Namecheap/Cloudflare (~₹500/year)
2. Add to Vercel as custom domain
3. Update BotFather with new URL
4. Done!

---

## Monetization Setup

### Adsgram (Telegram Ads)
1. Register at [adsgram.ai](https://adsgram.ai)
2. Create ad unit
3. Add to frontend: `@twa-dev/sdk` has built-in ad support
4. Earn from ad impressions

### Telegram Stars (In-App Purchases)
1. Enable in BotFather: `/enablepayments`
2. Add pay buttons in your bot
3. Sell power-ups, extra lives, etc.
4. Telegram takes 30% cut

### Affiliate Links
1. Join Testbook/Oliveboard affiliate programs
2. Add referral links in bot messages
3. Earn ₹50-200 per signup

---

## Next Steps After Launch

1. Share in 2-3 Telegram groups (5 minutes)
2. Post on r/IndianStudents
3. Make one Instagram reel showing gameplay
4. Watch the numbers grow!
