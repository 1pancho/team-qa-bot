import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  botToken: string;
  chatId: number;
  utilsTopicId: number;
  qaTopicId: number;
  notificationsTopicId: number;
}

/**
 * Validate and return configuration
 */
export function getConfig(): Config {
  const botToken = process.env.BOT_TOKEN;
  const chatId = process.env.CHAT_ID;
  const utilsTopicId = process.env.UTILS_TOPIC_ID;
  const qaTopicId = process.env.QA_TOPIC_ID;
  const notificationsTopicId = process.env.NOTIFICATIONS_TOPIC_ID;

  // Validate required environment variables
  if (!botToken) {
    throw new Error('BOT_TOKEN is required in .env file');
  }

  if (!chatId) {
    throw new Error('CHAT_ID is required in .env file');
  }

  if (!utilsTopicId) {
    throw new Error('UTILS_TOPIC_ID is required in .env file');
  }

  if (!qaTopicId) {
    throw new Error('QA_TOPIC_ID is required in .env file');
  }

  if (!notificationsTopicId) {
    throw new Error('NOTIFICATIONS_TOPIC_ID is required in .env file');
  }

  return {
    botToken,
    chatId: parseInt(chatId, 10),
    utilsTopicId: parseInt(utilsTopicId, 10),
    qaTopicId: parseInt(qaTopicId, 10),
    notificationsTopicId: parseInt(notificationsTopicId, 10),
  };
}

// Export singleton config
export const config = getConfig();
