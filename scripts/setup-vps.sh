#!/bin/bash
set -e

APP_DIR="/var/www/learning-os"
DB_NAME="learning_os"
DB_USER="learning_os_user"
DB_PASS=$(openssl rand -base64 24)
NODE_VERSION="22"

echo "============================================"
echo " Learning OS — VPS Setup (Ubuntu 24.04)"
echo "============================================"

# ── 1. System update ──────────────────────────────────────────────────────────
echo "[1/8] Updating system..."
apt-get update -qq && apt-get upgrade -y -qq

# ── 2. Install essentials ─────────────────────────────────────────────────────
echo "[2/8] Installing essentials..."
apt-get install -y -qq curl git ufw build-essential

# ── 3. Install Node.js 22 ─────────────────────────────────────────────────────
echo "[3/8] Installing Node.js ${NODE_VERSION}..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt-get install -y -qq nodejs
node -v && npm -v

# Install PM2 globally
npm install -g pm2 tsx

# ── 4. Install PostgreSQL 16 ──────────────────────────────────────────────────
echo "[4/8] Installing PostgreSQL..."
apt-get install -y -qq postgresql postgresql-contrib

systemctl enable postgresql
systemctl start postgresql

# Create DB user and database
sudo -u postgres psql <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';
  END IF;
END
\$\$;
CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
SQL

echo "  DB created: ${DB_NAME}"
echo "  DB user:    ${DB_USER}"
echo "  DB pass:    ${DB_PASS}  ← save this!"

# ── 5. Install Nginx ──────────────────────────────────────────────────────────
echo "[5/8] Installing Nginx..."
apt-get install -y -qq nginx
systemctl enable nginx

cat > /etc/nginx/sites-available/learning-os <<NGINX
server {
    listen 80;
    server_name _;

    # Express API
    location /api/ {
        proxy_pass         http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade \$http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Next.js
    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade \$http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/learning-os /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# ── 6. Firewall ───────────────────────────────────────────────────────────────
echo "[6/8] Configuring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# ── 7. App directory + env files ──────────────────────────────────────────────
echo "[7/8] Setting up app directory..."
mkdir -p ${APP_DIR}
mkdir -p ${APP_DIR}/apps/api

# Write root .env
cat > ${APP_DIR}/.env <<ENV
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}"
JWT_SECRET="$(openssl rand -base64 48)"
API_INTERNAL_URL="http://localhost:3001"
NEXT_PUBLIC_API_URL="http://185.167.96.157"
NODE_ENV="production"
ENV

# Write api .env
cat > ${APP_DIR}/apps/api/.env <<ENV
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}"
JWT_SECRET="$(cat ${APP_DIR}/.env | grep JWT_SECRET | cut -d'"' -f2)"
PORT=3001
NODE_ENV="production"
ALLOWED_ORIGINS="http://185.167.96.157,http://localhost:3000"
ENV

echo "  .env files written to ${APP_DIR}"

# ── 8. PM2 startup ────────────────────────────────────────────────────────────
echo "[8/8] Configuring PM2 startup..."
pm2 startup systemd -u root --hp /root | tail -1 | bash || true

echo ""
echo "============================================"
echo " Setup complete!"
echo "============================================"
echo ""
echo " Next: upload your code to ${APP_DIR}"
echo " Then run: /var/www/learning-os/scripts/deploy.sh"
echo ""
echo " DB connection string saved to ${APP_DIR}/.env"
echo " Server accessible at: http://185.167.96.157"
echo ""
