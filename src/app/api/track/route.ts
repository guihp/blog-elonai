import { classifySource, clientIp, geo, isBot, isLocalHost, KINDS, parseAgent, saveHit, visitorHash, type Kind } from "@/lib/analytics";
import { rateLimit } from "@/lib/rate-limit";

// Receives page views and clicks from <Analytics />. Only same-origin requests are accepted.
const clip = (v: unknown, n: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null);
const int = (v: unknown, max: number) => (typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.min(max, Math.round(v))) : null);

export async function POST(request: Request) {
  const h = request.headers;
  const site = h.get("sec-fetch-site");
  const origin = h.get("origin");
  if ((site && site !== "same-origin") || (origin && new URL(origin).host !== h.get("host"))) {
    return new Response(null, { status: 403 });
  }
  const ua = h.get("user-agent") ?? "";
  if (isBot(ua) || isLocalHost(h.get("host") ?? "")) return new Response(null, { status: 204 });

  const ip = clientIp(h);
  if (!rateLimit(`track:${ip}`, 120, 60_000).ok) return new Response(null, { status: 429 });

  const raw = await request.text();
  if (raw.length > 2000) return new Response(null, { status: 413 });
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response(null, { status: 400 });
  }

  const kind = String(body.kind) as Kind;
  const pagePath = clip(body.path, 300);
  if (!KINDS.includes(kind) || !pagePath?.startsWith("/") || pagePath.startsWith("/admin")) {
    return new Response(null, { status: 400 });
  }

  const referrer = clip(body.referrer, 500);
  await saveHit({
    kind,
    path: pagePath,
    target: clip(body.target, 300),
    source: classifySource(referrer, clip(body.utm_source, 40), (h.get("host") ?? "").split(":")[0]),
    referrer,
    campaign: clip(body.utm_campaign, 80),
    ...geo(h),
    ...parseAgent(ua),
    visitor: visitorHash(ip, ua),
    session: clip(body.session, 40),
    depth: kind === "read" ? int(body.depth, 100) : null,
    seconds: kind === "read" ? int(body.seconds, 3600) : null,
  });
  return new Response(null, { status: 204 });
}
