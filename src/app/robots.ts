import type { MetadataRoute } from "next";
import { site } from "@/lib/content";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin", "/donate", "/join", "/search"] }, sitemap: `${site.site_url}/sitemap.xml` };
}
