import { Bot, InlineKeyboard } from 'grammy';
import { BotContext } from '../types';
import { config } from '../config';
import { createBug, assignBug, getBugByMessageId } from '../database/db';
import {
  createUserMention,
  getChatMembers,
  getUserDisplayName,
  isInTopic,
  isCallbackFromTopic,
} from './common.handler';

// Store pinned message ID for QA topic
let qaPinnedMessageId: number | null = null;

/**
 * Setup QA topic handlers
 */
export function setupQAHandlers(bot: Bot<BotContext>): void {
  // Setup command - creates and pins the permanent button message (run once)
  bot.command('setup_qa', async (ctx) => {
    if (!isInTopic(ctx, config.qaTopicId)) return;

    await createPinnedBugFilingButton(ctx);
  });

  // Handle "Filed bugs" button click
  bot.callbackQuery('filed_bugs', async (ctx) => {
    if (!isCallbackFromTopic(ctx, config.qaTopicId)) return;

    try {
      const user = ctx.from;
      const messageId = ctx.callbackQuery.message?.message_id;

      if (!user || !messageId) {
        await ctx.answerCallbackQuery('Error: Missing information');
        return;
      }

      // Create bug entry in database
      const userName = user.username || user.first_name;
      const bugId = createBug(user.id, userName, messageId);

      // Get chat members for assignment
      const members = await getChatMembers(bot.api, config.chatId);

      if (members.length === 0) {
        await ctx.answerCallbackQuery('No team members found');
        return;
      }

      // Edit the pinned message to show user selection
      await showUserSelectionKeyboard(ctx, members, bugId);
      await ctx.answerCallbackQuery('Select team member to assign bugs');
    } catch (error) {
      console.error('Error handling bug filing:', error);
      await ctx.answerCallbackQuery('Error processing request');
    }
  });

  // Handle user selection for bug assignment
  bot.callbackQuery(/^assign_bug_(\d+)_(\d+)$/, async (ctx) => {
    if (!isCallbackFromTopic(ctx, config.qaTopicId)) return;

    try {
      const bugId = parseInt(ctx.match[1], 10);
      const assigneeId = parseInt(ctx.match[2], 10);

      const reporter = ctx.from;
      if (!reporter) {
        await ctx.answerCallbackQuery('Error: Reporter information not available');
        return;
      }

      // Get bug info to find assignee details
      const bug = getBugByMessageId(ctx.callbackQuery.message?.message_id || 0);
      if (!bug) {
        await ctx.answerCallbackQuery('Error: Bug not found');
        return;
      }

      // Get assignee info from chat members
      const members = await getChatMembers(bot.api, config.chatId);
      const assignee = members.find((m) => m.id === assigneeId);

      if (!assignee) {
        await ctx.answerCallbackQuery('Error: Assignee not found');
        return;
      }

      // Update bug in database
      const assigneeName = assignee.username || assignee.firstName;
      assignBug(bugId, assigneeId, assigneeName);

      // Send notification to Notifications topic (only place where message appears)
      await sendBugAssignmentNotification(
        bot,
        reporter.id,
        reporter.first_name,
        reporter.username,
        assignee.id,
        assignee.firstName,
        assignee.username
      );

      // Restore the original "Filed bugs" button
      const keyboard = new InlineKeyboard().text('Filed bugs', 'filed_bugs');
      await ctx.editMessageText('*Bug Tracking*\n\nClick below to assign bugs to team members:', {
        reply_markup: keyboard,
        parse_mode: 'Markdown',
      });

      await ctx.answerCallbackQuery('Bug assigned successfully!');
    } catch (error) {
      console.error('Error assigning bug:', error);
      await ctx.answerCallbackQuery('Error assigning bug');
    }
  });
}

/**
 * Create and pin permanent bug filing button (run once during setup)
 */
async function createPinnedBugFilingButton(ctx: BotContext): Promise<void> {
  const keyboard = new InlineKeyboard().text('Filed bugs', 'filed_bugs');
  const messageText = '*Bug Tracking*\n\nClick below to assign bugs to team members:';

  const message = await ctx.reply(messageText, {
    reply_markup: keyboard,
    parse_mode: 'Markdown',
    message_thread_id: config.qaTopicId,
  });

  // Pin the message
  qaPinnedMessageId = message.message_id;
  try {
    await ctx.api.pinChatMessage(config.chatId, message.message_id);
    await ctx.reply('✅ Bug tracking button created and pinned!', {
      message_thread_id: config.qaTopicId,
    });
  } catch (error) {
    console.error('Failed to pin message:', error);
    await ctx.reply('❌ Failed to pin message. Make sure bot has admin rights.', {
      message_thread_id: config.qaTopicId,
    });
  }
}

/**
 * Edit message to show user selection for bug assignment
 */
async function showUserSelectionKeyboard(
  ctx: BotContext,
  members: any[],
  bugId: number
): Promise<void> {
  const keyboard = new InlineKeyboard();

  // Add user buttons (max 3 per row for better mobile display)
  members.forEach((member, index) => {
    const displayName = getUserDisplayName(
      member.firstName,
      member.lastName,
      member.username
    );
    keyboard.text(displayName, `assign_bug_${bugId}_${member.id}`);

    // Add row break every 3 buttons
    if ((index + 1) % 3 === 0 && index < members.length - 1) {
      keyboard.row();
    }
  });

  // Edit the pinned message to show user selection
  await ctx.editMessageText('*Assign bugs to:*\n\nSelect a team member:', {
    reply_markup: keyboard,
    parse_mode: 'Markdown',
  });
}

/**
 * Send bug assignment notification to Notifications topic
 */
async function sendBugAssignmentNotification(
  bot: Bot<BotContext>,
  reporterId: number,
  reporterFirstName: string,
  reporterUsername: string | undefined,
  assigneeId: number,
  assigneeFirstName: string,
  assigneeUsername: string | undefined
): Promise<void> {
  const reporterMention = createUserMention(reporterId, reporterFirstName, reporterUsername);
  const assigneeMention = createUserMention(assigneeId, assigneeFirstName, assigneeUsername);

  const message =
    `*Bug Assignment*\n\n` +
    `${reporterMention} filed bugs assigned to ${assigneeMention}`;

  await bot.api.sendMessage(config.chatId, message, {
    message_thread_id: config.notificationsTopicId,
    parse_mode: 'Markdown',
  });
}
