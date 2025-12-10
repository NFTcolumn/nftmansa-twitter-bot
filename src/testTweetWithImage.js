#!/usr/bin/env node

import TwitterClient from './twitter.js';
import CSVProcessor from './csvProcessor.js';
import TweetFormatter from './formatter.js';

/**
 * Test posting a tweet with an image
 */
async function testTweetWithImage() {
  console.log('\n🧪 Testing Tweet with Image\n');
  console.log('='.repeat(60) + '\n');

  try {
    // Initialize
    const twitter = new TwitterClient();
    const csvProcessor = new CSVProcessor('$PONY 100 reasons why. - I want you to create 100 tweets with this info an....csv');
    await csvProcessor.initialize();

    // Verify credentials
    console.log('Verifying Twitter credentials...');
    const authenticated = await twitter.verifyCredentials();
    if (!authenticated) {
      throw new Error('Authentication failed');
    }
    console.log();

    // Get a random meme
    const memePath = csvProcessor.getRandomMeme();
    console.log(`Selected meme: ${memePath}`);
    console.log();

    // Create a test tweet
    const testContent = `Reason TEST/100:
Testing the bot.

$PONY is testing formatted tweets with images!

$SOL better watch out. 🐴`;

    console.log('Tweet content:');
    console.log('='.repeat(60));
    console.log(testContent);
    console.log('='.repeat(60));
    console.log();

    // Validate
    const validation = TweetFormatter.validate(testContent);
    console.log(`Character count: ${validation.length}/${validation.limit}`);
    console.log(`Status: ${validation.valid ? '✓ Valid' : '✗ Too long'}`);
    console.log();

    // Ask for confirmation
    console.log('⚠️  This will post a REAL tweet to @pxponies!');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to proceed...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Post the tweet
    console.log('\nPosting tweet...');
    const result = await twitter.postTweet(testContent, memePath);

    console.log('\n✓ Success!');
    console.log(`  Tweet ID: ${result.id}`);
    console.log(`  URL: https://twitter.com/i/web/status/${result.id}`);
    console.log();

  } catch (error) {
    console.error('\n✗ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testTweetWithImage();
