#!/bin/bash
# Run this from your LOCAL Windows machine (Git Bash or WSL)
# Usage: bash scripts/upload.sh

SERVER="root@185.167.96.157"
REMOTE_DIR="/var/www/learning-os"
LOCAL_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "Uploading Learning OS to ${SERVER}:${REMOTE_DIR}..."

rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude 'apps/api/dist' \
  --exclude 'apps/api/node_modules' \
  --exclude '.env' \
  --exclude 'apps/api/.env' \
  --exclude '.git' \
  "${LOCAL_DIR}/" \
  "${SERVER}:${REMOTE_DIR}/"

echo ""
echo "Upload complete. Now run on the server:"
echo "  ssh ${SERVER}"
echo "  bash ${REMOTE_DIR}/scripts/deploy.sh"
