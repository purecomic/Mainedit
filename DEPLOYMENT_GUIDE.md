# 🎬 MAIN EDIT — Complete Beginner Deployment Guide
### For Android (Termux) → Supabase + Vercel

---

## ✅ STEP 1: Install Termux Tools

Open Termux and run these one by one:

```bash
pkg update && pkg upgrade -y
pkg install nodejs-lts git -y
npm install -g vercel
```

---

## ✅ STEP 2: Set Up Supabase (Free Database)

1. Go to **https://supabase.com** on your phone browser
2. Click **"Start your project"** → sign up (free)
3. Click **"New Project"**
   - Name: `mainedit`
   - Database password: choose a strong one (save it!)
   - Region: pick closest to you
4. Wait ~2 minutes for it to set up
5. Go to **Settings → API**
6. Copy these two values (you'll need them soon):
   - **Project URL** (looks like `https://abcxyz.supabase.co`)
   - **anon/public key** (long text starting with `eyJ...`)

### Run the Database Setup:
1. In Supabase, click **"SQL Editor"** (left sidebar)
2. Click **"New query"**
3. Open the file `supabase_setup.sql` from this project
4. Copy ALL the text and paste it into the editor
5. Click **"Run"** (green button)
6. You should see "Success" — your tables are created!

---

## ✅ STEP 3: Get the Project Files to Your Phone

On Termux:
```bash
cd ~
```

Now transfer the `mainedit` folder to your phone. You can:
- Use a file manager to copy it to `/data/data/com.termux/files/home/`
- Or clone from GitHub if you upload it there

---

## ✅ STEP 4: Configure Your Project

In Termux:
```bash
cd ~/mainedit
cp .env.example .env
```

Now edit the .env file:
```bash
nano .env
```

Replace the placeholder values with your real ones:
```
REACT_APP_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
REACT_APP_SUPABASE_ANON_KEY=YOUR-ANON-KEY-HERE
```

Save: press **Ctrl+X**, then **Y**, then **Enter**

---

## ✅ STEP 5: Install Dependencies

```bash
cd ~/mainedit
npm install
```

This takes 2–5 minutes. Wait for it to finish.

---

## ✅ STEP 6: Test Locally (Optional)

```bash
npm start
```

Open your browser and go to: **http://localhost:3000**

You should see the Main Edit website! Press **Ctrl+C** to stop.

---

## ✅ STEP 7: Deploy to Vercel (Free Hosting)

```bash
cd ~/mainedit
npm run build
vercel
```

Follow the prompts:
- **Set up and deploy?** → Y
- **Which scope?** → Your name
- **Link to existing project?** → N
- **Project name?** → `mainedit` (or any name)
- **In which directory is your code?** → `./` (just press Enter)
- **Override settings?** → N

After it deploys, Vercel gives you a URL like:
`https://mainedit-abc123.vercel.app`

### Add Environment Variables to Vercel:
```bash
vercel env add REACT_APP_SUPABASE_URL
```
Paste your Supabase URL, press Enter.

```bash
vercel env add REACT_APP_SUPABASE_ANON_KEY
```
Paste your anon key, press Enter.

### Redeploy with the env variables:
```bash
vercel --prod
```

---

## ✅ STEP 8: Create Your Admin Account

1. Go to your live website
2. Click **Sign Up**
3. Use exactly: **admin@mainedit.com** as the email
4. Use: **Black234** as the password
5. Check your email and click the confirmation link
6. Log in — you'll see the **👑 Admin** button in the top bar

---

## 🎯 WEBSITE FEATURES SUMMARY

| Page | URL | Access |
|------|-----|--------|
| Home | `/` | Everyone |
| Effects | `/effects` | Everyone |
| Sign Up | `/signup` | Everyone |
| Login | `/login` | Everyone |
| Dashboard | `/dashboard` | Logged in users |
| Wallet | `/wallet` | Logged in users |
| Lessons | `/lessons` | Everyone |
| Admin | `/admin` | admin@mainedit.com only |

### Admin Panel (password: Black234) lets you:
- 👥 View all users & adjust their balances
- 🔔 Send real-time notifications to all users or specific ones
- 📞 Add/remove your contact info for private lessons
- 💳 Approve or reject withdrawal requests

---

## 🔧 COMMON ISSUES & FIXES

**"npm: command not found"**
```bash
pkg install nodejs-lts -y
```

**"Cannot find module" error**
```bash
rm -rf node_modules
npm install
```

**Blank page after deploy**
- Make sure you added the Supabase env variables to Vercel
- Run `vercel --prod` again after adding them

**Login not working**
- Go to Supabase → Authentication → Settings
- Make sure "Enable email confirmations" is set correctly
- Check your spam folder for the confirmation email

**"Row level security" error in console**
- Go back to Supabase SQL Editor
- Re-run the `supabase_setup.sql` file

---

## 📱 UPDATING YOUR WEBSITE LATER

Whenever you make changes:
```bash
cd ~/mainedit
npm run build
vercel --prod
```

---

## 💡 PRO TIPS

- Bookmark your Vercel and Supabase dashboards
- Your free Vercel URL works forever — share it with clients
- Supabase free tier gives you 500MB database + 50,000 monthly active users
- To add a custom domain later: `vercel domains add yourdomain.com`

---

**🎬 Congratulations! Main Edit is live!**
