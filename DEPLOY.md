# 🚀 Deployment Guide

Quick guide for deploying QA Bot to your VPS with automatic GitHub Actions deployment.

## Prerequisites

- VPS with Ubuntu/Debian (DigitalOcean, AWS, Hetzner, etc.)
- SSH access to your VPS
- GitHub account
- Bot token from @BotFather

## Quick Start (5 steps)

### 1️⃣ Create GitHub Repository

```bash
# In your local project directory
git add .
git commit -m "Initial commit: QA Bot"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/team-qa-bot.git
git branch -M main
git push -u origin main
```

### 2️⃣ Setup VPS

**SSH into your VPS:**
```bash
ssh your_username@your_vps_ip
```

**Clone and setup:**
```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/team-qa-bot.git
cd team-qa-bot

# Run automated setup
sudo bash scripts/setup-vps.sh
```

**Configure bot:**
```bash
nano .env
```

Add your configuration:
```env
BOT_TOKEN=your_token_here
CHAT_ID=-1001234567890
UTILS_TOPIC_ID=2
QA_TOPIC_ID=3
NOTIFICATIONS_TOPIC_ID=4
```

**Start bot:**
```bash
sudo systemctl start qa-bot
sudo systemctl status qa-bot
```

### 3️⃣ Generate SSH Keys for GitHub Actions

**On your VPS:**
```bash
# Generate new SSH key (if needed)
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_deploy

# Add to authorized_keys
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys

# Show private key (copy this)
cat ~/.ssh/github_deploy
```

### 4️⃣ Add GitHub Secrets

Go to: **GitHub Repository → Settings → Secrets and variables → Actions**

Click **"New repository secret"** and add:

| Secret Name | Value | Example |
|------------|-------|---------|
| `VPS_HOST` | Your VPS IP address | `123.45.67.89` |
| `VPS_USERNAME` | Your SSH username | `ubuntu` or `root` |
| `VPS_SSH_KEY` | Private SSH key content | Content from `cat ~/.ssh/github_deploy` |
| `VPS_PORT` | SSH port (optional) | `22` (default) |

### 5️⃣ Test Auto-Deploy

**Make a small change:**
```bash
# In your local repository
echo "# Test change" >> README.md
git add .
git commit -m "Test: auto-deploy"
git push
```

**Check deployment:**
1. Go to GitHub → Actions tab
2. Watch the deployment workflow run
3. Check VPS logs: `sudo journalctl -u qa-bot -f`

## Useful Commands

### VPS Bot Management

```bash
# Start bot
sudo systemctl start qa-bot

# Stop bot
sudo systemctl stop qa-bot

# Restart bot
sudo systemctl restart qa-bot

# Check status
sudo systemctl status qa-bot

# View real-time logs
sudo journalctl -u qa-bot -f

# View last 100 lines of logs
sudo journalctl -u qa-bot -n 100

# View logs from today
sudo journalctl -u qa-bot --since today
```

### Manual Deployment (without GitHub Actions)

```bash
# SSH to VPS
ssh your_username@your_vps_ip

# Navigate to project
cd ~/team-qa-bot

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build TypeScript
npm run build

# Restart bot
sudo systemctl restart qa-bot

# Check status
sudo systemctl status qa-bot
```

### Update Environment Variables

```bash
# Edit .env on VPS
nano ~/team-qa-bot/.env

# Restart bot to apply changes
sudo systemctl restart qa-bot
```

## Troubleshooting

### Bot not starting

```bash
# Check logs for errors
sudo journalctl -u qa-bot -n 50

# Check if .env file exists and is configured
cat ~/team-qa-bot/.env

# Check if build was successful
ls ~/team-qa-bot/dist/

# Manually run bot to see errors
cd ~/team-qa-bot
node dist/index.js
```

### GitHub Actions deployment fails

**Check SSH connection:**
```bash
# From your local machine
ssh -i path/to/private_key your_username@your_vps_ip
```

**Common issues:**
- Wrong VPS_HOST (IP address)
- Wrong VPS_USERNAME
- Wrong SSH key format (make sure to copy entire key including BEGIN/END lines)
- Firewall blocking SSH port
- Wrong VPS_PORT

**Check GitHub Actions logs:**
- Go to GitHub → Actions → Click on failed workflow
- Read error messages

### Database issues

```bash
# Check if database file exists
ls -lh ~/team-qa-bot/*.db

# Reset database (WARNING: deletes all data)
rm ~/team-qa-bot/qa-bot.db
sudo systemctl restart qa-bot
```

### Permissions issues

```bash
# Fix file ownership
sudo chown -R your_username:your_username ~/team-qa-bot

# Fix permissions
chmod -R 755 ~/team-qa-bot
chmod 600 ~/team-qa-bot/.env
```

## Security Best Practices

1. **Never commit .env file**
   - Already in .gitignore
   - Contains sensitive tokens

2. **Use SSH keys, not passwords**
   - Generate dedicated key for GitHub Actions
   - Keep private keys secure

3. **Restrict .env file permissions**
   ```bash
   chmod 600 ~/team-qa-bot/.env
   ```

4. **Regular updates**
   ```bash
   # Update system packages
   sudo apt update && sudo apt upgrade -y

   # Update Node.js dependencies
   cd ~/team-qa-bot
   npm update
   ```

5. **Monitor logs**
   ```bash
   # Check for suspicious activity
   sudo journalctl -u qa-bot --since today | grep -i error
   ```

## Monitoring

### Check bot health

```bash
# Is bot running?
sudo systemctl is-active qa-bot

# How long has bot been running?
systemctl status qa-bot | grep "Active"

# CPU/Memory usage
top -bn1 | grep node
```

### Set up alerts (optional)

Create a simple monitoring script:

```bash
nano ~/check-bot.sh
```

```bash
#!/bin/bash
if ! systemctl is-active --quiet qa-bot; then
    echo "Bot is down! Restarting..."
    sudo systemctl restart qa-bot
    # Optional: send notification
fi
```

```bash
chmod +x ~/check-bot.sh

# Add to crontab (check every 5 minutes)
crontab -e
# Add: */5 * * * * /home/your_username/check-bot.sh
```

## Rollback

If deployment breaks the bot:

```bash
# SSH to VPS
ssh your_username@your_vps_ip
cd ~/team-qa-bot

# Check git log
git log --oneline -5

# Rollback to previous commit
git reset --hard HEAD~1

# Rebuild and restart
npm install
npm run build
sudo systemctl restart qa-bot
```

## Scaling

For high-traffic bots:

1. **Use process manager (PM2)** instead of systemd
2. **Add Redis** for session storage
3. **Use PostgreSQL** instead of SQLite
4. **Load balancer** for multiple instances
5. **Monitoring tools** (Grafana, Prometheus)

## Resources

- [Grammy Documentation](https://grammy.dev/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [GitHub Actions SSH Deploy](https://github.com/appleboy/ssh-action)
- [Systemd Service Management](https://www.freedesktop.org/software/systemd/man/systemctl.html)

---

Need help? Check logs first: `sudo journalctl -u qa-bot -f`
