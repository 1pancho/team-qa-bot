# Team QA Bot

A Telegram bot for QA team workflow management using Telegram Topics. Tracks deployments, manages bug assignments, and sends notifications to team members.

## Features

### 📦 Utils Topic - Deployment Tracking
- Click buttons to record deployments (UI/Backend to IFT)
- Automatic notifications sent to Notifications topic with user tags
- Deployment history stored in database

### 🐛 QA Topic - Bug Assignment
- File bugs and assign them to team members
- Dynamic user selection from chat participants
- Automated notifications to assigned team members

### 🔔 Notifications Topic
- Centralized notifications for all team activities
- User tags for proper mention notifications
- Keeps team informed in real-time

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Bot Framework**: Grammy (modern Telegram bot library)
- **Database**: SQLite with better-sqlite3
- **Config**: dotenv for environment variables

## Prerequisites

- Node.js 18+ installed
- Telegram account
- Basic understanding of Telegram bots and groups

## Setup Instructions

### 1. Create Telegram Bot

1. Open Telegram and find [@BotFather](https://t.me/BotFather)
2. Send `/newbot` command
3. Follow instructions to create your bot
4. Copy the bot token (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Create Supergroup with Topics

1. Create a new Telegram group
2. Convert it to supergroup:
   - Go to group settings
   - Add more members (convert to supergroup)
3. Enable Topics:
   - Group settings → Topics → Enable
4. Create three topics:
   - **Utils** - for deployment tracking
   - **QA** - for bug assignments
   - **Notifications** - for all notifications

### 3. Add Bot to Group

1. Add your bot to the supergroup
2. Make bot an administrator with these permissions:
   - Send messages
   - Delete messages
   - Read message history

### 4. Get IDs (Chat ID and Topic IDs)

**Method 1 - Using Web Telegram:**
1. Open [Telegram Web](https://web.telegram.org/)
2. Open your supergroup
3. Open each topic
4. Check the URL:
   - Chat ID: the number after `#-` (e.g., `-1001234567890`)
   - Topic ID: the number at the end (e.g., `2` in `tgico://chat?chat=-1001234567890&thread=2`)

**Method 2 - Using code:**
1. Temporarily add this code to your bot to log IDs:
```typescript
bot.on('message', (ctx) => {
  console.log('Chat ID:', ctx.chat.id);
  console.log('Topic ID:', ctx.message.message_thread_id);
});
```
2. Send a message in each topic
3. Check console output

### 5. Configure Environment

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your values:
   ```
   BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   CHAT_ID=-1001234567890
   UTILS_TOPIC_ID=2
   QA_TOPIC_ID=3
   NOTIFICATIONS_TOPIC_ID=4
   ```

### 6. Install Dependencies

```bash
npm install
```

### 7. Run the Bot

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

## Usage

### Deployment Tracking (Utils Topic)

1. In the **Utils** topic, send command:
   ```
   /start
   or
   /deploy
   ```

2. Click one of the buttons:
   - **UI deployed to IFT** 🎨
   - **Backend deployed to IFT** ⚙️

3. Bot will:
   - Record deployment in database
   - Send notification to Notifications topic with your tag
   - Confirm the action

### Bug Assignment (QA Topic)

1. In the **QA** topic, send command:
   ```
   /bugs
   or
   /filed
   ```

2. Click **"Filed bugs ➡️"** button

3. Select a team member from the list

4. Bot will:
   - Record bug assignment in database
   - Send notification to Notifications topic tagging both you and assignee
   - Confirm the assignment

## Deployment to VPS

### Option 1: Automated Deployment with GitHub Actions (Recommended)

This setup enables automatic deployment to your VPS whenever you push to the `main` branch.

#### Step 1: Initial VPS Setup

1. **Connect to your VPS via SSH:**
   ```bash
   ssh your_username@your_vps_ip
   ```

2. **Download and run the setup script:**
   ```bash
   # Clone your repository first
   git clone https://github.com/YOUR_USERNAME/team-qa-bot.git
   cd team-qa-bot

   # Run setup script
   sudo bash scripts/setup-vps.sh
   ```

   This script will:
   - Install Node.js, Git, and build tools
   - Install project dependencies
   - Build the TypeScript code
   - Create a systemd service
   - Set up automatic startup

3. **Configure your bot:**
   ```bash
   nano ~/team-qa-bot/.env
   ```
   Add your bot configuration (token, chat IDs, topic IDs)

4. **Start the bot:**
   ```bash
   sudo systemctl start qa-bot
   sudo systemctl status qa-bot
   ```

5. **View logs:**
   ```bash
   sudo journalctl -u qa-bot -f
   ```

#### Step 2: Setup GitHub Actions Auto-Deploy

1. **Generate SSH key on your VPS (if you don't have one):**
   ```bash
   ssh-keygen -t ed25519 -C "github-actions"
   cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
   cat ~/.ssh/id_ed25519  # Copy this private key
   ```

2. **Add secrets to your GitHub repository:**

   Go to: `GitHub Repository → Settings → Secrets and variables → Actions → New repository secret`

   Add these secrets:
   - `VPS_HOST`: Your VPS IP address (e.g., `123.45.67.89`)
   - `VPS_USERNAME`: Your VPS username (e.g., `ubuntu` or `root`)
   - `VPS_SSH_KEY`: The private SSH key (content of `id_ed25519`)
   - `VPS_PORT`: SSH port (default: `22`)

3. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/team-qa-bot.git
   git push -u origin main
   ```

4. **Automatic deployment:**
   - Every push to `main` branch will trigger auto-deployment
   - Check deployment status in `Actions` tab on GitHub
   - Bot will automatically restart with new code

#### Step 3: Manage Bot on VPS

**Start bot:**
```bash
sudo systemctl start qa-bot
```

**Stop bot:**
```bash
sudo systemctl stop qa-bot
```

**Restart bot:**
```bash
sudo systemctl restart qa-bot
```

**Check status:**
```bash
sudo systemctl status qa-bot
```

**View logs:**
```bash
# Real-time logs
sudo journalctl -u qa-bot -f

# Last 100 lines
sudo journalctl -u qa-bot -n 100

# Logs from today
sudo journalctl -u qa-bot --since today
```

**Update .env file:**
```bash
nano ~/team-qa-bot/.env
sudo systemctl restart qa-bot
```

### Option 2: Manual Deployment

If you prefer manual deployment without GitHub Actions:

1. **SSH into your VPS and pull changes:**
   ```bash
   cd ~/team-qa-bot
   git pull origin main
   npm install
   npm run build
   sudo systemctl restart qa-bot
   ```

2. **Or use a manual deploy script:**
   ```bash
   cd ~/team-qa-bot
   git pull && npm install && npm run build && sudo systemctl restart qa-bot
   ```

### Deployment Checklist

- ✅ VPS with Ubuntu/Debian installed
- ✅ SSH access to VPS configured
- ✅ Node.js 18+ installed
- ✅ Bot code deployed and built
- ✅ .env file configured with correct values
- ✅ Systemd service created and enabled
- ✅ GitHub Secrets configured (for auto-deploy)
- ✅ Bot running and responding in Telegram

## Project Structure

```
team-qa-bot/
├── src/
│   ├── index.ts                 # Bot entry point
│   ├── config.ts                # Configuration loader
│   ├── database/
│   │   ├── db.ts               # Database connection & queries
│   │   └── schema.sql          # Database schema
│   ├── handlers/
│   │   ├── common.handler.ts   # Shared utilities
│   │   ├── utils.handler.ts    # Deployment tracking
│   │   └── qa.handler.ts       # Bug assignment
│   └── types/
│       └── index.ts            # TypeScript types
├── package.json
├── tsconfig.json
├── .env                        # Your configuration (not in git)
├── .env.example               # Template
└── README.md
```

## Database

SQLite database (`qa-bot.db`) stores:

**Deployments table:**
- Deployment type (UI/Backend)
- Deployer ID and name
- Timestamp

**Bugs table:**
- Reporter ID and name
- Assigned user ID and name
- Message ID reference
- Status (pending/assigned)
- Timestamp

## Troubleshooting

### Bot doesn't respond

- Check if bot is admin in the group
- Verify topic IDs are correct
- Check bot token is valid
- Look at console logs for errors

### Can't get chat/topic IDs

- Use [@userinfobot](https://t.me/userinfobot) - forward messages to it
- Use web.telegram.org and check URLs
- Add logging code (see Setup step 4)

### Database errors

- Make sure the bot has write permissions in the directory
- Delete `qa-bot.db` file to reset database
- Check SQLite is installed properly

### No users in assignment list

- Bot needs permission to read chat members
- Make sure bot is admin
- Try with at least 2-3 real users in chat

## Development

**Run in development mode with hot reload:**
```bash
npm run dev
```

**Build TypeScript:**
```bash
npm run build
```

**Run built version:**
```bash
npm start
```

## License

MIT

## Support

For issues or questions, check the console logs first. Most errors are related to:
- Incorrect environment variables
- Missing bot permissions
- Wrong chat/topic IDs

---

Made with ❤️ for QA teams

---

**Bot Status:** 🟢 Deployed and Running
