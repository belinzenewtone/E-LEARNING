#!/bin/bash
# Learning OS VPS Deployment Script
# Run as root on Ubuntu/Debian VPS

set -e

echo "🚀 Learning OS VPS Deployment"
echo "=============================="

# ── System updates ────────────────────────────────────────────────────────────
echo "📦 Updating system packages..."
apt update -y && apt upgrade -y

# ── Install Node.js 20 ────────────────────────────────────────────────────────
if ! command -v node &> /dev/null; then
  echo "📦 Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
fi
echo "✅ Node $(node -v) | npm $(npm -v)"

# ── Install PM2 ───────────────────────────────────────────────────────────────
if ! command -v pm2 &> /dev/null; then
  echo "📦 Installing PM2..."
  npm install -g pm2
fi
echo "✅ PM2 $(pm2 -v)"

# ── Install pnpm (for monorepo) ───────────────────────────────────────────────
if ! command -v pnpm &> /dev/null; then
  echo "📦 Installing pnpm..."
  npm install -g pnpm
fi

# ── Configure firewall (if ufw available) ─────────────────────────────────────
if command -v ufw &> /dev/null; then
  echo "🔒 Configuring firewall..."
  ufw allow 22/tcp
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw --force enable
  echo "✅ Firewall configured"
fi

# ── Clone repo ────────────────────────────────────────────────────────────────
APP_DIR="/opt/learning-os"
if [ ! -d "$APP_DIR" ]; then
  echo "📥 Cloning repository..."
  git clone https://github.com/belinzenewtone/E-LEARNING.git "$APP_DIR"
else
  echo "📥 Updating repository..."
  cd "$APP_DIR" && git pull origin master
fi

cd "$APP_DIR"

# ── Environment variables ─────────────────────────────────────────────────────
echo "🔧 Setting up environment..."
cat > .env << 'ENVEOF'
# Database — local PostgreSQL
DATABASE_URL="postgresql://postgres:Belinze%401738.@localhost:5432/learning_os"

# Auth — NextAuth
NEXTAUTH_SECRET="learning-os-vps-secret-key-2026-production"
NEXTAUTH_URL="http://learning"

# Admin user
ADMIN_EMAIL="newtonebelinzeojing@gmail.com"
ADMIN_PASSWORD="Belinze@1738."
ADMIN_NAME="Belinze"

# App
NEXT_PUBLIC_APP_NAME="Personal Learning OS"
NEXT_PUBLIC_APP_URL="http://learning"

# Optional AI
ANTHROPIC_API_KEY=""
ENVEOF
echo "✅ Environment configured"

# ── Setup PostgreSQL ──────────────────────────────────────────────────────────
echo "🗄️  Setting up PostgreSQL..."
if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw learning_os; then
  sudo -u postgres createdb learning_os
  echo "✅ Database 'learning_os' created"
else
  echo "✅ Database 'learning_os' already exists"
fi

# Set postgres password if needed
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'Belinze@1738.';" 2>/dev/null || true

# ── Install dependencies ──────────────────────────────────────────────────────
echo "📦 Installing dependencies..."
npm install

# ── Generate Prisma client ────────────────────────────────────────────────────
echo "🔨 Generating Prisma client..."
npx prisma generate

# ── Run migrations ────────────────────────────────────────────────────────────
echo "🗄️  Running database migrations..."
npx prisma db push --accept-data-loss

# ── Seed database ─────────────────────────────────────────────────────────────
echo "🌱 Seeding database..."
npx tsx prisma/seed.ts

# ── Build the app ─────────────────────────────────────────────────────────────
echo "🏗️  Building Next.js app..."
NODE_ENV=production npm run build

# ── Configure PM2 ─────────────────────────────────────────────────────────────
echo "⚡ Configuring PM2..."

cat > ecosystem.config.js << 'PM2EOF'
module.exports = {
  apps: [{
    name: "learning-os",
    script: "node_modules/.bin/next",
    args: "start -p 3000",
    cwd: "/opt/learning-os",
    env: {
      NODE_ENV: "production",
    },
    instances: 1,
    autorestart: true,
    max_memory_restart: "1G",
  }]
};
PM2EOF

pm2 delete learning-os 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true
echo "✅ PM2 configured"

# ── Configure Nginx ───────────────────────────────────────────────────────────
echo "🌐 Configuring Nginx..."

cat > /etc/nginx/sites-available/learning-os << 'NGINXEOF'
server {
    listen 80;
    server_name learning _;

    # Increase upload size for study materials
    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Cache static assets
    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }

    location /public {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
}
NGINXEOF

# Enable the site
ln -sf /etc/nginx/sites-available/learning-os /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload
nginx -t && systemctl reload nginx
echo "✅ Nginx configured"

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo "🎉 Deployment complete!"
echo ""
echo "   App URL:     http://learning"
echo "   Local port:  3000"
echo ""
echo "   Useful commands:"
echo "   pm2 status              — check app status"
echo "   pm2 logs learning-os    — view app logs"
echo "   pm2 restart learning-os — restart app"
echo "   systemctl reload nginx  — reload nginx config"
echo ""
echo "   To redeploy after code changes:"
echo "   cd /opt/learning-os && git pull && npm install && npm run build && pm2 restart learning-os"
