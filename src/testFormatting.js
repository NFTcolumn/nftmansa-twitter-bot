#!/usr/bin/env node

import CSVProcessor from './csvProcessor.js';
import path from 'path';

/**
 * Test CSV processing and tweet formatting
 */
async function testFormatting() {
  console.log('\n🧪 Testing Tweet Formatting\n');
  console.log('='.repeat(60) + '\n');

  const csvPath = process.argv[2];

  if (!csvPath) {
    console.log('Usage: node src/testFormatting.js <csv-path>');
    console.log('\nExample:');
    console.log('  node src/testFormatting.js "$PONY 100 reasons why. - I want you to create 100 tweets with this info an....csv"');
    console.log();
    process.exit(1);
  }

  try {
    const csvProcessor = new CSVProcessor(csvPath);
    await csvProcessor.initialize();

    // Get stats
    const stats = await csvProcessor.getStats();
    console.log(`📊 CSV Statistics:`);
    console.log(`  Total tweets: ${stats.total}`);
    console.log(`  Used: ${stats.used}`);
    console.log(`  Unused: ${stats.unused}`);
    console.log();

    // Get first 3 unused tweets as examples
    const unusedTweets = await csvProcessor.getUnusedTweets();
    const exampleTweets = unusedTweets.slice(0, 3);

    console.log(`📝 Example Formatted Tweets (first 3 unused):\n`);

    for (const tweet of exampleTweets) {
      console.log(`Tweet ID: ${tweet.id}`);
      console.log(csvProcessor.previewTweet(tweet.content));
      console.log();
    }

    console.log('='.repeat(60));
    console.log(`✓ Formatting test complete!`);
    console.log();

  } catch (error) {
    console.error('\n✗ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testFormatting();
