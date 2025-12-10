import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use /opt/render/project/src for persistent storage on Render
const STORAGE_FILE = path.join(__dirname, 'scheduled_tweets.json');

/**
 * Storage manager for scheduled tweets
 */
class Storage {
  constructor() {
    this.tweets = [];
  }

  /**
   * Initialize storage by loading from file
   */
  async initialize() {
    try {
      const data = await fs.readFile(STORAGE_FILE, 'utf-8');
      this.tweets = JSON.parse(data);
      console.log(`Loaded ${this.tweets.length} scheduled tweets`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, create it
        this.tweets = [];
        await this.save();
        console.log('Created new scheduled tweets database');
      } else {
        console.error('Error loading scheduled tweets:', error.message);
        this.tweets = [];
      }
    }
  }

  /**
   * Save tweets to file
   */
  async save() {
    try {
      await fs.writeFile(
        STORAGE_FILE,
        JSON.stringify(this.tweets, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('Error saving scheduled tweets:', error.message);
      throw error;
    }
  }

  /**
   * Add a new scheduled tweet
   * @param {string} text - Tweet content
   * @param {Date} scheduledTime - When to post
   * @param {string|string[]} mediaPaths - Optional media file path(s)
   * @param {Object} metadata - Optional metadata (e.g., csvId for tracking)
   * @returns {Object} - Tweet object
   */
  async addTweet(text, scheduledTime, mediaPaths = null, metadata = {}) {
    const tweet = {
      id: Date.now().toString(),
      text,
      scheduledTime: scheduledTime.toISOString(),
      status: 'pending', // pending, posted, failed
      createdAt: new Date().toISOString(),
      mediaPaths: mediaPaths,
      metadata: metadata,
    };

    this.tweets.push(tweet);
    await this.save();
    return tweet;
  }

  /**
   * Get all scheduled tweets
   * @param {boolean} includePast - Include tweets that have already been posted
   */
  getTweets(includePast = false) {
    if (includePast) {
      return this.tweets;
    }

    return this.tweets.filter(t => t.status === 'pending');
  }

  /**
   * Get tweets that are due to be posted
   */
  getDueTweets() {
    const now = new Date();
    return this.tweets.filter(t => {
      if (t.status !== 'pending') return false;
      const scheduledTime = new Date(t.scheduledTime);
      return scheduledTime <= now;
    });
  }

  /**
   * Mark a tweet as posted
   */
  async markAsPosted(tweetId, twitterId = null) {
    const tweet = this.tweets.find(t => t.id === tweetId);
    if (tweet) {
      tweet.status = 'posted';
      tweet.postedAt = new Date().toISOString();
      if (twitterId) {
        tweet.twitterId = twitterId;
      }
      await this.save();
    }
  }

  /**
   * Mark a tweet as failed
   */
  async markAsFailed(tweetId, error) {
    const tweet = this.tweets.find(t => t.id === tweetId);
    if (tweet) {
      tweet.status = 'failed';
      tweet.error = error;
      tweet.failedAt = new Date().toISOString();
      await this.save();
    }
  }

  /**
   * Delete a scheduled tweet
   */
  async deleteTweet(tweetId) {
    const index = this.tweets.findIndex(t => t.id === tweetId);
    if (index !== -1) {
      this.tweets.splice(index, 1);
      await this.save();
      return true;
    }
    return false;
  }

  /**
   * Get a specific tweet by ID
   */
  getTweet(tweetId) {
    return this.tweets.find(t => t.id === tweetId);
  }
}

export default Storage;
