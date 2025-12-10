/**
 * Tweet Formatter - Formats tweet content with proper line breaks and styling
 */
class TweetFormatter {
  /**
   * Format a tweet with proper line breaks based on the content structure
   * @param {string} tweetContent - Raw tweet content from CSV
   * @returns {string} - Formatted tweet with proper line breaks
   */
  static formatTweet(tweetContent) {
    // Match pattern: "Reason X/100: Title. Rest of content"
    const reasonMatch = tweetContent.match(/^(Reason \d+\/100:)\s*(.+?)\.(.+)$/s);

    if (reasonMatch) {
      const [, reasonNumber, title, restOfContent] = reasonMatch;

      // Format:
      // Reason X/100:
      // Title.
      //
      // [Rest of content with proper formatting]
      let formatted = `${reasonNumber}\n${title.trim()}.\n\n`;

      // Clean up the rest of the content
      let content = restOfContent.trim();

      // Split sentences for better readability
      // Look for sentence breaks followed by ticker symbols or hashtags
      content = content.replace(/\.\s+(\$[A-Z]+)/g, '.\n\n$1');
      content = content.replace(/\.\s+(#[A-Z][a-z]+)/g, '.\n\n$1');

      formatted += content;

      return formatted;
    }

    // If it doesn't match the pattern, try to improve formatting anyway
    return this.improveFormatting(tweetContent);
  }

  /**
   * Improve general tweet formatting
   * @param {string} content - Tweet content
   * @returns {string} - Improved formatted content
   */
  static improveFormatting(content) {
    let formatted = content;

    // Add line breaks before $PONY and $SOL for contrast
    formatted = formatted.replace(/\.\s+(\$PONY)/g, '.\n\n$1');
    formatted = formatted.replace(/\.\s+(\$SOL)/g, '.\n\n$1');

    // Add line breaks before hashtags
    formatted = formatted.replace(/\.\s+(#[A-Z])/g, '.\n\n$1');

    return formatted.trim();
  }

  /**
   * Validate tweet length (Twitter's limit is 280 characters)
   * @param {string} content - Tweet content
   * @returns {Object} - Validation result
   */
  static validate(content) {
    const length = content.length;
    const limit = 280;

    return {
      valid: length <= limit,
      length,
      limit,
      remaining: limit - length
    };
  }

  /**
   * Get tweet preview
   * @param {string} content - Tweet content
   * @returns {string} - Preview of how tweet will look
   */
  static preview(content) {
    const formatted = this.formatTweet(content);
    const validation = this.validate(formatted);

    return `
${'='.repeat(60)}
TWEET PREVIEW (${validation.length}/${validation.limit} chars)
${'='.repeat(60)}
${formatted}
${'='.repeat(60)}
Status: ${validation.valid ? '✓ Valid' : '✗ Too long'}
${validation.valid ? '' : `Need to remove ${-validation.remaining} characters`}
${'='.repeat(60)}
    `.trim();
  }
}

export default TweetFormatter;
