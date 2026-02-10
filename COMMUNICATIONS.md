# Team QA Bot - User Guide

## Overview

This bot helps our QA team track deployments and manage bug assignments through Telegram Topics.

## How to Use

### 1. Deployment Tracking (Utils Topic)

**Purpose:** Track when UI or Backend is deployed to IFT environment.

**How to use:**
1. Go to the **Utils** topic in our group
2. Send command: `/deploy` or `/start`
3. Click the appropriate button:
   - **UI deployed to IFT** - when frontend is deployed
   - **Backend deployed to IFT** - when backend is deployed
4. A notification will be sent to everyone in the Notifications topic

**When to use:**
- After successfully deploying UI to IFT
- After successfully deploying Backend to IFT
- Use this to keep the team informed about deployment status

### 2. Bug Assignment (QA Topic)

**Purpose:** Assign bugs to team members for fixing.

**How to use:**
1. Go to the **QA** topic in our group
2. Send command: `/bugs` or `/filed`
3. Click the **"Filed bugs"** button
4. Select the team member who should fix the bug
5. That person will receive a notification with your tag

**When to use:**
- When you've found bugs during testing
- When you need to assign bugs to a specific developer
- When you want to track who is responsible for fixing what

### 3. Notifications Topic

**Purpose:** Central place for all bot notifications.

**What you'll see:**
- Deployment alerts (who deployed what to IFT)
- Bug assignment notifications (who assigned bugs to whom)

**Note:** This is a read-only topic - the bot posts here automatically.

## Important Rules

### Security & Confidentiality

**PROHIBITED IN THIS CHAT:**
- Sensitive business information
- Financial data or revenue numbers
- Strategic business plans
- Confidential client information
- Unreleased product features (if under NDA)
- Personal data of users/customers
- API keys, passwords, or credentials

**ALLOWED:**
- Technical deployment status
- Bug tracking and assignments
- General QA workflow coordination
- Non-sensitive development updates

**When in doubt:** Use private channels or direct messages for sensitive topics.

## Best Practices

1. **Be specific:** When assigning bugs, provide context in the chat (not just through the bot)
2. **Stay on topic:** Use the correct topic for your message (Utils for deployments, QA for bugs)
3. **Check notifications:** Monitor the Notifications topic to stay updated
4. **Don't spam:** Use the bot buttons only when necessary
5. **Follow up:** If someone is assigned a bug, they should acknowledge it

## Troubleshooting

**Bot not responding?**
- Make sure you're using commands in the correct topic
- Check that you're using the exact command: `/deploy` or `/bugs`
- Contact the team administrator if issues persist

**Wrong person assigned?**
- Send a message in QA topic to clarify
- Use the bot again to reassign if needed

**Notification not received?**
- Check the Notifications topic
- Make sure you have notifications enabled for the group

## Support

For technical issues with the bot, contact the development team.

For questions about how to use the bot, refer to this guide or ask in the chat.

---

**Remember:** This bot is a tool to help our workflow. Keep it professional and secure.
