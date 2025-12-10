import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { fileURLToPath } from 'url';
import TweetFormatter from './formatter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * CSV Processor - Handles reading tweets from CSV and updating their status
 */
class CSVProcessor {
  constructor(csvPath, memesDir = null) {
    this.csvPath = csvPath;
    this.memesDir = memesDir || path.join(__dirname, '..', 'memes');
    this.memeFiles = [];
  }

  /**
   * Initialize by loading available memes
   */
  async initialize() {
    try {
      const files = await fs.readdir(this.memesDir);
      this.memeFiles = files
        .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
        .map(file => path.join(this.memesDir, file));

      console.log(`✓ Found ${this.memeFiles.length} meme images`);
      return true;
    } catch (error) {
      console.error('✗ Error loading memes:', error.message);
      return false;
    }
  }

  /**
   * Get a random meme from the collection
   */
  getRandomMeme() {
    if (this.memeFiles.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * this.memeFiles.length);
    return this.memeFiles[randomIndex];
  }

  /**
   * Read tweets from CSV
   */
  async readTweets() {
    try {
      const csvContent = await fs.readFile(this.csvPath, 'utf-8');
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });

      return records.map(record => ({
        id: record['Tweet ID'],
        content: record['Tweet Content'],
        used: record['used'] && record['used'].toLowerCase() === 'yes'
      }));
    } catch (error) {
      console.error('✗ Error reading CSV:', error.message);
      throw error;
    }
  }

  /**
   * Get unused tweets from CSV
   */
  async getUnusedTweets() {
    const tweets = await this.readTweets();
    return tweets.filter(tweet => !tweet.used);
  }

  /**
   * Update CSV to mark a tweet as used
   */
  async markTweetAsUsed(tweetId) {
    try {
      const tweets = await this.readTweets();

      // Find and update the tweet
      const tweet = tweets.find(t => t.id === tweetId);
      if (tweet) {
        tweet.used = true;
      }

      // Convert back to CSV format
      const csvData = tweets.map(t => ({
        'Tweet ID': t.id,
        'Tweet Content': t.content,
        'used': t.used ? 'yes' : ''
      }));

      const csvString = stringify(csvData, {
        header: true,
        columns: ['Tweet ID', 'Tweet Content', 'used']
      });

      await fs.writeFile(this.csvPath, csvString, 'utf-8');
      console.log(`✓ Marked tweet ${tweetId} as used in CSV`);
    } catch (error) {
      console.error('✗ Error updating CSV:', error.message);
      throw error;
    }
  }

  /**
   * Format a tweet with proper styling
   */
  formatTweet(content) {
    return TweetFormatter.formatTweet(content);
  }

  /**
   * Preview how a tweet will look
   */
  previewTweet(content) {
    return TweetFormatter.preview(content);
  }

  /**
   * Get tweets ready for scheduling with formatting and memes
   */
  async prepareTweetsForScheduling(limit = null) {
    await this.initialize();
    const unusedTweets = await this.getUnusedTweets();

    const tweetsToSchedule = limit ? unusedTweets.slice(0, limit) : unusedTweets;

    return tweetsToSchedule.map(tweet => {
      const formattedContent = this.formatTweet(tweet.content);
      const memePath = this.getRandomMeme();

      return {
        csvId: tweet.id,
        originalContent: tweet.content,
        formattedContent: formattedContent,
        memePath: memePath,
        memeFile: memePath ? path.basename(memePath) : null
      };
    });
  }

  /**
   * Get statistics about tweets
   */
  async getStats() {
    const tweets = await this.readTweets();
    const used = tweets.filter(t => t.used).length;
    const unused = tweets.filter(t => !t.used).length;

    return {
      total: tweets.length,
      used,
      unused,
      percentComplete: ((used / tweets.length) * 100).toFixed(1)
    };
  }
}

export default CSVProcessor;
