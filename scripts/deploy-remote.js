const { Client } = require("ssh2");
const conn = new Client();

conn.on("ready", () => {
  const cmd = [
    "cd /opt/learning-os",
    "git pull",
    "npx prisma db push --accept-data-loss 2>&1 | tail -5",
    "npx prisma generate 2>&1 | tail -3",
    "npm run build",
    "cd apps/api && npm run build 2>&1 | tail -5 && cd ../..",
    "rsync -a .next/ /var/www/learning-os/.next/",
    "cp -rf node_modules/.prisma/client/ /var/www/learning-os/node_modules/.prisma/",
    "rsync -a apps/api/dist/ /var/www/learning-os/apps/api/dist/",
    "rsync -a scripts/ /var/www/learning-os/scripts/ && chmod +x /var/www/learning-os/scripts/*.sh",
    "rsync -a config/ /var/www/learning-os/config/ 2>/dev/null || true",
    "rsync -a content/ /var/www/learning-os/content/ 2>/dev/null || true",
    "cp package.json /var/www/learning-os/",
    "cp .env /var/www/learning-os/.env 2>/dev/null || true",
    "pm2 restart all --update-env",
    "pm2 status",
  ].join(" && ");

  conn.exec(cmd, (err, stream) => {
    if (err) { console.error(err); conn.end(); return; }
    stream.on("close", () => conn.end());
    stream.on("data", (d) => process.stdout.write(d.toString()));
    stream.stderr.on("data", (d) => process.stderr.write(d.toString()));
  });
});

conn.on("error", (err) => { console.error("❌", err.message); process.exit(1); });
conn.connect({ host: "185.167.96.157", port: 22, username: "root", password: "Belinze@123456", readyTimeout: 15000 });
