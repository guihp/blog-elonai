import siteData from "../content/site.json";

// Donation links are baked into the site and the PDFs at build time. There is no admin screen, API or database
// that can change them, so the only way to swap a link is a code change plus a new deploy (see next.config.ts).

export type DonationMethod = { label: string; detail: string; url: string };

// Only these payment providers are accepted. A link to any other domain fails the build.
export const PAYMENT_HOSTS = [
  "ko-fi.com", "paypal.com", "paypal.me", "cash.app", "venmo.com", "account.venmo.com",
  "buy.stripe.com", "donate.stripe.com", "givebutter.com", "buymeacoffee.com", "zeffy.com", "tithe.ly", "give.tithe.ly",
];

export function checkDonationUrl(raw: string) {
  const url = new URL(raw);
  const host = url.hostname.replace(/^www\./, "");
  if (url.protocol !== "https:") throw new Error(`Donation link must use https: ${raw}`);
  if (url.username || url.password) throw new Error(`Donation link must not contain credentials: ${raw}`);
  if (!PAYMENT_HOSTS.includes(host)) throw new Error(`Donation link host "${host}" is not an approved payment provider`);
  return url.toString();
}

export const donationMethods: DonationMethod[] = siteData.donation_methods.map((m) => ({ ...m, url: checkDonationUrl(m.url) }));
if (!donationMethods.length) throw new Error("site.json needs at least one donation method");

export const primaryDonation = donationMethods[0];

export const displayUrl = (url: string) => url.replace(/^https:\/\/(www\.)?/, "").replace(/\/$/, "");
