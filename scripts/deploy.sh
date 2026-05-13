#!/bin/bash
set -e

APP_DIR="/var/www/learning-os"

echo "============================================"
echo " Learning OS — Deploy"
echo "============================================"

cd ${APP_DIR}

# ── 1. Install root deps (Next.js) ────────────────────────────────────────────
echo "[1/6] Installing web dependencies..."
npm install --workspaces=false

# ── 2. Install API deps ───────────────────────────────────────────────────────
echo "[2/6] Installing API dependencies..."
cd ${APP_DIR}/apps/api
npm install

# ── 3. Generate Prisma client ─────────────────────────────────────────────────
echo "[3/6] Generating Prisma client..."
cd ${APP_DIR}
npx prisma generate

# ── 4. Run DB migrations ──────────────────────────────────────────────────────
echo "[4/6] Running database migrations..."
npx prisma migrate deploy

# ── 5. Build both apps ────────────────────────────────────────────────────────
echo "[5/6] Building..."
npm run build                              # Next.js
cd ${APP_DIR}/apps/api && npm run build   # Express

# ── 6. Restart via PM2 ───────────────────────────────────────────────────────
echo "[6/6] Restarting services..."
cd ${APP_DIR}
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

echo ""
echo "============================================"
echo " Deployed!"
echo " Web:  http://185.167.96.157"
echo " API:  http://185.167.96.157/api/health"
echo "============================================"
