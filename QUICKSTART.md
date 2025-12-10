# 🚀 Quick Start Guide - 5 Minutes to Deploy

Get your Twitter Scheduler Bot running on Render in 5 minutes!

---

## Prerequisites

- [ ] Twitter/X account
- [ ] GitHub account
- [ ] Render account (free at https://render.com)

---

## Step 1: Get Twitter API Credentials (2 min)

1. Go to https://developer.twitter.com/en/portal/dashboard
2. Sign in and apply for developer access (instant approval for most accounts)
3. Create a Project → Create an App
4. Go to **Keys and tokens** tab
5. Copy these 4 values:
   - API Key
   - API Key Secret
   - Access Token
   - Access Token Secret
6. **IMPORTANT:** Go to Settings → Set permissions to "Read and Write" → Regenerate tokens

✅ Save these credentials somewhere safe!

---

## Step 2: Deploy to Render (2 min)

### Push to GitHub

```bash
cd twitter-scheduler-bot

# Initialize git
git init
git add .
git commit -m "Initial commit"

# Push to GitHub (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/twitter-scheduler-bot.git
git branch -M main
git push -u origin main
```

### Deploy on Render

1. Go to https://render.com → Login → **New +** → **Background Worker**
2. Connect your GitHub account
3. Select `twitter-scheduler-bot` repository
4. Render auto-detects settings ✓
5. Add environment variables (the 4 credentials from Step 1):
   ```
   TWITTER_API_KEY=...
   TWITTER_API_SECRET=...
   TWITTER_ACCESS_TOKEN=...
   TWITTER_ACCESS_SECRET=...
   ```
6. Click **"Create Background Worker"**
7. Wait 2-3 minutes for deployment ☕

---

## Step 3: Schedule Your First Tweet (1 min)

1. Go to your Render service → **Shell** tab
2. Run this command (change the date to 5 minutes from now):
   ```bash
   node src/cli.js schedule "Hello from my Twitter bot! 🤖" "2025-01-15 14:30"
   ```
3. Verify it's scheduled:
   ```bash
   node src/cli.js list
   ```
4. Wait for the scheduled time and watch it post!

---

## Common Commands

```bash
# Schedule a tweet
node src/cli.js schedule "Tweet text" "2025-01-20 09:00"

# List all scheduled tweets
node src/cli.js list

# Check status
node src/cli.js status

# Delete a tweet
node src/cli.js delete <tweet-id>

# Test API credentials
node src/cli.js test
```

---

## Date Format

Use 24-hour format: `YYYY-MM-DD HH:MM`

Examples:
- `2025-01-20 09:00` = Jan 20 at 9 AM
- `2025-01-20 14:30` = Jan 20 at 2:30 PM

**Note:** Times are in UTC by default!

---

## Troubleshooting

### ✗ Authentication failed

**Fix:**
1. Check your API credentials are correct
2. Make sure app permissions are "Read and Write"
3. Regenerate Access Token after changing permissions

### ✗ 403 Forbidden

**Fix:**
1. Go to Developer Portal → Your App → Settings
2. Set permissions to "Read and Write"
3. Regenerate Access Token and Secret
4. Update Render environment variables

### Service not starting

**Fix:**
1. Check Render Logs tab for errors
2. Verify all 4 environment variables are set
3. No extra spaces or quotes in variable values

---

## Next Steps

- Read the full [README.md](./README.md) for all features
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for advanced setup
- Enable persistent storage to save tweets across restarts
- Upgrade to paid plan ($7/month) for 24/7 uptime

---

## That's It! 🎉

Your bot is now running 24/7 in the cloud, checking every minute for tweets to post.

Schedule away! 🚀
