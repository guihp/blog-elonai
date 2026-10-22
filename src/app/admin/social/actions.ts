"use server";

import { refresh } from "next/cache";
import { requireAdminAction } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase";

// Marks a planned post as published, or a setup step as done (and back).
export async function toggleDone(form: FormData) {
  await requireAdminAction();
  const key = String(form.get("key") ?? "");
  if (!/^(\d{4}-\d{2}-\d{2}:[a-z-]+|guide:[a-z0-9-]+)$/.test(key)) return;
  const db = supabaseAdmin();
  if (!db) return;
  if (form.get("done") === "1") await db.from("social_done").upsert({ key, done_at: new Date().toISOString() });
  else await db.from("social_done").delete().eq("key", key);
  refresh();
}
