import "server-only";
import { supabaseAdmin } from "./supabase";

export type Subscriber = {
  id: number;
  created_at: string;
  kind: string;
  email: string;
  first_name: string | null;
  state: string | null;
  book: string | null;
  prayer_request: string | null;
  email_reminders: boolean;
  share_request: boolean;
  source: string | null;
  prayed_at: string | null;
  heard_from: string | null;
  heart_topic: string | null;
  age_range: string | null;
};

export const KIND_LABEL: Record<string, string> = { download: "Baixou livro", waitlist: "Lista de espera", newsletter: "Newsletter" };

export async function listSubscribers({ kind, q, limit = 1000 }: { kind?: string; q?: string; limit?: number }) {
  const db = supabaseAdmin();
  if (!db) return [];
  let query = db.from("subscribers").select("*").order("created_at", { ascending: false }).limit(limit);
  if (kind && KIND_LABEL[kind]) query = query.eq("kind", kind);
  const term = q?.replace(/[%_,()]/g, "").trim().slice(0, 80);
  if (term) query = query.or(`email.ilike.%${term}%,first_name.ilike.%${term}%`);
  const { data, error } = await query;
  if (error) console.error("[subscribers]", error.message);
  return (data ?? []) as Subscriber[];
}
