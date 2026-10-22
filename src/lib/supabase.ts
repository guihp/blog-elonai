import "server-only";
import { createClient } from "@supabase/supabase-js";

// Service-role client: bypasses RLS, so it must only ever run on the server.
export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
}
