import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

/**
 * Twitter API Client wrapper for X API v2
 */
class TwitterClient {
  constructor() {
    // OAuth 1.0a User Context - Required for posting tweets
    this.client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });

    // Get read-write client
    this.rwClient = this.client.readWrite;
    this.v2Client = this.rwClient.v2;
  }

  /**
   * Verify credentials and test API connection
   */
  async verifyCredentials() {
    try {
      const user = await this.v2Client.me();
      console.log(`✓ Authenticated as: @${user.data.username}`);
      return true;
    } catch (error) {
      console.error('✗ Authentication failed:', error.message);
      return false;
    }
  }

  /**
   * Upload media file to Twitter
   * @param {string} mediaPath - Path to the media file
   * @returns {Promise<string>} - Media ID
   */
  async uploadMedia(mediaPath) {
    try {
      // Check if file exists
      await fs.access(mediaPath);

      // Upload media using v1 API (required for media uploads)
      const mediaId = await this.client.v1.uploadMedia(mediaPath);
      console.log(`✓ Media uploaded successfully: ${mediaId}`);
      return mediaId;
    } catch (error) {
      console.error('✗ Failed to upload media:', error.message);
      throw error;
    }
  }

  /**
   * Post a tweet with optional media
   * @param {string} text - Tweet content
   * @param {string|string[]} mediaPaths - Optional path(s) to media file(s)
   * @returns {Promise<Object>} - Tweet data
   */
  async postTweet(text, mediaPaths = null) {
    try {
      const tweetOptions = { text };

      // Upload media if provided
      if (mediaPaths) {
        const paths = Array.isArray(mediaPaths) ? mediaPaths : [mediaPaths];
        const mediaIds = [];

        for (const mediaPath of paths) {
          const mediaId = await this.uploadMedia(mediaPath);
          mediaIds.push(mediaId);
        }

        if (mediaIds.length > 0) {
          tweetOptions.media = { media_ids: mediaIds };
        }
      }

      const tweet = await this.v2Client.tweet(tweetOptions);
      console.log(`✓ Tweet posted successfully: ${tweet.data.id}`);
      return tweet.data;
    } catch (error) {
      console.error('✗ Failed to post tweet:', error.message);

      // Handle common errors
      if (error.code === 403) {
        console.error('Check your API permissions - ensure read/write access is enabled');
      } else if (error.code === 429) {
        console.error('Rate limit exceeded - please wait before posting again');
      } else if (error.code === 187) {
        console.error('Duplicate tweet detected');
      }

      throw error;
    }
  }

  /**
   * Get tweet character limit (currently 280 for standard accounts)
   */
  getCharacterLimit() {
    return 280;
  }

  /**
   * Validate tweet text
   * @param {string} text - Tweet content
   * @returns {Object} - Validation result
   */
  validateTweet(text) {
    const limit = this.getCharacterLimit();
    const length = text.length;

    if (!text || text.trim() === '') {
      return { valid: false, error: 'Tweet cannot be empty' };
    }

    if (length > limit) {
      return {
        valid: false,
        error: `Tweet is too long (${length}/${limit} characters)`
      };
    }

    return { valid: true, length, limit };
  }
}

export default TwitterClient;
