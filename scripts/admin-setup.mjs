// Creates the admin secrets and writes them to .env.local.
//   npm run admin:setup -- "your strong password"          (password + authenticator app, recommended)
//   npm run admin:setup -- "your strong password" --no-2fa
// Copy the same variables to your hosting dashboard (Netlify/Vercel > Environment variables). Never commit them.
import { createHash, randomBytes, scryptSync } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import QRCode from "qrcode";

const args = process.argv.slice(2);
const password = args.find((a) => !a.startsWith("--"));
const twoFactor = !args.includes("--no-2fa");
if (!password || password.length < 12) {
  console.error('Choose a password with at least 12 characters:  npm run admin:setup -- "my long password"');
  process.exit(1);
}

const N = 2 ** 15, r = 8, p = 1;
const salt = randomBytes(16);
const hash = scryptSync(password.normalize("NFKC"), salt, 32, { N, r, p, maxmem: 256 * 1024 * 1024 });
const vars = {
  ADMIN_PASSWORD_HASH: `scrypt:${N}:${r}:${p}:${salt.toString("base64url")}:${hash.toString("base64url")}`,
  ADMIN_SESSION_SECRET: randomBytes(48).toString("base64url"),
  ANALYTICS_SALT: randomBytes(32).toString("base64url"),
};

let totpUrl;
if (twoFactor) {
  const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const secret = [...randomBytes(20)].map((b) => b.toString(2).padStart(8, "0")).join("").match(/.{5}/g).map((b) => abc[parseInt(b, 2)]).join("");
  vars.ADMIN_TOTP_SECRET = secret;
  totpUrl = `otpauth://totp/Elonai:admin?secret=${secret}&issuer=Elonai&period=30&digits=6`;
}

const site = JSON.parse(fs.readFileSync(path.join("src", "content", "site.json"), "utf8"));
vars.DONATION_LINKS_SHA256 = createHash("sha256").update(JSON.stringify(site.donation_methods.map((m) => new URL(m.url).toString()))).digest("hex");

const envFile = ".env.local";
let env = fs.existsSync(envFile) ? fs.readFileSync(envFile, "utf8") : "";
for (const [k, v] of Object.entries(vars)) {
  const line = `${k}=${v}`;
  env = new RegExp(`^${k}=.*$`, "m").test(env) ? env.replace(new RegExp(`^${k}=.*$`, "m"), line) : `${env.trimEnd()}\n${line}\n`;
}
if (!twoFactor) env = env.replace(/^ADMIN_TOTP_SECRET=.*\n?/m, "");
fs.writeFileSync(envFile, env.trimStart());

console.log("\n✓ Saved to web/.env.local:", Object.keys(vars).join(", "));
if (totpUrl) {
  const qrFile = path.resolve(process.argv.find((a) => a.startsWith("--qr="))?.slice(5) ?? "admin-2fa-qr.html");
  const svg = await QRCode.toString(totpUrl, { type: "svg", margin: 2 });
  fs.writeFileSync(qrFile, `<!doctype html><meta charset="utf-8"><title>Elonai admin 2FA</title><body style="font-family:sans-serif;text-align:center;padding:40px"><h2>Scan with Google Authenticator / Authy</h2><div style="width:280px;margin:auto">${svg}</div><p>Or type the key: <code>${vars.ADMIN_TOTP_SECRET}</code></p><p><b>Delete this file after scanning.</b></p></body>`);
  console.log(`\n2FA: open ${qrFile} and scan it with your authenticator app, then DELETE that file.`);
}
console.log("\nRestart the dev server so the new variables are loaded. Sign in at /admin.\n");
