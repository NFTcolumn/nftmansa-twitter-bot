# Deployment Guide: Twitter Scheduler Bot on Render

This guide walks you through deploying your Twitter Scheduler Bot to Render step-by-step.

---

## Quick Start (5 Minutes)

### 1. Get Twitter API Credentials (if you haven't already)

1. Go to https://developer.twitter.com/en/portal/dashboard
2. Create a project and app
3. Generate API keys with **Read and Write** permissions
4. Save these 4 values:
   - API Key
   - API Key Secret
   - Access Token
   - Access Token Secret

### 2. Deploy to Render

**Option A: One-Click Deploy (Easiest)**

1. Push this code to GitHub (see below)
2. Go to https://render.com
3. Sign up/login
4. Click **"New +"** → **"Background Worker"**
5. Connect your GitHub repository
6. Render will auto-detect settings from `render.yaml`
7. Add your 4 environment variables
8. Click **"Create Background Worker"**
9. Done!

**Option B: Manual Deploy**

Follow the detailed steps in the main [README.md](./README.md#3-deploy-to-render)

---

## Detailed Steps

### Step 1: Prepare Your Code

If you haven't already pushed to GitHub:

```bash
# Initialize git (if not already done)
cd twitter-scheduler-bot
git init

# Add files
git add .

# Commit
git commit -m "Initial commit - Twitter scheduler bot"

# Create main branch
git branch -M main

# Add remote (replace with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/twitter-scheduler-bot.git

# Push to GitHub
git push -u origin main
```

### Step 2: Create Render Account

1. Go to https://render.com
2. Click **"Get Started for Free"**
3. Sign up with GitHub (recommended)
4. Authorize Render to access your GitHub

### Step 3: Create Background Worker

1. From Render Dashboard, click **"New +"**
2. Select **"Background Worker"**
3. Click **"Connect account"** to authorize GitHub
4. Find and select your `twitter-scheduler-bot` repository
5. Click **"Connect"**

### Step 4: Configure Service

Render should auto-detect most settings from `render.yaml`, but verify:

| Field | Value |
|-------|-------|
| **Name** | `twitter-scheduler-bot` |
| **Region** | Choose closest to you |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

### Step 5: Add Environment Variables

This is the most important step!

1. Scroll to **"Environment Variables"** section
2. Click **"Add Environment Variable"**
3. Add each of these (one at a time):

```
Key: TWITTER_API_KEY
Value: [paste your API key]

Key: TWITTER_API_SECRET
Value: [paste your API secret]

Key: TWITTER_ACCESS_TOKEN
Value: [paste your access token]

Key: TWITTER_ACCESS_SECRET
Value: [paste your access secret]
```

**IMPORTANT:** Make sure there are no extra spaces or quotes around the values!

### Step 6: Choose Instance Type

- **Free tier:** Good for testing, may spin down after inactivity
- **Starter ($7/month):** Keeps running 24/7, recommended for production

For now, select **Free** to test.

### Step 7: Deploy

1. Click **"Create Background Worker"**
2. Render will start building your app
3. Wait 2-3 minutes for deployment

### Step 8: Verify It's Running

1. Go to your service's **"Logs"** tab
2. You should see:
   ```
   Initializing Twitter Scheduler Bot...

   ✓ Authenticated as: @yourusername

   ✓ Scheduler initialized successfully

   Starting scheduler... (checking every minute)
   Press Ctrl+C to stop
   ```

3. If you see errors, check the [Troubleshooting](#troubleshooting) section below

### Step 9: Schedule Your First Tweet

1. Click the **"Shell"** tab in Render dashboard
2. Type this command:
   ```bash
   node src/cli.js schedule "Hello from Render! 🚀" "2025-01-15 14:00"
   ```
   (Replace the date/time with something 5 minutes in the future)

3. List your scheduled tweets:
   ```bash
   node src/cli.js list
   ```

4. Check status:
   ```bash
   node src/cli.js status
   ```

5. Wait for the scheduled time and watch it post!

---

## Enable Persistent Storage (Recommended)

By default, Render's free tier may lose your `scheduled_tweets.json` file on restart.

To prevent this:

### Option 1: Add Persistent Disk (Render)

1. Go to your service settings
2. Scroll to **"Disks"**
3. Click **"Add Disk"**
4. Configure:
   - **Name:** `scheduler-data`
   - **Mount Path:** `/app`
   - **Size:** 1 GB (free tier)
5. Save and redeploy

### Option 2: Use External Storage

For more reliability, consider:
- **PostgreSQL** database (Render offers free tier)
- **MongoDB Atlas** (free tier available)
- **AWS S3** for file storage

You'd need to modify `src/storage.js` to use a database instead of JSON files.

---

## Managing Tweets on Render

### Via Render Shell (Easiest)

1. Go to Render dashboard → Your service → **Shell** tab
2. Run any CLI command:

```bash
# Schedule a tweet
node src/cli.js schedule "My tweet text" "2025-01-20 10:00"

# List tweets
node src/cli.js list

# Delete a tweet
node src/cli.js delete 1234567890

# Check status
node src/cli.js status
```

### Via API/Webhook (Advanced)

You could add an Express.js endpoint to accept scheduling requests:

```javascript
// Example: POST /api/schedule
app.post('/api/schedule', async (req, res) => {
  const { text, scheduledTime } = req.body;
  // Add authentication here!
  const tweet = await storage.addTweet(text, new Date(scheduledTime));
  res.json(tweet);
});
```

---

## Monitoring Your Bot

### Check Logs

1. Go to Render dashboard → Your service
2. Click **"Logs"** tab
3. See real-time output

Logs will show:
- When tweets are posted
- Any errors
- Schedule checks every minute

### Enable Email Notifications

1. Go to Service Settings → **Notifications**
2. Add your email
3. Enable alerts for:
   - Deploy failures
   - Service crashes
   - Health check failures

---

## Troubleshooting

### "Authentication failed"

**Check:**
1. Are all 4 environment variables set correctly?
2. Go to Render → Your service → Environment
3. Click "Edit" and verify no typos
4. Make sure values don't have extra spaces or quotes

### "403 Forbidden" when posting

**Solution:**
1. Your Twitter app needs **Read and Write** permissions
2. Go to Developer Portal → Your App → Settings
3. Change permissions to "Read and Write"
4. **IMPORTANT:** Regenerate your Access Token and Secret
5. Update environment variables on Render with new tokens
6. Redeploy service

### Service keeps crashing

**Check logs:**
1. Go to Logs tab
2. Look for error messages
3. Common issues:
   - Missing environment variables
   - Invalid credentials
   - Network errors (usually temporary)

### Scheduled tweets disappearing

**Problem:** Free tier restarts may lose JSON file

**Solutions:**
1. Add persistent disk (see above)
2. Upgrade to paid tier ($7/month)
3. Use database storage instead of JSON

### Bot stops running after inactivity

**Problem:** Render free tier spins down after 15 minutes of inactivity

**Solutions:**
1. Upgrade to Starter plan ($7/month) - keeps running 24/7
2. Use a cron job to ping your service every 10 minutes (not recommended)
3. Accept the limitation for testing purposes

### Wrong timezone for tweets

**Problem:** Server uses UTC, tweets post at wrong times

**Solution:**
1. Schedule tweets in UTC time
2. Or modify the code to handle timezones:

```javascript
// In storage.js, convert to UTC
import { DateTime } from 'luxon';

const utcTime = DateTime.fromFormat(
  dateString,
  'yyyy-MM-dd HH:mm',
  { zone: 'America/New_York' }
).toUTC();
```

---

## Upgrading to Production

When you're ready to use this seriously:

### 1. Upgrade Render Plan
- **Starter ($7/month):**
  - Always running (no spin-down)
  - 512 MB RAM
  - Persistent storage included

### 2. Add Database
Instead of JSON files, use PostgreSQL:

```javascript
// Example with PostgreSQL
import pg from 'pg';

class Storage {
  constructor() {
    this.pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async addTweet(text, scheduledTime) {
    const result = await this.pool.query(
      'INSERT INTO tweets (text, scheduled_time) VALUES ($1, $2) RETURNING *',
      [text, scheduledTime]
    );
    return result.rows[0];
  }
}
```

### 3. Add Monitoring
- Set up Sentry for error tracking
- Use Render's built-in metrics
- Add health check endpoint

### 4. Add Web UI
Build a simple dashboard:
- Express.js server
- React/Vue frontend
- Authentication with JWT
- Schedule tweets from browser

---

## Cost Breakdown

### Free Tier (Testing)
- **Render:** $0
- **Twitter API:** $0
- **Total:** $0/month

**Limitations:**
- Service spins down after inactivity
- May lose data on restart
- 1,500 tweets/month limit

### Production Setup
- **Render Starter:** $7/month
- **Render PostgreSQL (optional):** $7/month
- **Twitter API Basic (optional):** $100/month (3,000 tweets)
- **Total:** $7-$114/month

---

## Security Checklist

Before going live:

- [ ] Repository is private on GitHub
- [ ] `.env` file is in `.gitignore`
- [ ] API credentials stored only in Render environment variables
- [ ] Read/Write permissions enabled on Twitter app
- [ ] Monitoring/alerts enabled
- [ ] Backups configured (if using database)
- [ ] Rate limiting implemented (if accepting user input)

---

## Next Steps

1. **Test locally first** - Make sure everything works on your machine
2. **Deploy to Render** - Follow steps above
3. **Schedule a test tweet** - Verify it posts correctly
4. **Monitor for a day** - Check logs, ensure stability
5. **Go live** - Start scheduling real tweets!

---

## Alternative Deployment Options

If Render doesn't work for you, consider:

### Heroku
- Similar setup to Render
- More expensive ($7/month minimum)
- Better uptime on free tier

### Railway
- $5/month for always-on service
- Easy deployment from GitHub
- Good free trial credits

### DigitalOcean
- $6/month for basic droplet
- More control, more setup required
- SSH access included

### AWS EC2
- Free tier available (12 months)
- More complex setup
- Best for scaling to many bots

---

## Support

Need help?

1. Check the [main README](./README.md)
2. Review Render docs: https://render.com/docs/background-workers
3. Check Twitter API docs: https://developer.twitter.com/en/docs/x-api
4. Open an issue on GitHub (if public repo)

---

## Success!

If you made it here and your bot is running, congratulations! 🎉

You now have a Twitter scheduling bot running 24/7 in the cloud. Start scheduling those tweets!
