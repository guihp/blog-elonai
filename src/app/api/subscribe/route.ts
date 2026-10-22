import { clientIp } from "@/lib/analytics";
import { rateLimit } from "@/lib/rate-limit";
import { supabaseAdmin } from "@/lib/supabase";
import { SURVEY_FIELDS, surveyAnswer } from "@/lib/survey";

// Every form on the site posts here. Rows go to the Supabase table `subscribers` (see supabase/schema.sql)
// once SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set; until then the signup is only logged.
const KINDS = new Set(["download", "waitlist", "newsletter"]);
const clip = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : null) || null;

export async function POST(request: Request) {
  if (!rateLimit(`subscribe:${clientIp(request.headers)}`, 10, 10 * 60_000).ok) {
    return Response.json({ ok: false, error: "Too many requests" }, { status: 429 });
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  // Honeypot filled in: pretend success so bots learn nothing.
  if (body.company) return Response.json({ ok: true });

  const email = clip(body.email, 254)?.toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !KINDS.has(String(body.kind))) {
    return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const row = {
    kind: String(body.kind),
    email,
    first_name: clip(body.first_name, 80),
    state: clip(body.state, 60),
    book: clip(body.book, 40),
    prayer_request: clip(body.prayer_request, 2000),
    email_reminders: body.email_reminders !== false,
    share_request: body.share_request === true,
    source: clip(body.source, 80),
    // only answers from the fixed lists are kept
    ...Object.fromEntries(SURVEY_FIELDS.map((f) => [f, surveyAnswer(f, body[f])])),
  };

  const supabase = supabaseAdmin();
  if (!supabase) {
    console.log("[subscribe] Supabase not configured yet:", { ...row, prayer_request: row.prayer_request ? "(provided)" : null });
    return Response.json({ ok: true, stored: false });
  }

  const { error } = await supabase.from("subscribers").insert(row);
  if (error) {
    console.error("[subscribe]", error.message);
    return Response.json({ ok: false }, { status: 500 });
  }
  return Response.json({ ok: true, stored: true });
}
