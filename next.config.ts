import { createHash } from "node:crypto";
import type { NextConfig } from "next";
import { donationMethods } from "./src/lib/donation";

// Donation link fingerprint. Set DONATION_LINKS_SHA256 in the hosting dashboard (not in the repo): a production build
// then refuses to ship if someone changed a payment link in the code without also having access to your hosting account.
const fingerprint = createHash("sha256").update(JSON.stringify(donationMethods.map((m) => m.url))).digest("hex");
const pinned = process.env.DONATION_LINKS_SHA256;
if (pinned && pinned !== fingerprint) {
  throw new Error(`Donation links changed (fingerprint ${fingerprint}). If you made this change, update DONATION_LINKS_SHA256.`);
}
if (!pinned && process.env.NODE_ENV === "production") {
  console.warn(`⚠ DONATION_LINKS_SHA256 is not set. To pin the current donation links, set it to: ${fingerprint}`);
}

const isDev = process.env.NODE_ENV === "development";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

// Blog pictures uploaded from /admin/posts live in the Supabase "post-images" bucket and go through next/image.
const supabaseHost = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).hostname : "";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // The blog reads src/content/posts at run time too (after an edit in the admin panel), so ship those files.
  outputFileTracingIncludes: { "/**": ["./src/content/posts/**"] },
  images: {
    remotePatterns: supabaseHost ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/post-images/**" }] : [],
  },
  experimental: {
    // Room for one resized blog picture (the editor shrinks photos before sending; Vercel caps requests at 4.5 MB).
    serverActions: { bodySizeLimit: "4mb" },
  },
  partialPrefetching: true,
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "Cache-Control", value: "no-store" }] },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
