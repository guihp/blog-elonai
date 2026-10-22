import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";

// Admin sign-in: a scrypt password hash plus an optional authenticator-app code (TOTP), and a short-lived session
// cookie signed with HMAC-SHA256. Secrets live only in environment variables (run `npm run admin:setup`).

export const SESSION_HOURS = 8;
export const COOKIE = process.env.NODE_ENV === "production" ? "__Host-elonai_admin" : "elonai_admin";

const secret = () => {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("ADMIN_SESSION_SECRET is missing or too short");
  return s;
};

export const adminConfigured = () =>
  Boolean(process.env.ADMIN_PASSWORD_HASH && (process.env.ADMIN_SESSION_SECRET?.length ?? 0) >= 32);

const sign = (data: string) => createHmac("sha256", secret()).update(data).digest("base64url");

function equal(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

// ---- sessions ----
export function createSession() {
  const data = `v1.${Date.now() + SESSION_HOURS * 3600_000}.${randomBytes(12).toString("base64url")}`;
  return `${data}.${sign(data)}`;
}

export function verifySession(token: string | undefined) {
  if (!token || !adminConfigured()) return false;
  const i = token.lastIndexOf(".");
  const data = token.slice(0, i);
  const [v, exp] = data.split(".");
  return v === "v1" && Number(exp) > Date.now() && equal(token.slice(i + 1), sign(data));
}

// ---- password: "scrypt:N:r:p:salt:hash" (no "$": .env files would expand it as a variable) ----
export function verifyPassword(password: string) {
  const stored = process.env.ADMIN_PASSWORD_HASH ?? "";
  const [alg, N, r, p, salt, hash] = stored.split(":");
  if (alg !== "scrypt" || !hash) return Promise.resolve(false);
  const expected = Buffer.from(hash, "base64url");
  return new Promise<boolean>((resolve) =>
    scrypt(password.normalize("NFKC"), Buffer.from(salt, "base64url"), expected.length,
      { N: Number(N), r: Number(r), p: Number(p), maxmem: 256 * 1024 * 1024 },
      (err, key) => resolve(!err && timingSafeEqual(key, expected))),
  );
}

// ---- TOTP (RFC 6238, 30 s, 6 digits), compatible with Google Authenticator, Authy, 1Password ----
export const totpEnabled = () => Boolean(process.env.ADMIN_TOTP_SECRET);

function base32(s: string) {
  const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const c of s.replace(/=+$/, "").toUpperCase()) bits += abc.indexOf(c).toString(2).padStart(5, "0");
  return Buffer.from(bits.match(/.{8}/g)!.map((b) => parseInt(b, 2)));
}

function totp(key: Buffer, counter: number) {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const h = createHmac("sha1", key).update(msg).digest();
  const o = h[h.length - 1] & 15;
  return String((h.readUInt32BE(o) & 0x7fffffff) % 1_000_000).padStart(6, "0");
}

let lastCounter = 0; // a code can only be used once

export function verifyTotp(code: string) {
  if (!totpEnabled()) return true;
  if (!/^\d{6}$/.test(code)) return false;
  const key = base32(process.env.ADMIN_TOTP_SECRET!);
  const now = Math.floor(Date.now() / 30_000);
  for (const c of [now - 1, now, now + 1]) {
    if (c > lastCounter && equal(totp(key, c), code)) {
      lastCounter = c;
      return true;
    }
  }
  return false;
}
