import { isAdmin } from "@/lib/admin-guard";
import { listSubscribers } from "@/lib/subscribers";

// CSV export of /admin/subscribers (same filters). A cell that starts with = + - @ gets a leading ' so a
// spreadsheet never runs it as a formula.
const cell = (v: unknown) => {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET(request: Request) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const sp = new URL(request.url).searchParams;
  const rows = await listSubscribers({ kind: sp.get("kind") ?? undefined, q: sp.get("q") ?? undefined, limit: 50_000 });
  const cols = ["created_at", "kind", "email", "first_name", "state", "book", "email_reminders", "share_request", "source", "heard_from", "heart_topic", "age_range", "prayer_request"] as const;
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);
  return new Response("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="elonai-inscritos-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
