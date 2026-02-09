import { Context, Api } from 'grammy';
import { ChatMember } from '../types';

/**
 * Get user display name (username or first name)
 */
export function getUserDisplayName(
  firstName: string,
  lastName?: string,
  username?: string
): string {
  if (username) {
    return `@${username}`;
  }
  return lastName ? `${firstName} ${lastName}` : firstName;
}

/**
 * Create user mention for notifications
 */
export function createUserMention(
  userId: number,
  firstName: string,
  username?: string
): string {
  if (username) {
    return `@${username}`;
  }
  // Use markdown link format for users without username
  return `[${firstName}](tg://user?id=${userId})`;
}

/**
 * Get all non-bot members from chat
 */
export async function getChatMembers(
  api: Api,
  chatId: number
): Promise<ChatMember[]> {
  try {
    // Get chat administrators (includes all members for small groups)
    const admins = await api.getChatAdministrators(chatId);

    const members: ChatMember[] = admins
      .filter((admin) => !admin.user.is_bot)
      .map((admin) => ({
        id: admin.user.id,
        firstName: admin.user.first_name,
        lastName: admin.user.last_name,
        username: admin.user.username,
        isBot: admin.user.is_bot,
      }));

    return members;
  } catch (error) {
    console.error('Error fetching chat members:', error);
    throw new Error('Failed to fetch chat members');
  }
}

/**
 * Format error message for user
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}

/**
 * Check if message is in specific topic
 */
export function isInTopic(ctx: Context, topicId: number): boolean {
  return ctx.message?.message_thread_id === topicId;
}

/**
 * Check if callback query is from specific topic
 */
export function isCallbackFromTopic(ctx: Context, topicId: number): boolean {
  return ctx.callbackQuery?.message?.message_thread_id === topicId;
}
