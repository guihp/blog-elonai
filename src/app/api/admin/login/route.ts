import { cookies } from "next/headers";
import { adminConfigured, COOKIE, createSession, SESSION_HOURS, verifyPassword, verifyTotp } from "@/lib/admin-auth";
import { clientIp } from "@/lib/analytics";
import { rateLimit, resetLimit } from "@/lib/rate-limit";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(request: Request) {
  const h = request.headers;
  const origin = h.get("origin");
  if (!origin || new URL(origin).host !== h.get("host")) return Response.json({ error: "Forbidden" }, { status: 403 });
  if (!adminConfigured()) return Response.json({ error: "Admin is not set up yet. Run npm run admin:setup." }, { status: 503 });

  // 5 tries per IP and 30 tries in total every 15 minutes, so the password can't be guessed by brute force.
  const ip = clientIp(h);
  const perIp = rateLimit(`login:${ip}`, 5, 15 * 60_000);
  const global = rateLimit("login:all", 30, 15 * 60_000);
  if (!perIp.ok || !global.ok) {
    console.warn(`[admin] login locked for ${ip}`);
    return Response.json({ error: `Too many attempts. Try again in ${Math.ceil(Math.max(perIp.retryAfter, global.retryAfter) / 60)} minutes.` }, { status: 429 });
  }

  let body: { password?: unknown; code?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const password = typeof body.password === "string" ? body.password.slice(0, 200) : "";
  const code = typeof body.code === "string" ? body.code.replace(/\s/g, "") : "";

  const ok = (await verifyPassword(password)) && verifyTotp(code);
  if (!ok) {
    console.warn(`[admin] failed login from ${ip}`);
    await sleep(700 + Math.random() * 500);
    return Response.json({ error: "Incorrect password or code." }, { status: 401 });
  }

  resetLimit(`login:${ip}`);
  (await cookies()).set(COOKIE, createSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
  return Response.json({ ok: true });
}
