"use server";

import { headers } from "next/headers";
import { refresh } from "next/cache";
import { requireAdminAction } from "@/lib/admin-guard";
import { clientIp } from "@/lib/analytics";
import { audit } from "@/lib/audit";
import { supabaseAdmin } from "@/lib/supabase";

// Removes one person for good (for "please delete my information" requests).
export async function deleteSubscriber(form: FormData) {
  await requireAdminAction();
  const id = Number(form.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;
  const db = supabaseAdmin();
  if (!db) return;
  await db.from("subscribers").delete().eq("id", id);
  await audit("subscriber.delete", clientIp(await headers()), { id });
  refresh();
}
