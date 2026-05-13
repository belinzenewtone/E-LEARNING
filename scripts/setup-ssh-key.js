const { Client } = require("ssh2");

const conn = new Client();

const HOST = "185.167.96.157";
const USER = "root";
const PASSWORD = "Belinze@123456";
const KEY_PATH = `${process.env.USERPROFILE}\\.ssh\\id_ed25519`;

conn.on("ready", () => {
  console.log("✅ Connected to VPS");

  // Copy SSH key for passwordless future access
  const key = require("fs").readFileSync(KEY_PATH + ".pub", "utf8").trim();

  conn.exec(`mkdir -p ~/.ssh && echo "${key}" >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys`, (err, stream) => {
    if (err) throw err;
    stream.on("close", (code) => {
      console.log(code === 0 ? "✅ SSH key installed" : "⚠️  Key install had issues");
      conn.end();
    });
    stream.on("data", (d) => process.stdout.write(d.toString()));
    stream.stderr.on("data", (d) => process.stderr.write(d.toString()));
  });
});

conn.on("error", (err) => {
  console.error("❌ Connection failed:", err.message);
  process.exit(1);
});

conn.connect({
  host: HOST,
  port: 22,
  username: USER,
  password: PASSWORD,
  readyTimeout: 10000,
});
