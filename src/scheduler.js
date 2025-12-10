import cron from 'node-cron';
import TwitterClient from './twitter.js';
import Storage from './storage.js';
import CSVProcessor from './csvProcessor.js';

/**
 * Tweet Scheduler - Checks for due tweets every minute and posts them
 */
class Scheduler {
  constructor() {
    this.twitter = new TwitterClient();
    this.storage = new Storage();
    this.isRunning = false;
    this.task = null;
  }

  /**
   * Initialize the scheduler
   */
  async initialize() {
    console.log('Initializing Twitter Scheduler Bot...\n');

    // Verify Twitter credentials
    const authenticated = await this.twitter.verifyCredentials();
    if (!authenticated) {
      throw new Error('Failed to authenticate with Twitter API');
    }

    // Load scheduled tweets
    await this.storage.initialize();

    console.log('\n✓ Scheduler initialized successfully\n');
  }

  /**
   * Start the scheduler - checks every minute for due tweets
   */
  start() {
    if (this.isRunning) {
      console.log('Scheduler is already running');
      return;
    }

    console.log('Starting scheduler... (checking every minute)');
    console.log('Press Ctrl+C to stop\n');

    // Check immediately on start
    this.checkAndPostTweets();

    // Then check every minute (at the start of each minute)
    this.task = cron.schedule('* * * * *', () => {
      this.checkAndPostTweets();
    });

    this.isRunning = true;
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.task) {
      this.task.stop();
      this.isRunning = false;
      console.log('\nScheduler stopped');
    }
  }

  /**
   * Check for due tweets and post them
   */
  async checkAndPostTweets() {
    const now = new Date();
    const dueTweets = this.storage.getDueTweets();

    if (dueTweets.length === 0) {
      // Debug: show what we're comparing
      const pendingTweets = this.storage.getTweets(false);
      if (pendingTweets.length > 0) {
        const nextTweet = pendingTweets[0];
        const nextTime = new Date(nextTweet.scheduledTime);
        console.log(`[${now.toISOString()}] No tweets due. Next tweet at ${nextTime.toISOString()} (in ${Math.round((nextTime - now) / 1000)}s)`);
      } else {
        console.log(`[${now.toISOString()}] No tweets scheduled`);
      }
      return;
    }

    console.log(`\n[${new Date().toLocaleString()}] Found ${dueTweets.length} tweet(s) to post\n`);

    for (const tweet of dueTweets) {
      await this.postScheduledTweet(tweet);
    }
  }

  /**
   * Post a scheduled tweet
   */
  async postScheduledTweet(tweet) {
    console.log(`Posting tweet ${tweet.id}:`);
    console.log(`Text: "${tweet.text}"`);
    console.log(`Scheduled for: ${new Date(tweet.scheduledTime).toLocaleString()}`);
    if (tweet.mediaPaths) {
      console.log(`Media: ${Array.isArray(tweet.mediaPaths) ? tweet.mediaPaths.join(', ') : tweet.mediaPaths}`);
    }
    console.log();

    try {
      const result = await this.twitter.postTweet(tweet.text, tweet.mediaPaths);
      await this.storage.markAsPosted(tweet.id, result.id);
      console.log(`✓ Successfully posted tweet ${tweet.id}`);
      console.log(`  Twitter ID: ${result.id}`);
      console.log(`  URL: https://twitter.com/i/web/status/${result.id}\n`);

      // Update CSV if this tweet came from a CSV file
      if (tweet.metadata && tweet.metadata.csvId && tweet.metadata.csvPath) {
        try {
          const csvProcessor = new CSVProcessor(tweet.metadata.csvPath);
          await csvProcessor.markTweetAsUsed(tweet.metadata.csvId);
        } catch (csvError) {
          console.error(`⚠️  Warning: Could not update CSV:`, csvError.message);
        }
      }
    } catch (error) {
      console.error(`✗ Failed to post tweet ${tweet.id}:`, error.message);
      await this.storage.markAsFailed(tweet.id, error.message);
    }
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    const pending = this.storage.getTweets(false);
    const all = this.storage.getTweets(true);

    return {
      running: this.isRunning,
      pendingTweets: pending.length,
      totalTweets: all.length,
    };
  }
}

export default Scheduler;
