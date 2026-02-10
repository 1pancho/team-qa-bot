import { Bot } from 'grammy';
import { BotContext } from '../types';

/**
 * Setup rules command handler
 */
export function setupRulesHandler(bot: Bot<BotContext>): void {
  bot.command('rules', async (ctx) => {
    const rulesMessage = `*TEAM QA BOT - RULES & GUIDE*

*DEPLOYMENT TRACKING (Utils topic)*
• Click buttons in Utils topic
• Track UI or Backend deployments to IFT
• Notifications sent to Notifications topic

*BUG ASSIGNMENT (QA topic)*
• Click button in QA topic
• Assign bugs to team members
• Tagged notifications sent to Notifications topic

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

*Setup (Admin only, run once):*
\`/setup_utils\` - Create pinned deployment buttons in Utils topic
\`/setup_qa\` - Create pinned bug tracking button in QA topic

*Anywhere:*
\`/rules\` - Show bot rules and security guidelines
\`/help\` - Show this help message

*How to use:*
- Deployment: Click buttons in Utils topic
- Bug assignment: Click button in QA topic
- All notifications go to Notifications topic`;

    await ctx.reply(helpMessage, {
      parse_mode: 'Markdown',
    });
  });
}
