const { Client } = require("ssh2");
const conn = new Client();

conn.on("ready", () => {
  const cmd = [
    "cd /opt/learning-os",
    "git pull",
    "npm run build",
    "rsync -a .next/ /var/www/learning-os/.next/",
    "rsync -a content/ /var/www/learning-os/content/",
    "cp package.json /var/www/learning-os/",
    "npx tsx prisma/seed.ts",
    "cp .env /var/www/learning-os/.env 2>/dev/null || true",
    "pm2 restart all --update-env",
    "echo '✅ Deploy complete'",
  ].join(" && ");

  conn.exec(cmd, (err, stream) => {
    if (err) { console.error(err); conn.end(); return; }
    stream.on("close", (code) => {
      console.log(code === 0 ? "" : `\n⚠️ Exit ${code}`);
      conn.end();
    });
    stream.on("data", (d) => process.stdout.write(d.toString()));
    stream.stderr.on("data", (d) => process.stderr.write(d.toString()));
  });
});

conn.on("error", (err) => { console.error("❌", err.message); process.exit(1); });
conn.connect({ host: "185.167.96.157", port: 22, username: "root", password: "Belinze@123456", readyTimeout: 15000 });
