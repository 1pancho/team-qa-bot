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
  // Command to show deployment buttons
  bot.command('start', async (ctx) => {
    if (!isInTopic(ctx, config.utilsTopicId)) return;

    await showDeploymentButtons(ctx);
  });

  bot.command('deploy', async (ctx) => {
    if (!isInTopic(ctx, config.utilsTopicId)) return;

    await showDeploymentButtons(ctx);
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

      // Send notification to Notifications topic
      await sendDeploymentNotification(
        bot,
        deploymentType,
        user.id,
        user.first_name,
        user.username
      );

      // Answer callback query with success message
      const typeLabel = deploymentType === 'ui' ? 'UI' : 'Backend';
      await ctx.answerCallbackQuery(`${typeLabel} deployment recorded!`);

      // Optionally edit the original message to show who deployed
      const userMention = createUserMention(user.id, user.first_name, user.username);
      await ctx.editMessageText(
        `${userMention} deployed ${typeLabel} to IFT\n\nUse /deploy to track another deployment.`
      );
    } catch (error) {
      console.error('Error handling deployment:', error);
      await ctx.answerCallbackQuery('Error recording deployment');
    }
  });
}

/**
 * Show deployment buttons in Utils topic
 */
async function showDeploymentButtons(ctx: BotContext): Promise<void> {
  const keyboard = new InlineKeyboard()
    .text('UI deployed to IFT', 'deploy_ui')
    .text('Backend deployed to IFT', 'deploy_backend');

  const messageText = '*Deployment Options*\n\nChoose deployment type:';

  // Try to edit existing pinned message if it exists
  if (utilsPinnedMessageId) {
    try {
      await ctx.api.editMessageText(
        config.chatId,
        utilsPinnedMessageId,
        messageText,
        {
          reply_markup: keyboard,
          parse_mode: 'Markdown',
        }
      );
      return;
    } catch (error) {
      // Message was deleted or doesn't exist, create new one
      console.log('Failed to edit pinned message, creating new one');
      utilsPinnedMessageId = null;
    }
  }

  // Create new message and pin it
  const message = await ctx.reply(messageText, {
    reply_markup: keyboard,
    parse_mode: 'Markdown',
    message_thread_id: config.utilsTopicId,
  });

  // Store message ID and pin it
  utilsPinnedMessageId = message.message_id;
  try {
    await ctx.api.pinChatMessage(config.chatId, message.message_id);
  } catch (error) {
    console.error('Failed to pin message:', error);
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
