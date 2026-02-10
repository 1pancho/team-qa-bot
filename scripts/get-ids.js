// Temporary script to get chat and topic IDs
const { Bot } = require('grammy');

const bot = new Bot(process.argv[2] || process.env.BOT_TOKEN);

console.log('🤖 Bot started! Send messages in different topics to get their IDs...\n');

bot.on('message', (ctx) => {
  console.log('=' .repeat(60));
  console.log('📩 Message received!');
  console.log('Chat ID:', ctx.chat.id);
  console.log('Topic ID:', ctx.message.message_thread_id || 'No topic (main chat)');
  console.log('From:', ctx.from.username || ctx.from.first_name);
  console.log('Text:', ctx.message.text || '(non-text message)');
  console.log('=' .repeat(60));
  console.log('');
});

bot.start();
