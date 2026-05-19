const { Client } = require("ssh2");

const VPS_HOST = process.env.VPS_HOST ?? "185.167.96.157";
const VPS_USER = process.env.VPS_USER ?? "root";
const VPS_PASS = process.env.VPS_PASS;

if (!VPS_PASS) {
  console.error("VPS_PASS environment variable is required.\nUsage: VPS_PASS=<password> node scripts/deploy-remote.js");
  process.exit(1);
}

const STEPS = [
  "cd /opt/learning-os",
  "git pull origin master",
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
  "cp /var/www/learning-os/.env /var/www/learning-os/apps/api/.env",
  "pm2 restart all --update-env",
  "pm2 status",
].join(" && ");

const conn = new Client();

conn.on("ready", () => {
  console.log("Connected to VPS. Running deploy...\n");
  conn.exec(STEPS, (err, stream) => {
    if (err) { console.error(err); conn.end(); return; }
    stream.on("close", () => conn.end());
    stream.on("data", (d) => process.stdout.write(d.toString()));
    stream.stderr.on("data", (d) => process.stderr.write(d.toString()));
  });
});

conn.on("error", (err) => { console.error("SSH error:", err.message); process.exit(1); });
conn.connect({ host: VPS_HOST, port: 22, username: VPS_USER, password: VPS_PASS, readyTimeout: 15000 });
