#!/bin/bash

# VPS Setup Script for QA Bot
# Run this script on your VPS to set up the bot for the first time

set -e  # Exit on error

echo "🚀 Starting VPS setup for QA Bot..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${YELLOW}⚠️  This script needs sudo privileges. Please run with sudo.${NC}"
    exit 1
fi

# Get the actual user (not root)
ACTUAL_USER="${SUDO_USER:-$USER}"
USER_HOME=$(eval echo ~$ACTUAL_USER)

echo -e "${GREEN}✅ Running as user: $ACTUAL_USER${NC}"

# Update system
echo "📦 Updating system packages..."
apt-get update
apt-get upgrade -y

# Install Node.js (using NodeSource repository for latest LTS)
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
else
    echo -e "${GREEN}✅ Node.js already installed: $(node --version)${NC}"
fi

# Install Git if not present
if ! command -v git &> /dev/null; then
    echo "📦 Installing Git..."
    apt-get install -y git
else
    echo -e "${GREEN}✅ Git already installed${NC}"
fi

# Install build essentials for native modules (better-sqlite3)
echo "📦 Installing build tools..."
apt-get install -y build-essential python3

# Create project directory
PROJECT_DIR="$USER_HOME/team-qa-bot"
echo "📁 Setting up project directory: $PROJECT_DIR"

if [ -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}⚠️  Project directory already exists. Skipping git clone.${NC}"
else
    echo "Enter your GitHub repository URL (e.g., git@github.com:username/team-qa-bot.git):"
    read -r REPO_URL

    # Clone repository as the actual user
    sudo -u $ACTUAL_USER git clone "$REPO_URL" "$PROJECT_DIR"
fi

cd "$PROJECT_DIR"

# Install dependencies
echo "📦 Installing npm dependencies..."
sudo -u $ACTUAL_USER npm install

# Build project
echo "🔨 Building TypeScript..."
sudo -u $ACTUAL_USER npm run build

# Create .env file if it doesn't exist
if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo "📝 Creating .env file..."
    sudo -u $ACTUAL_USER cp .env.example .env
    echo -e "${YELLOW}⚠️  Please edit $PROJECT_DIR/.env with your configuration!${NC}"
    echo -e "${YELLOW}   Run: nano $PROJECT_DIR/.env${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Create systemd service
echo "⚙️  Creating systemd service..."
cat > /etc/systemd/system/qa-bot.service <<EOF
[Unit]
Description=Telegram QA Bot
After=network.target

[Service]
Type=simple
User=$ACTUAL_USER
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/node $PROJECT_DIR/dist/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=qa-bot

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
echo "🔄 Reloading systemd..."
systemctl daemon-reload

# Enable service to start on boot
echo "✅ Enabling service to start on boot..."
systemctl enable qa-bot

echo ""
echo -e "${GREEN}✅ VPS Setup completed successfully!${NC}"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your configuration:"
echo "   nano $PROJECT_DIR/.env"
echo ""
echo "2. Start the bot:"
echo "   sudo systemctl start qa-bot"
echo ""
echo "3. Check bot status:"
echo "   sudo systemctl status qa-bot"
echo ""
echo "4. View bot logs:"
echo "   sudo journalctl -u qa-bot -f"
echo ""
echo "🔑 Don't forget to add your VPS SSH key to GitHub Secrets for auto-deployment!"
