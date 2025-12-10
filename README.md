# Twitter Scheduler Bot

A Node.js bot for scheduling tweets using X's API v2. Deploy it on Render and manage your scheduled tweets remotely.

## Features

- Schedule tweets for specific times
- List all scheduled tweets
- Delete scheduled tweets
- Automatic posting at scheduled times
- Persistent storage for scheduled tweets
- Full X API v2 support with OAuth 1.0a
- Easy deployment on Render (or any cloud platform)
- Runs 24/7 in the cloud

---

## Table of Contents

1. [Getting X API Credentials](#1-getting-x-api-credentials)
2. [Local Setup](#2-local-setup-optional)
3. [Deploy to Render](#3-deploy-to-render)
4. [Managing Tweets](#4-managing-tweets)
5. [Troubleshooting](#troubleshooting)

---

## 1. Getting X API Credentials

### Step 1: Create Twitter Developer Account

1. Go to https://developer.twitter.com/en/portal/dashboard
2. Sign in with your Twitter account
3. Apply for a developer account (it's free)
4. Fill out the application form explaining you're building a scheduling bot

### Step 2: Create a Project and App

1. Once approved, click **"Create Project"**
2. Give your project a name (e.g., "Tweet Scheduler")
3. Select use case: **"Making a bot"** or **"Exploring the API"**
4. Provide a description
5. Create an **App** within the project

### Step 3: Generate API Keys

1. In your App settings, go to **"Keys and tokens"** tab
2. Generate the following credentials:

   **API Key and Secret:**
   - Click **"Regenerate"** under "Consumer Keys"
   - Save your `API Key` and `API Key Secret`

   **Access Token and Secret:**
   - Click **"Generate"** under "Authentication Tokens"
   - Save your `Access Token` and `Access Token Secret`

3. **IMPORTANT:** Set app permissions to **"Read and Write"**
   - Go to **"Settings"** tab
   - Scroll to **"User authentication settings"**
   - Click **"Set up"**
   - Enable **OAuth 1.0a**
   - Set **App permissions** to **"Read and Write"**
   - Save changes
   - You may need to regenerate your tokens after changing permissions

### Step 4: Save Your Credentials

You'll need these 4 values:
```
API Key (Consumer Key)
API Key Secret (Consumer Secret)
Access Token
Access Token Secret
```

**Keep these secret!** Never commit them to GitHub.

---

## 2. Local Setup (Optional)

If you want to test locally before deploying:

### Install Dependencies
```bash
cd twitter-scheduler-bot
npm install
```

### Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
TWITTER_API_KEY=your_api_key_here
TWITTER_API_SECRET=your_api_secret_here
TWITTER_ACCESS_TOKEN=your_access_token_here
TWITTER_ACCESS_SECRET=your_access_secret_here
```

### Test Your Credentials
```bash
node src/cli.js test
```

You should see: `✓ Authenticated as: @yourusername`

### Schedule a Test Tweet (Local)
```bash
node src/cli.js schedule "Hello from my bot! 🤖" "2025-01-15 14:30"
```

### Start the Scheduler (Local)
```bash
npm start
```

---

## 3. Deploy to Render

### Prerequisites
- GitHub account
- X API credentials (from Step 1)
- Render account (free at https://render.com)

### Step 1: Push Code to GitHub

1. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Name it `twitter-scheduler-bot`
   - Make it **Private** (recommended)
   - Don't initialize with README (we already have one)

2. **Push your code:**
   ```bash
   cd twitter-scheduler-bot
   git init
   git add .
   git commit -m "Initial commit - Twitter scheduler bot"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/twitter-scheduler-bot.git
   git push -u origin main
   ```

### Step 2: Create Render Web Service

1. **Go to Render Dashboard:**
   - Sign up/login at https://render.com
   - Click **"New +"** → **"Background Worker"**

2. **Connect Your Repository:**
   - Click **"Connect account"** to link GitHub
   - Select your `twitter-scheduler-bot` repository
   - Click **"Connect"**

3. **Configure the Service:**

   **Name:** `twitter-scheduler-bot` (or any name you prefer)

   **Region:** Select closest to you

   **Branch:** `main`

   **Runtime:** `Node`

   **Build Command:**
   ```
   npm install
   ```

   **Start Command:**
   ```
   npm start
   ```

   **Instance Type:** `Free` (or upgrade for better reliability)

4. **Add Environment Variables:**

   Click **"Advanced"** → **"Add Environment Variable"**

   Add these 4 variables with YOUR credentials:

   | Key | Value |
   |-----|-------|
   | `TWITTER_API_KEY` | `your_api_key_here` |
   | `TWITTER_API_SECRET` | `your_api_secret_here` |
   | `TWITTER_ACCESS_TOKEN` | `your_access_token_here` |
   | `TWITTER_ACCESS_SECRET` | `your_access_secret_here` |

5. **Deploy:**
   - Click **"Create Background Worker"**
   - Render will build and deploy your bot
   - Wait for deployment to complete (2-3 minutes)

### Step 3: Verify Deployment

1. Go to your service's **"Logs"** tab
2. You should see:
   ```
   ✓ Authenticated as: @yourusername
   ✓ Scheduler initialized successfully
   Starting scheduler... (checking every minute)
   ```

3. If you see errors, check the [Troubleshooting](#troubleshooting) section

### Step 4: Keep Your Bot Running

**IMPORTANT:** Render's free tier may spin down after inactivity. To prevent this:

1. **Use Render's Persistent Disks (Recommended):**
   - Go to your service settings
   - Add a **Persistent Disk**
   - Mount path: `/app/scheduled_tweets.json`
   - This preserves your scheduled tweets across restarts

2. **Upgrade to Paid Plan:**
   - Render's paid plan keeps services running 24/7
   - Starts at $7/month

---

## 4. Managing Tweets

### Option A: Using Render Shell (Web Interface)

1. Go to your Render service dashboard
2. Click **"Shell"** tab
3. Run commands directly:

```bash
# Schedule a tweet
node src/cli.js schedule "My scheduled tweet 🚀" "2025-01-20 09:00"

# List scheduled tweets
node src/cli.js list

# Check status
node src/cli.js status

# Delete a tweet
node src/cli.js delete <tweet-id>
```

### Option B: SSH into Render (Advanced)

If you have SSH access enabled:
```bash
ssh render-username@your-service.onrender.com
```

### Option C: Build a Web Interface (Future Enhancement)

You could add a simple Express.js web UI to manage tweets through a browser.

---

## CLI Commands Reference

### Schedule a Tweet
```bash
node src/cli.js schedule "Tweet text here" "YYYY-MM-DD HH:MM"
```
Example:
```bash
node src/cli.js schedule "Good morning! ☀️" "2025-01-20 08:00"
```

### List All Scheduled Tweets
```bash
node src/cli.js list
```

Show all including posted/failed:
```bash
node src/cli.js list --all
```

### Check Status
```bash
node src/cli.js status
```

### Delete a Tweet
```bash
node src/cli.js delete <tweet-id>
```

### Test API Credentials
```bash
node src/cli.js test
```

---

## Date Format

Always use **24-hour format**: `YYYY-MM-DD HH:MM`

Examples:
- `2025-01-20 09:00` → January 20, 2025 at 9:00 AM
- `2025-01-20 14:30` → January 20, 2025 at 2:30 PM
- `2025-12-25 23:59` → December 25, 2025 at 11:59 PM

**Note:** Times are in your server's timezone (usually UTC on Render)

---

## Architecture

```
twitter-scheduler-bot/
├── src/
│   ├── index.js       # Main entry point - starts the scheduler
│   ├── scheduler.js   # Core scheduling logic (checks every minute)
│   ├── twitter.js     # X API v2 client wrapper
│   ├── storage.js     # JSON-based storage for scheduled tweets
│   └── cli.js         # Command-line interface for managing tweets
├── scheduled_tweets.json  # Auto-created database of scheduled tweets
├── package.json
├── .env.example       # Template for environment variables
└── README.md
```

**How it works:**
1. Scheduler runs continuously, checking every minute
2. When a scheduled time is reached, it posts the tweet via X API v2
3. All scheduled tweets are stored in `scheduled_tweets.json`
4. Use CLI commands to add/remove/list tweets

---

## Rate Limits

X API v2 has rate limits you should be aware of:

| Tier | Tweet Limit | Cost |
|------|-------------|------|
| **Free** | 1,500 tweets/month | $0 |
| **Basic** | 3,000 tweets/month | $100/month |
| **Pro** | 10,000 tweets/month | $5,000/month |

For personal use, the free tier is usually sufficient.

**Rate limit errors:** If you hit limits, tweets will fail and be marked as failed in the logs.

---

## Troubleshooting

### Error: "Authentication failed"

**Solution:**
1. Verify your API credentials are correct
2. Ensure your app has **Read and Write** permissions
3. Regenerate your Access Token and Secret after changing permissions
4. Update environment variables on Render

### Error: "403 Forbidden"

**Causes:**
- App permissions are set to "Read Only"
- Access token was generated before changing permissions

**Solution:**
1. Go to Developer Portal → Your App → Settings
2. Set permissions to **"Read and Write"**
3. Go to **Keys and tokens** tab
4. **Regenerate** Access Token and Secret
5. Update Render environment variables

### Error: "Duplicate tweet detected"

X doesn't allow posting the exact same tweet twice in a row.

**Solution:** Change the tweet text slightly.

### Render Service Not Starting

**Check logs:**
1. Go to Render dashboard → Your service → Logs
2. Look for error messages

**Common issues:**
- Missing environment variables
- Invalid credentials
- Build failed (check Build Command is `npm install`)

### Scheduled Tweets Disappearing After Restart

**Solution:**
1. Enable Render Persistent Disk (see Step 3.4 above)
2. Or upgrade to paid plan for persistent storage

### Time Zone Issues

Render servers use UTC by default. If your tweets are posting at the wrong time:

**Solution:** Schedule tweets in UTC time, or add timezone conversion to the code.

---

## Security Best Practices

1. **Never commit `.env` file** to GitHub (already in `.gitignore`)
2. **Use Private GitHub repository** for your bot code
3. **Rotate API keys** if you suspect they've been compromised
4. **Monitor API usage** in Twitter Developer Portal
5. **Set up rate limiting** if accepting user input

---

## Future Enhancements

Ideas to improve the bot:

- [ ] Add web UI for easier tweet management
- [ ] Support for media uploads (images, videos)
- [ ] Thread scheduling
- [ ] Recurring tweets (daily, weekly)
- [ ] Time zone support
- [ ] Database storage (PostgreSQL, MongoDB)
- [ ] Webhook support for remote scheduling
- [ ] Analytics and reporting

---

## License

MIT

---

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review X API documentation: https://developer.twitter.com/en/docs/x-api
3. Check Render docs: https://render.com/docs

---

## Credits

Built with:
- [twitter-api-v2](https://github.com/PLhery/node-twitter-api-v2) - X API v2 client
- [node-cron](https://github.com/node-cron/node-cron) - Task scheduler
- [Render](https://render.com) - Cloud hosting platform
