#!/usr/bin/env bash
# Tier 3 security setup: fail2ban + backup cron
# Run once on VPS: sudo bash scripts/setup-tier3.sh

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/learning-os}"
LOG_DIR="/var/log/learning-os"
BACKUP_DIR="/var/backups/learning-os"

echo "=== Installing fail2ban ==="
apt-get install -y fail2ban

echo "=== Copying fail2ban filter ==="
cp "$APP_DIR/config/fail2ban/filter-learning-os.conf" /etc/fail2ban/filter.d/learning-os.conf

echo "=== Appending jail config ==="
# Only append if not already present
if ! grep -q "\[learning-os\]" /etc/fail2ban/jail.local 2>/dev/null; then
  cat "$APP_DIR/config/fail2ban/jail-learning-os.conf" >> /etc/fail2ban/jail.local
fi

echo "=== Restarting fail2ban ==="
systemctl enable fail2ban
systemctl restart fail2ban

echo "=== Creating log and backup directories ==="
mkdir -p "$LOG_DIR" "$BACKUP_DIR"
chmod 750 "$BACKUP_DIR"

echo "=== Making backup script executable ==="
chmod +x "$APP_DIR/scripts/backup.sh"

echo "=== Installing backup cron (runs daily at 02:00) ==="
CRON_LINE="0 2 * * * APP_DIR=$APP_DIR BACKUP_DIR=$BACKUP_DIR $APP_DIR/scripts/backup.sh >> $LOG_DIR/backup.log 2>&1"
( crontab -l 2>/dev/null | grep -v "backup.sh"; echo "$CRON_LINE" ) | crontab -

echo ""
echo "=== Tier 3 setup complete ==="
echo "  fail2ban status:  sudo fail2ban-client status learning-os"
echo "  backup dir:       $BACKUP_DIR"
echo "  backup log:       $LOG_DIR/backup.log"
echo "  run backup now:   sudo $APP_DIR/scripts/backup.sh"
