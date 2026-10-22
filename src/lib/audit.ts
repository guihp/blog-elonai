import "server-only";
import { supabaseAdmin } from "./supabase";

// Security log for the admin area: sign-ins (good and bad) and every settings change, with what changed.

export type AuditRow = { created_at: string; action: string; detail: Record<string, unknown> | null; ip: string | null };

export async function audit(action: string, ip: string, detail: Record<string, unknown> | null = null) {
  const db = supabaseAdmin();
  if (!db) return;
  const { error } = await db.from("admin_audit").insert({ action, ip, detail });
  if (error) console.error("[audit]", error.message);
}

export async function recentAudit(limit = 25): Promise<AuditRow[]> {
  const db = supabaseAdmin();
  if (!db) return [];
  const { data } = await db.from("admin_audit").select("created_at,action,detail,ip").order("created_at", { ascending: false }).limit(limit);
  return data ?? [];
}
