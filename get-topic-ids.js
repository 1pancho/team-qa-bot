const { Bot } = require('grammy');

const bot = new Bot('8217785071:AAHwlzFnjpYh8WhrETrP2MGHskn60k__2KY');

console.log('🤖 Bot запущен! Отправляйте сообщения в топики...\n');

let count = 0;
const topics = new Map();

bot.on('message', (ctx) => {
  const topicId = ctx.message.message_thread_id;
  const chatId = ctx.chat.id;

  if (!topics.has(topicId)) {
    topics.set(topicId, chatId);
    count++;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📩 Получено сообщение №' + count);
    console.log('CHAT_ID=' + chatId);
    console.log('TOPIC_ID=' + (topicId || 'main'));
    console.log('От:', ctx.from.username || ctx.from.first_name);
    console.log('Текст:', ctx.message.text || '(не текст)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (count >= 3) {
      console.log('\n✅ Получены все 3 топика!\n');
      console.log('Используйте эти значения в .env:\n');
      const arr = Array.from(topics.entries());
      console.log('CHAT_ID=' + chatId);
      arr.forEach((entry, i) => {
        console.log('TOPIC_' + (i+1) + '=' + entry[0]);
      });
      setTimeout(() => process.exit(0), 2000);
    }
  }
});

bot.start();

setTimeout(() => {
  console.log('\n⏱️  Время вышло. Получено топиков:', count);
  process.exit(1);
}, 30000);
