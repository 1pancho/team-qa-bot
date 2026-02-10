import { Bot, InlineKeyboard } from 'grammy';
import { BotContext } from '../types';
import { config } from '../config';
import { recordDeployment } from '../database/db';
import { createUserMention, isInTopic, isCallbackFromTopic } from './common.handler';

// Store pinned message ID for Utils topic
let utilsPinnedMessageId: number | null = null;

/**
 * Setup Utils topic handlers
 */
export function setupUtilsHandlers(bot: Bot<BotContext>): void {
  // Setup command - creates and pins the permanent button message (run once)
  bot.command('setup_utils', async (ctx) => {
    if (!isInTopic(ctx, config.utilsTopicId)) return;

    await createPinnedDeploymentButtons(ctx);
  });

  // Handle deployment button clicks
  bot.callbackQuery(/^deploy_(ui|backend)$/, async (ctx) => {
    if (!isCallbackFromTopic(ctx, config.utilsTopicId)) return;

    try {
      const deploymentType = ctx.match[1] as 'ui' | 'backend';
      const user = ctx.from;

      if (!user) {
        await ctx.answerCallbackQuery('Error: User information not available');
        return;
      }

      // Record deployment in database
      const userName = user.username || user.first_name;
      recordDeployment(deploymentType, user.id, userName);

      // Send notification to Notifications topic (only place where message appears)
      await sendDeploymentNotification(
        bot,
        deploymentType,
        user.id,
        user.first_name,
        user.username
      );

      // Answer callback query with success message (no message editing - buttons stay visible)
      const typeLabel = deploymentType === 'ui' ? 'UI' : 'Backend';
      await ctx.answerCallbackQuery(`${typeLabel} deployment recorded!`);
    } catch (error) {
      console.error('Error handling deployment:', error);
      await ctx.answerCallbackQuery('Error recording deployment');
    }
  });
}

/**
 * Create and pin permanent deployment buttons (run once during setup)
 */
async function createPinnedDeploymentButtons(ctx: BotContext): Promise<void> {
  const keyboard = new InlineKeyboard()
    .text('UI deployed to IFT', 'deploy_ui')
    .text('Backend deployed to IFT', 'deploy_backend');

  const messageText = '*Deployment Options*\n\nChoose deployment type:';

  const message = await ctx.reply(messageText, {
    reply_markup: keyboard,
    parse_mode: 'Markdown',
    message_thread_id: config.utilsTopicId,
  });

  // Pin the message
  utilsPinnedMessageId = message.message_id;
  try {
    await ctx.api.pinChatMessage(config.chatId, message.message_id);
    await ctx.reply('✅ Deployment buttons created and pinned!', {
      message_thread_id: config.utilsTopicId,
    });
  } catch (error) {
    console.error('Failed to pin message:', error);
    await ctx.reply('❌ Failed to pin message. Make sure bot has admin rights.', {
      message_thread_id: config.utilsTopicId,
    });
  }
}

/**
 * Send deployment notification to Notifications topic
 */
async function sendDeploymentNotification(
  bot: Bot<BotContext>,
  type: 'ui' | 'backend',
  userId: number,
  firstName: string,
  username?: string
): Promise<void> {
  const userMention = createUserMention(userId, firstName, username);
  const typeLabel = type === 'ui' ? 'UI' : 'Backend';

  const message = `*Deployment Alert*\n\n${userMention} deployed ${typeLabel} to IFT`;

  await bot.api.sendMessage(config.chatId, message, {
    message_thread_id: config.notificationsTopicId,
    parse_mode: 'Markdown',
  });
}
