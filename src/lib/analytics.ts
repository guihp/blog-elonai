import "server-only";
import { createHmac } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { supabaseAdmin } from "./supabase";

// Privacy-friendly analytics: no cookies, no raw IP addresses. A visitor is counted as unique per day with a
// salted hash of IP + browser that changes every day, so nobody can be followed across days.

// form_open = opened the download box, signup = sent a form, read = left a page (scroll depth % + seconds on it).
export const KINDS = ["view", "download", "donate", "community", "form_open", "signup", "read"] as const;
export type Kind = (typeof KINDS)[number];

export type Hit = {
  created_at: string;
  kind: Kind;
  path: string;
  target: string | null;
  source: string;
  referrer: string | null;
  campaign: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  device: string;
  browser: string;
  os: string;
  visitor: string;
  session: string | null;
  depth: number | null;
  seconds: number | null;
};

// Without Supabase (local development) hits are kept in web/.data/analytics.ndjson.
const LOCAL_FILE = path.join(process.cwd(), ".data", "analytics.ndjson");

const SOURCES: [RegExp, string][] = [
  [/(^|\.)facebook\.com$|(^|\.)fb\.(com|me)$/, "Facebook"],
  [/(^|\.)instagram\.com$/, "Instagram"],
  [/(^|\.)pinterest\./, "Pinterest"],
  [/(^|\.)tiktok\.com$/, "TikTok"],
  [/(^|\.)youtube\.com$|^youtu\.be$/, "YouTube"],
  [/^t\.co$|(^|\.)twitter\.com$|(^|\.)x\.com$/, "X / Twitter"],
  [/(^|\.)reddit\.com$/, "Reddit"],
  [/(^|\.)google\./, "Google"],
  [/(^|\.)bing\.com$/, "Bing"],
  [/(^|\.)duckduckgo\.com$/, "DuckDuckGo"],
  [/(^|\.)yahoo\./, "Yahoo"],
  [/(^|\.)whatsapp\.com$|^wa\.me$/, "WhatsApp"],
  [/(^|\.)(mail\.google|outlook\.live|mail\.yahoo)\.com$/, "Email"],
];

export function classifySource(referrer: string | null, utmSource: string | null, ownHost: string) {
  if (utmSource) return utmSource.slice(0, 40).replace(/^\w/, (c) => c.toUpperCase());
  if (!referrer) return "Direct";
  let host: string;
  try {
    host = new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return "Direct";
  }
  if (host === ownHost.replace(/^www\./, "")) return "Direct";
  return SOURCES.find(([re]) => re.test(host))?.[1] ?? host;
}

export function parseAgent(ua: string) {
  const device = /iPad|Tablet/i.test(ua) ? "Tablet" : /Mobi|Android|iPhone/i.test(ua) ? "Mobile" : "Desktop";
  const browser = /Edg\//.test(ua) ? "Edge" : /SamsungBrowser/.test(ua) ? "Samsung Internet" : /FBAN|FBAV|FB_IAB/.test(ua) ? "Facebook app"
    : /Instagram/.test(ua) ? "Instagram app" : /Chrome|CriOS/.test(ua) ? "Chrome" : /Firefox|FxiOS/.test(ua) ? "Firefox"
    : /Safari/.test(ua) ? "Safari" : "Other";
  const os = /iPhone|iPad|iOS/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Windows/.test(ua) ? "Windows"
    : /Mac OS X/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "Other";
  return { device, browser, os };
}

// Visits to the dev server (localhost, or a phone on the same Wi-Fi hitting 192.168.x.x) are never counted.
export const isLocalHost = (host: string) =>
  /^(localhost|127\.|0\.0\.0\.0|\[::1\]|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)|\.local$/.test(host.replace(/:\d+$/, ""));

export const isBot =(ua: string) => !ua || /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|curl|wget|python|axios/i.test(ua);

// Location comes from the hosting provider's edge (Netlify, Vercel or Cloudflare). Locally there is none.
export function geo(h: Headers) {
  const nf = h.get("x-nf-geo");
  if (nf) {
    try {
      const g = JSON.parse(Buffer.from(nf, "base64").toString("utf8"));
      return { country: g.country?.code ?? null, region: g.subdivision?.code ?? null, city: g.city ?? null };
    } catch {}
  }
  const dec = (v: string | null) => (v ? decodeURIComponent(v) : null);
  return {
    country: h.get("x-vercel-ip-country") ?? h.get("cf-ipcountry") ?? h.get("x-country") ?? null,
    region: h.get("x-vercel-ip-country-region") ?? h.get("cf-region-code") ?? null,
    city: dec(h.get("x-vercel-ip-city") ?? h.get("cf-ipcity")),
  };
}

export function clientIp(h: Headers) {
  return h.get("x-nf-client-connection-ip") ?? h.get("cf-connecting-ip") ?? h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
}

export function visitorHash(ip: string, ua: string) {
  const secret = process.env.ANALYTICS_SALT ?? process.env.ADMIN_SESSION_SECRET ?? "dev-salt";
  const day = new Date().toISOString().slice(0, 10);
  return createHmac("sha256", secret).update(`${day}|${ip}|${ua}`).digest("base64url").slice(0, 16);
}

export async function saveHit(hit: Omit<Hit, "created_at">) {
  const db = supabaseAdmin();
  if (db) {
    const { error } = await db.from("page_views").insert(hit);
    if (error) console.error("[track]", error.message);
    return;
  }
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.appendFile(LOCAL_FILE, JSON.stringify({ created_at: new Date().toISOString(), ...hit }) + "\n");
}

const COLUMNS = "created_at,kind,path,target,source,referrer,campaign,country,region,city,device,browser,os,visitor,session,depth,seconds";

export async function loadHits(since: Date): Promise<Hit[]> {
  const db = supabaseAdmin();
  if (db) {
    const rows: Hit[] = [];
    // Supabase returns at most 1,000 rows per request, so read in pages (capped at 100k rows).
    for (let from = 0; from < 100_000; from += 1000) {
      const { data, error } = await db.from("page_views").select(COLUMNS).gte("created_at", since.toISOString())
        .order("created_at", { ascending: false }).range(from, from + 999);
      if (error) throw new Error(error.message);
      rows.push(...(data as Hit[]));
      if (data.length < 1000) break;
    }
    return rows;
  }
  try {
    const text = await fs.readFile(LOCAL_FILE, "utf8");
    return text.split("\n").filter(Boolean).map((l) => JSON.parse(l) as Hit).filter((h) => new Date(h.created_at) >= since).reverse();
  } catch {
    return [];
  }
}

export type Signup = {
  kind: string;
  book: string | null;
  state: string | null;
  source: string | null;
  heard_from: string | null;
  heart_topic: string | null;
  age_range: string | null;
  created_at: string;
};

export async function loadSignups(since: Date) {
  const db = supabaseAdmin();
  if (!db) return null;
  const { data, error } = await db.from("subscribers").select("kind,book,state,source,heard_from,heart_topic,age_range,created_at").gte("created_at", since.toISOString()).limit(10000);
  if (error) throw new Error(error.message);
  return data as Signup[];
}
