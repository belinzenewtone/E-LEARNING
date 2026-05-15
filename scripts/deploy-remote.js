const { Client } = require("ssh2");
const conn = new Client();

conn.on("ready", () => {
  console.log("✅ Connected to VPS");
  conn.exec("pm2 list | cat && pm2 restart all --update-env || pm2 start /opt/learning-os/ecosystem.config.js", (err, stream) => {
    if (err) { console.error(err); conn.end(); return; }
    stream.on("close", (code) => { console.log(code === 0 ? "\n✅ Deployed and restarted" : `\n⚠️  Exit ${code}`); conn.end(); });
    stream.on("data", (d) => process.stdout.write(d.toString()));
    stream.stderr.on("data", (d) => process.stderr.write(d.toString()));
  });
});

conn.on("error", (err) => { console.error("❌", err.message); process.exit(1); });

conn.connect({ host: "185.167.96.157", port: 22, username: "root", password: "Belinze@123456", readyTimeout: 15000 });
