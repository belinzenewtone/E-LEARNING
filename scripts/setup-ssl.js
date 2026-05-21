/**
 * One-time SSL setup script for beltech.co.ke
 * Run after DNS A record has propagated: node scripts/setup-ssl.js
 */

const { Client } = require("ssh2");

const VPS_HOST = process.env.VPS_HOST ?? "185.167.96.157";
const VPS_USER = process.env.VPS_USER ?? "root";
const VPS_PASS = process.env.VPS_PASS;
const DOMAIN   = "beltech.co.ke";

if (!VPS_PASS) {
  console.error("Usage: VPS_PASS=<password> node scripts/setup-ssl.js");
  process.exit(1);
}

const STEPS = [
  // Install certbot if not present
  "apt-get install -y certbot python3-certbot-nginx 2>&1 | tail -5",

  // Stop nginx so certbot can bind to port 80 for the challenge
  "systemctl stop nginx",

  // Obtain certificate (standalone mode)
  `certbot certonly --standalone --non-interactive --agree-tos --email admin@beltech.co.ke -d ${DOMAIN} -d www.${DOMAIN} 2>&1`,

  // Copy our nginx config with the domain already set
  "cp /opt/learning-os/nginx.conf /etc/nginx/sites-available/learning-os",
  "ln -sf /etc/nginx/sites-available/learning-os /etc/nginx/sites-enabled/learning-os",
  "rm -f /etc/nginx/sites-enabled/default",

  // Test and start nginx
  "nginx -t 2>&1",
  "systemctl start nginx",
  "systemctl enable nginx",

  // Set up auto-renew cron (certbot installs a timer but add a hook to reload nginx)
  "echo '0 3 * * * root certbot renew --quiet --deploy-hook \"systemctl reload nginx\"' > /etc/cron.d/certbot-renew",

  // Update .env on server with new NEXTAUTH_URL
  `sed -i 's|NEXTAUTH_URL=.*|NEXTAUTH_URL=https://${DOMAIN}|' /var/www/learning-os/.env`,
  `sed -i 's|NEXTAUTH_URL=.*|NEXTAUTH_URL=https://${DOMAIN}|' /opt/learning-os/.env`,

  // Restart the app so it picks up the new env
  "pm2 restart all --update-env",
  "pm2 status",
].join(" && ");

const conn = new Client();

conn.on("ready", () => {
  console.log("Connected. Setting up SSL for", DOMAIN, "...\n");
  conn.exec(STEPS, (err, stream) => {
    if (err) { console.error(err); conn.end(); return; }
    stream.on("close", () => { console.log("\n✅ SSL setup complete — https://" + DOMAIN); conn.end(); });
    stream.on("data",  (d) => process.stdout.write(d.toString()));
    stream.stderr.on("data", (d) => process.stderr.write(d.toString()));
  });
});

conn.on("error", (err) => { console.error("SSH error:", err.message); process.exit(1); });
conn.connect({ host: VPS_HOST, port: 22, username: VPS_USER, password: VPS_PASS, readyTimeout: 15000 });
