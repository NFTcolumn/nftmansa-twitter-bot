#!/usr/bin/env node

import { program } from 'commander';
import Storage from './storage.js';
import TwitterClient from './twitter.js';

const storage = new Storage();

/**
 * Parse date string in format "YYYY-MM-DD HH:MM"
 */
function parseDateTime(dateString) {
  const regex = /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/;
  const match = dateString.match(regex);

  if (!match) {
    throw new Error('Invalid date format. Use: YYYY-MM-DD HH:MM (e.g., 2025-01-15 14:30)');
  }

  const [, year, month, day, hour, minute] = match;
  const date = new Date(year, month - 1, day, hour, minute);

  if (isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }

  return date;
}

/**
 * Format date for display
 */
function formatDate(date) {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Schedule a new tweet
 */
program
  .command('schedule')
  .description('Schedule a new tweet')
  .argument('<text>', 'Tweet content')
  .argument('<datetime>', 'Date and time (YYYY-MM-DD HH:MM)')
  .action(async (text, datetime) => {
    try {
      await storage.initialize();

      // Validate tweet
      const twitter = new TwitterClient();
      const validation = twitter.validateTweet(text);

      if (!validation.valid) {
        console.error(`✗ ${validation.error}`);
        process.exit(1);
      }

      // Parse and validate datetime
      const scheduledTime = parseDateTime(datetime);
      const now = new Date();

      if (scheduledTime <= now) {
        console.error('✗ Scheduled time must be in the future');
        process.exit(1);
      }

      // Add tweet
      const tweet = await storage.addTweet(text, scheduledTime);

      console.log('✓ Tweet scheduled successfully!\n');
      console.log(`ID: ${tweet.id}`);
      console.log(`Text: "${tweet.text}"`);
      console.log(`Scheduled for: ${formatDate(tweet.scheduledTime)}`);
      console.log(`Characters: ${validation.length}/${validation.limit}`);

    } catch (error) {
      console.error(`✗ Error: ${error.message}`);
      process.exit(1);
    }
  });

/**
 * List all scheduled tweets
 */
program
  .command('list')
  .description('List all scheduled tweets')
  .option('-a, --all', 'Include posted and failed tweets')
  .action(async (options) => {
    try {
      await storage.initialize();
      const tweets = storage.getTweets(options.all);

      if (tweets.length === 0) {
        console.log('No scheduled tweets found');
        return;
      }

      console.log(`\n${tweets.length} scheduled tweet(s):\n`);

      // Sort by scheduled time
      tweets.sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));

      tweets.forEach((tweet, index) => {
        const status = tweet.status === 'pending' ? '⏳' :
                      tweet.status === 'posted' ? '✓' : '✗';

        console.log(`${status} [${tweet.id}] ${tweet.status.toUpperCase()}`);
        console.log(`   Text: "${tweet.text}"`);
        console.log(`   Scheduled: ${formatDate(tweet.scheduledTime)}`);

        if (tweet.status === 'posted' && tweet.twitterId) {
          console.log(`   URL: https://twitter.com/i/web/status/${tweet.twitterId}`);
        }

        if (tweet.status === 'failed' && tweet.error) {
          console.log(`   Error: ${tweet.error}`);
        }

        console.log('');
      });

    } catch (error) {
      console.error(`✗ Error: ${error.message}`);
      process.exit(1);
    }
  });

/**
 * Delete a scheduled tweet
 */
program
  .command('delete')
  .description('Delete a scheduled tweet')
  .argument('<id>', 'Tweet ID')
  .action(async (id) => {
    try {
      await storage.initialize();

      const tweet = storage.getTweet(id);
      if (!tweet) {
        console.error(`✗ Tweet with ID ${id} not found`);
        process.exit(1);
      }

      const deleted = await storage.deleteTweet(id);

      if (deleted) {
        console.log(`✓ Deleted tweet ${id}`);
        console.log(`   Text: "${tweet.text}"`);
      }

    } catch (error) {
      console.error(`✗ Error: ${error.message}`);
      process.exit(1);
    }
  });

/**
 * Show status
 */
program
  .command('status')
  .description('Show scheduler status')
  .action(async () => {
    try {
      await storage.initialize();

      const pending = storage.getTweets(false);
      const all = storage.getTweets(true);
      const posted = all.filter(t => t.status === 'posted');
      const failed = all.filter(t => t.status === 'failed');

      console.log('\nScheduler Status:\n');
      console.log(`  Pending tweets: ${pending.length}`);
      console.log(`  Posted tweets:  ${posted.length}`);
      console.log(`  Failed tweets:  ${failed.length}`);
      console.log(`  Total tweets:   ${all.length}\n`);

      if (pending.length > 0) {
        const next = pending.sort((a, b) =>
          new Date(a.scheduledTime) - new Date(b.scheduledTime)
        )[0];
        console.log(`Next scheduled tweet: ${formatDate(next.scheduledTime)}\n`);
      }

    } catch (error) {
      console.error(`✗ Error: ${error.message}`);
      process.exit(1);
    }
  });

/**
 * Test credentials
 */
program
  .command('test')
  .description('Test Twitter API credentials')
  .action(async () => {
    try {
      const twitter = new TwitterClient();
      const result = await twitter.verifyCredentials();

      if (result) {
        console.log('\n✓ Credentials are valid!\n');
      } else {
        console.log('\n✗ Credential verification failed\n');
        process.exit(1);
      }

    } catch (error) {
      console.error(`✗ Error: ${error.message}`);
      process.exit(1);
    }
  });

program
  .name('twitter-scheduler')
  .description('CLI for managing scheduled tweets')
  .version('1.0.0');

program.parse();
