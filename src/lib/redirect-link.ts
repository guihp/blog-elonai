import { clientIp, geo, isBot, isLocalHost, parseAgent, saveHit, visitorHash } from "./analytics";
import { getSettings } from "./settings";

// Stable short links printed in the PDFs and emails (/donate, /join). They always send people to whatever is saved
// in /admin/settings right now, so a book downloaded today still works after the donation link changes.
// ?from=pdf-anchored (or email) is recorded so the dashboard can show where the click came from.
export async function settingsRedirect(request: Request, kind: "donate" | "community") {
  const settings = await getSettings();
  const target = kind === "donate" ? settings.donation_methods[0].url : settings.community_url;

  const h = request.headers;
  const ua = h.get("user-agent") ?? "";
  if (!isBot(ua) && !isLocalHost(h.get("host") ?? "")) {
    const from = new URL(request.url).searchParams.get("from")?.replace(/[^a-z0-9-]/gi, "").slice(0, 40) || null;
    const ip = clientIp(h);
    await saveHit({
      kind,
      path: new URL(request.url).pathname,
      target,
      source: from ? from.replace(/^\w/, (c) => c.toUpperCase()) : "Direct",
      referrer: null,
      campaign: from,
      ...geo(h),
      ...parseAgent(ua),
      visitor: visitorHash(ip, ua),
      session: null,
      depth: null,
      seconds: null,
    });
  }
  return new Response(null, { status: 302, headers: { Location: target, "Cache-Control": "no-store" } });
}
