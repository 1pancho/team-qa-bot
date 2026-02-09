import { Bot } from 'grammy';
import { BotContext } from './types';
import { config } from './config';
import { getDatabase } from './database/db';
import { setupUtilsHandlers } from './handlers/utils.handler';
import { setupQAHandlers } from './handlers/qa.handler';

/**
 * Main bot initialization
 */
async function main(): Promise<void> {
  console.log('🤖 Starting QA Bot...');

  // Initialize database
  try {
    getDatabase();
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }

  // Create bot instance
  const bot = new Bot<BotContext>(config.botToken);

  // Setup handlers
  setupUtilsHandlers(bot);
  setupQAHandlers(bot);

  // Global error handler
  bot.catch((err) => {
    console.error('❌ Bot error:', err);
  });

  // Log bot info
  const botInfo = await bot.api.getMe();
  console.log(`✅ Bot started: @${botInfo.username}`);
  console.log(`📋 Configuration:`);
  console.log(`   - Chat ID: ${config.chatId}`);
  console.log(`   - Utils Topic ID: ${config.utilsTopicId}`);
  console.log(`   - QA Topic ID: ${config.qaTopicId}`);
  console.log(`   - Notifications Topic ID: ${config.notificationsTopicId}`);

  // Start polling
  console.log('🔄 Starting polling...');
  await bot.start({
    onStart: () => {
      console.log('✅ Bot is running and listening for updates!');
      console.log('');
      console.log('📝 Available commands:');
      console.log('   Utils topic:');
      console.log('     /start or /deploy - Show deployment buttons');
      console.log('   QA topic:');
      console.log('     /bugs or /filed - Show bug assignment button');
      console.log('');
      console.log('Press Ctrl+C to stop the bot');
    },
  });
}

// Handle graceful shutdown
process.once('SIGINT', () => {
  console.log('\n👋 Bot stopping...');
  process.exit(0);
});

process.once('SIGTERM', () => {
  console.log('\n👋 Bot stopping...');
  process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the bot
main().catch((error) => {
  console.error('❌ Failed to start bot:', error);
  process.exit(1);
});
