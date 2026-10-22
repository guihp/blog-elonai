import "server-only";
import { cacheTag } from "next/cache";
import siteData from "@/content/site.json";
import { checkDonationUrl, type DonationMethod } from "./donation";
import { supabaseAdmin } from "./supabase";

// Settings the owner can change from /admin/settings. site.json holds the defaults; the saved copy lives in
// Supabase (site_settings, key "site") and every value is validated again when it's read, not only when saved.

export type Settings = {
  donation_methods: DonationMethod[];
  community_url: string;
  contact_email: string;
  socials: Record<string, string>;
};

export const SETTINGS_TAG = "settings";
export const MAX_DONATIONS = 3;

// Where each link may point. A link to any other site is refused, so a stolen session can't send people elsewhere.
export const COMMUNITY_HOSTS = ["facebook.com", "m.facebook.com", "fb.com", "chat.whatsapp.com", "t.me", "discord.gg", "discord.com", "groupme.com"];
export const SOCIAL_HOSTS: Record<string, string[]> = {
  Instagram: ["instagram.com"],
  Pinterest: ["pinterest.com"],
  YouTube: ["youtube.com", "youtu.be"],
  TikTok: ["tiktok.com"],
  "Facebook Page": ["facebook.com", "fb.com"],
};

const host = (u: URL) => u.hostname.replace(/^www\./, "");

function checkLink(raw: string, hosts: string[], what: string) {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new Error(`${what}: link inválido.`);
  }
  if (url.protocol !== "https:" || url.username || url.password) throw new Error(`${what}: use um link https://.`);
  if (!hosts.includes(host(url))) throw new Error(`${what}: só aceita links de ${hosts.join(", ")}.`);
  return url.toString();
}

const text = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");

// Throws with a message in Portuguese (shown in the admin form) when anything is out of bounds.
export function validateSettings(input: Partial<Record<keyof Settings, unknown>>): Settings {
  const methods = Array.isArray(input.donation_methods) ? input.donation_methods : [];
  const donation_methods = methods
    .map((m) => ({ label: text(m?.label, 40), detail: text(m?.detail, 80), url: text(m?.url, 300) }))
    .filter((m) => m.label || m.url)
    .map((m, i) => {
      if (!m.label || !m.url) throw new Error(`Doação ${i + 1}: preencha o nome e o link.`);
      try {
        return { ...m, url: checkDonationUrl(m.url) };
      } catch {
        throw new Error(`Doação ${i + 1}: use um link https:// de um serviço de pagamento aprovado (Ko-fi, PayPal, Cash App, Venmo, Stripe, Givebutter, Buy Me a Coffee, Zeffy ou Tithe.ly).`);
      }
    });
  if (!donation_methods.length) throw new Error("Deixe pelo menos uma forma de doação.");
  if (donation_methods.length > MAX_DONATIONS) throw new Error(`No máximo ${MAX_DONATIONS} formas de doação.`);

  const contact_email = text(input.contact_email, 120);
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(contact_email)) throw new Error("Email de contato inválido.");

  const rawSocials = (input.socials ?? {}) as Record<string, unknown>;
  const socials = Object.fromEntries(
    Object.entries(SOCIAL_HOSTS).map(([name, hosts]) => {
      const v = text(rawSocials[name], 300);
      return [name, v ? checkLink(v, hosts, name) : ""];
    }),
  );

  return {
    donation_methods,
    community_url: checkLink(text(input.community_url, 300), COMMUNITY_HOSTS, "Comunidade"),
    contact_email,
    socials,
  };
}

export const DEFAULT_SETTINGS: Settings = validateSettings(siteData);

export async function getSettings(): Promise<Settings> {
  "use cache";
  cacheTag(SETTINGS_TAG);
  const db = supabaseAdmin();
  if (!db) return DEFAULT_SETTINGS;
  const { data, error } = await db.from("site_settings").select("value").eq("key", "site").maybeSingle();
  if (error || !data) return DEFAULT_SETTINGS;
  try {
    return validateSettings({ ...DEFAULT_SETTINGS, ...data.value });
  } catch (e) {
    console.error("[settings] saved settings are invalid, using defaults:", e);
    return DEFAULT_SETTINGS;
  }
}
