import Scheduler from './scheduler.js';
import CSVProcessor from './csvProcessor.js';
import Storage from './storage.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Auto-schedule tweets from CSV if no pending tweets exist
 */
async function autoScheduleTweetsIfNeeded(storage) {
  const csvPath = path.join(__dirname, '..', 'pixel_pony_live_race_tweets.csv');

  // Check if there are pending tweets
  const pendingTweets = storage.getTweets(false);

  if (pendingTweets.length > 0) {
    console.log(`ℹ️  Found ${pendingTweets.length} pending tweets - skipping auto-schedule\n`);
    return;
  }

  console.log('🚀 No pending tweets found - auto-scheduling from CSV...\n');

  try {
    const csvProcessor = new CSVProcessor(csvPath);
    await csvProcessor.initialize();

    const stats = await csvProcessor.getStats();
    console.log(`📊 CSV Statistics:`);
    console.log(`  Total tweets: ${stats.total}`);
    console.log(`  Used: ${stats.used}`);
    console.log(`  Unused: ${stats.unused}\n`);

    if (stats.unused === 0) {
      console.log('✓ All tweets have been posted!\n');
      return;
    }

    // Prepare tweets
    const preparedTweets = await csvProcessor.prepareTweetsForScheduling();

    // Start posting immediately, then every 1 hour
    const startTime = new Date(Date.now() + 5 * 1000); // 5 seconds from now to ensure scheduler is running
    const intervalHours = 1;

    console.log(`⏰ Scheduling ${preparedTweets.length} tweets:`);
    console.log(`   Current server time: ${new Date().toISOString()}`);
    console.log(`   First tweet at: ${startTime.toISOString()}`);
    console.log(`   Interval: ${intervalHours} hours between tweets\n`);

    let scheduledCount = 0;
    for (let i = 0; i < preparedTweets.length; i++) {
      const tweet = preparedTweets[i];
      const scheduleTime = new Date(startTime.getTime() + (i * intervalHours * 60 * 60 * 1000));

      await storage.addTweet(
        tweet.formattedContent,
        scheduleTime,
        tweet.memePath,
        { csvId: tweet.csvId, csvPath: csvPath }
      );

      scheduledCount++;

      // Log first 3 and last tweet
      if (i < 3 || i === preparedTweets.length - 1) {
        console.log(`✓ Tweet ${tweet.csvId} → ${scheduleTime.toLocaleString()}`);
      } else if (i === 3) {
        console.log(`  ... scheduling ${preparedTweets.length - 4} more tweets ...`);
      }

      // Small delay to ensure unique IDs
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    console.log(`\n✓ Successfully scheduled ${scheduledCount} tweets!`);
    console.log(`  First tweet posts in ~30 seconds, then every ${intervalHours} hours\n`);

  } catch (error) {
    console.error('⚠️  Warning: Could not auto-schedule tweets:', error.message);
    console.log('You can manually schedule tweets using the CLI\n');
  }
}

/**
 * Main entry point - starts the scheduler
 */
async function main() {
  const scheduler = new Scheduler();

  try {
    await scheduler.initialize();

    // Auto-schedule tweets if none exist (pass scheduler's storage instance)
    await autoScheduleTweetsIfNeeded(scheduler.storage);

    scheduler.start();

    // Keep the process running
    process.on('SIGINT', () => {
      console.log('\n\nShutting down gracefully...');
      scheduler.stop();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n\nShutting down gracefully...');
      scheduler.stop();
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start scheduler:', error.message);
    process.exit(1);
  }
}

main();
