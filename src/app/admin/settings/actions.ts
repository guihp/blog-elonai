"use server";

import { updateTag } from "next/cache";
import { cookies, headers } from "next/headers";
import { COOKIE, totpEnabled, verifyPassword, verifySession, verifyTotp } from "@/lib/admin-auth";
import { clientIp } from "@/lib/analytics";
import { audit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";
import { getSettings, MAX_DONATIONS, SETTINGS_TAG, SOCIAL_HOSTS, validateSettings, type Settings } from "@/lib/settings";
import { supabaseAdmin } from "@/lib/supabase";

export type SaveState = { ok: boolean; message: string };

const field = (form: FormData, name: string) => String(form.get(name) ?? "");

// Saving needs a valid session AND a fresh authenticator code (or the password when 2FA is off), so a stolen
// session cookie alone can't swap the donation links.
export async function saveSettings(_: SaveState, form: FormData): Promise<SaveState> {
  if (!verifySession((await cookies()).get(COOKIE)?.value)) return { ok: false, message: "Sua sessão expirou. Entre de novo." };

  const ip = clientIp(await headers());
  if (!rateLimit(`settings:${ip}`, 5, 15 * 60_000).ok) return { ok: false, message: "Muitas tentativas. Espere 15 minutos." };

  const confirm = field(form, "confirm").trim();
  const confirmed = totpEnabled() ? verifyTotp(confirm.replace(/\s/g, "")) : await verifyPassword(confirm);
  if (!confirmed) {
    await audit("settings.denied", ip);
    return { ok: false, message: totpEnabled() ? "Código do autenticador incorreto ou já usado. Espere o próximo código." : "Senha incorreta." };
  }

  let next: Settings;
  try {
    next = validateSettings({
      donation_methods: Array.from({ length: MAX_DONATIONS }, (_, i) => ({
        label: field(form, `d${i}_label`),
        detail: field(form, `d${i}_detail`),
        url: field(form, `d${i}_url`),
      })),
      community_url: field(form, "community_url"),
      contact_email: field(form, "contact_email"),
      socials: Object.fromEntries(Object.keys(SOCIAL_HOSTS).map((n) => [n, field(form, `social_${n}`)])),
    });
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }

  const db = supabaseAdmin();
  if (!db) return { ok: false, message: "O Supabase não está configurado." };

  const before = await getSettings();
  const changes = Object.fromEntries(
    (Object.keys(next) as (keyof Settings)[])
      .filter((k) => JSON.stringify(before[k]) !== JSON.stringify(next[k]))
      .map((k) => [k, { before: before[k], after: next[k] }]),
  );
  if (!Object.keys(changes).length) return { ok: true, message: "Nada mudou." };

  const { error } = await db.from("site_settings").upsert({ key: "site", value: next, updated_at: new Date().toISOString() });
  if (error) return { ok: false, message: `Não foi possível salvar: ${error.message}` };

  await audit("settings.update", ip, changes);
  updateTag(SETTINGS_TAG);
  return { ok: true, message: "Salvo. O site já está usando os novos dados." };
}
