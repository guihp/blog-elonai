"use server";

import { refresh } from "next/cache";
import { requireAdminAction } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase";

// Marks a prayer request as prayed for (or back to pending).
export async function setPrayed(form: FormData) {
  await requireAdminAction();
  const id = Number(form.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;
  const db = supabaseAdmin();
  if (!db) return;
  await db.from("subscribers").update({ prayed_at: form.get("prayed") === "1" ? new Date().toISOString() : null }).eq("id", id);
  refresh();
}
