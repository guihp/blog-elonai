import type { MetadataRoute } from "next";
import { books, getPosts, site } from "@/lib/content";
import { wordSlug } from "@/lib/daily";
import { getDailyWords } from "@/lib/daily-words";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/today", "/blog", "/books", "/small-groups", "/community", "/give", "/about", "/privacy"];
  return [
    ...pages.map((p) => ({ url: `${site.site_url}${p}` })),
    ...books.map((b) => ({ url: `${site.site_url}/books/${b.slug}` })),
    ...(await getPosts()).map((p) => ({ url: `${site.site_url}/blog/${p.slug}`, lastModified: p.date })),
    ...(await getDailyWords()).map((w) => ({ url: `${site.site_url}/today/${wordSlug(w)}` })),
  ];
}
