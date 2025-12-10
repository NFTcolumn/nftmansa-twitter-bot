#!/usr/bin/env node

import CSVProcessor from './csvProcessor.js';
import Storage from './storage.js';
import TweetFormatter from './formatter.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Schedule tweets from CSV file
 */
async function scheduleCsvTweets() {
  console.log('\n📅 Twitter CSV Tweet Scheduler\n');
  console.log('='.repeat(60) + '\n');

  // Get command line arguments
  const args = process.argv.slice(2);
  const csvPath = args[0];
  const startTimeStr = args[1];
  const intervalHours = parseFloat(args[2]) || 4; // Default 4 hours between tweets
  const limit = args[3] ? parseInt(args[3]) : null;

  // Validate arguments
  if (!csvPath || !startTimeStr) {
    console.log('Usage: node src/scheduleCsvTweets.js <csv-path> <start-time> [interval-hours] [limit]');
    console.log('\nExamples:');
    console.log('  node src/scheduleCsvTweets.js tweets.csv "2025-01-20 09:00" 4');
    console.log('  node src/scheduleCsvTweets.js tweets.csv "2025-01-20 09:00" 6 10');
    console.log('\nArguments:');
    console.log('  csv-path        - Path to CSV file with tweets');
    console.log('  start-time      - When to post first tweet (YYYY-MM-DD HH:MM)');
    console.log('  interval-hours  - Hours between tweets (default: 4)');
    console.log('  limit           - Max number of tweets to schedule (optional)');
    console.log();
    process.exit(1);
  }

  try {
    // Initialize CSV processor
    console.log(`📄 Reading CSV: ${csvPath}`);
    const csvProcessor = new CSVProcessor(csvPath);
    await csvProcessor.initialize();

    // Get statistics
    const stats = await csvProcessor.getStats();
    console.log(`\n📊 CSV Statistics:`);
    console.log(`  Total tweets: ${stats.total}`);
    console.log(`  Used: ${stats.used} (${stats.percentComplete}%)`);
    console.log(`  Unused: ${stats.unused}`);
    console.log();

    // Prepare tweets
    console.log(`🎨 Preparing tweets for scheduling...`);
    const preparedTweets = await csvProcessor.prepareTweetsForScheduling(limit);

    if (preparedTweets.length === 0) {
      console.log('✗ No unused tweets found in CSV!');
      process.exit(0);
    }

    console.log(`✓ Prepared ${preparedTweets.length} tweets\n`);

    // Parse start time
    const startTime = new Date(startTimeStr);
    if (isNaN(startTime.getTime())) {
      console.error('✗ Invalid start time format. Use: YYYY-MM-DD HH:MM');
      process.exit(1);
    }

    // Initialize storage
    const storage = new Storage();
    await storage.initialize();

    // Schedule each tweet
    console.log(`⏰ Scheduling tweets starting at ${startTime.toLocaleString()}`);
    console.log(`   Interval: ${intervalHours} hours between tweets\n`);

    let scheduledCount = 0;
    for (let i = 0; i < preparedTweets.length; i++) {
      const tweet = preparedTweets[i];

      // Calculate schedule time for this tweet
      const scheduleTime = new Date(startTime.getTime() + (i * intervalHours * 60 * 60 * 1000));

      // Validate tweet length
      const validation = TweetFormatter.validate(tweet.formattedContent);
      if (!validation.valid) {
        console.log(`⚠️  Skipping tweet ${tweet.csvId} (too long: ${validation.length}/${validation.limit} chars)`);
        continue;
      }

      // Schedule the tweet
      await storage.addTweet(
        tweet.formattedContent,
        scheduleTime,
        tweet.memePath,
        { csvId: tweet.csvId, csvPath: csvPath }
      );

      scheduledCount++;
      console.log(`✓ Scheduled tweet ${tweet.csvId} for ${scheduleTime.toLocaleString()}`);
      console.log(`  Meme: ${tweet.memeFile}`);
      console.log(`  Preview: ${tweet.formattedContent.substring(0, 60)}...`);
      console.log();

      // Small delay to ensure unique IDs
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    console.log('='.repeat(60));
    console.log(`✓ Successfully scheduled ${scheduledCount} tweets!`);
    console.log(`\nNext steps:`);
    console.log(`  1. Run "npm start" to start the scheduler`);
    console.log(`  2. Run "node src/cli.js list" to view scheduled tweets`);
    console.log(`  3. Tweets will be automatically posted at scheduled times`);
    console.log();

  } catch (error) {
    console.error('\n✗ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the scheduler
scheduleCsvTweets();
