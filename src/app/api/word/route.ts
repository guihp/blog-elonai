import { isDateKey, wordFor } from "@/lib/daily";
import { getDailyWords } from "@/lib/daily-words";

// The word for one calendar date (?d=2026-10-22). The date comes from the visitor's own timezone, so the browser
// asks for it instead of the page shipping the whole list.
export async function GET(request: Request) {
  const d = new URL(request.url).searchParams.get("d") ?? "";
  if (!isDateKey(d)) return Response.json({ error: "Use ?d=YYYY-MM-DD" }, { status: 400 });
  return Response.json(wordFor(await getDailyWords(), d), {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=900, stale-while-revalidate=86400" },
  });
}
