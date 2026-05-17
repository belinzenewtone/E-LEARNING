#!/usr/bin/env bash
# PostgreSQL backup script for Personal Learning OS
# Run via cron: 0 2 * * * /var/www/learning-os/scripts/backup.sh >> /var/log/learning-os/backup.log 2>&1

set -euo pipefail

DB_NAME="${DB_NAME:-learning_os}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/learning-os}"
KEEP_DAYS="${KEEP_DAYS:-14}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/db_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "{\"ts\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"msg\":\"backup_start\",\"db\":\"$DB_NAME\"}"

# Dump and compress
sudo -u postgres pg_dump "$DB_NAME" | gzip > "$BACKUP_FILE"

SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
echo "{\"ts\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"msg\":\"backup_done\",\"file\":\"$BACKUP_FILE\",\"size\":\"$SIZE\"}"

# Remove backups older than KEEP_DAYS
find "$BACKUP_DIR" -name "db_*.sql.gz" -mtime +"$KEEP_DAYS" -delete

REMAINING=$(find "$BACKUP_DIR" -name "db_*.sql.gz" | wc -l)
echo "{\"ts\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"msg\":\"cleanup_done\",\"kept\":$REMAINING,\"retention_days\":$KEEP_DAYS}"
