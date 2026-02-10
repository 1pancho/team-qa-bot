import { Bot } from 'grammy';
import { BotContext } from '../types';

/**
 * Setup rules command handler
 */
export function setupRulesHandler(bot: Bot<BotContext>): void {
  bot.command('rules', async (ctx) => {
    const rulesMessage = `*TEAM QA BOT - RULES & GUIDE*

*DEPLOYMENT TRACKING (Utils topic)*
• Command: \`/deploy\`
• Track UI or Backend deployments to IFT
• Notifications sent automatically

*BUG ASSIGNMENT (QA topic)*
• Command: \`/bugs\`
• Assign bugs to team members
• Tagged notifications to assignees

*SECURITY RULES - PROHIBITED:*
❌ Sensitive business information
❌ Financial data or revenue numbers
❌ Confidential client information
❌ API keys, passwords, credentials
❌ Personal data of users/customers

*ALLOWED:*
✅ Deployment status
✅ Bug tracking
✅ QA workflow coordination
✅ Non-sensitive updates

*When in doubt:* Use messenger "Команда" for sensitive topics.`;

    await ctx.reply(rulesMessage, {
      parse_mode: 'Markdown',
    });
  });

  bot.command('help', async (ctx) => {
    const helpMessage = `*Available Commands:*

*Utils Topic:*
\`/deploy\` or \`/start\` - Show deployment buttons

*QA Topic:*
\`/bugs\` or \`/filed\` - Show bug assignment button

*Anywhere:*
\`/rules\` - Show bot rules and security guidelines
\`/help\` - Show this help message

For detailed instructions, check COMMUNICATIONS.md`;

    await ctx.reply(helpMessage, {
      parse_mode: 'Markdown',
    });
  });
}
