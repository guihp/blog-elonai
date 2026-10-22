import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { cacheTag } from "next/cache";
import booksData from "@/content/books.json";
import siteData from "@/content/site.json";
import { renderMarkdown } from "./markdown";
import { supabaseAdmin } from "./supabase";

export const site = siteData;

export type Book = (typeof booksData)[number] & { pdf?: string; pages?: number };
export const books = booksData as Book[];

export function getBook(slug: string) {
  return books.find((b) => b.slug === slug);
}

export const coverSrc = (slug: string) => `/books/${slug}/cover.jpg`;
export const pdfSrc = (b: Book) => (b.pdf ? `/books/${b.slug}/${b.pdf}` : undefined);

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
  book?: string;
  minutes: number;
  html: string;
};

export const POSTS_TAG = "posts";

// A post image is either one of the site's own photos ("post-fear" -> /images/post-fear.jpg) or a full https URL
// of a picture uploaded from the admin panel.
export const postImage = (image: string) => (image.startsWith("https://") ? image : `/images/${image}.jpg`);
export const absoluteImage = (image: string) => (image.startsWith("https://") ? image : `${site.site_url}${postImage(image)}`);

const minutes = (text: string) => Math.max(1, Math.round(text.split(/\s+/).length / 230));

export type DbPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  book: string | null;
  body: string;
  published: boolean;
  date: string;
  updated_at: string;
};

// Posts written in /admin/posts (Supabase). Pass all=true for drafts too (admin only).
export async function getDbPosts(all = false): Promise<DbPost[]> {
  const db = supabaseAdmin();
  if (!db) return [];
  let q = db.from("posts").select("id,slug,title,excerpt,category,image,book,body,published,date,updated_at").order("date", { ascending: false });
  if (!all) q = q.eq("published", true);
  const { data, error } = await q;
  if (error) console.error("[posts]", error.message);
  return data ?? [];
}

const POSTS_DIR = path.join(process.cwd(), "src", "content", "posts");

// New blog posts: drop a .md file with the same frontmatter into src/content/posts.
export async function getPosts(): Promise<Post[]> {
  "use cache";
  cacheTag(POSTS_TAG);
  return loadPosts();
}

async function loadPosts(): Promise<Post[]> {
  const files = (await fs.readdir(POSTS_DIR)).filter((f) => f.endsWith(".md"));
  const posts = await Promise.all(
    files.map(async (file) => {
      const { data, content } = matter(await fs.readFile(path.join(POSTS_DIR, file), "utf8"));
      return {
        slug: file.replace(/\.md$/, ""),
        title: data.title,
        excerpt: data.excerpt,
        date: data.date,
        category: data.category,
        image: data.image,
        book: data.book,
        minutes: minutes(content),
        html: await marked.parse(content),
      } satisfies Post;
    }),
  );
  const fileSlugs = new Set(posts.map((p) => p.slug));
  const fromDb = (await getDbPosts())
    .filter((p) => !fileSlugs.has(p.slug))
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      date: p.date,
      category: p.category,
      image: p.image,
      book: p.book ?? undefined,
      minutes: minutes(p.body),
      html: renderMarkdown(p.body),
    }));
  return [...posts, ...fromDb].sort((a, b) => b.date.localeCompare(a.date));
}

// Cached per slug, not through getPosts(): a post written in the panel after the build has a slug the build
// never saw, and the on-demand render of its page must read the posts table again instead of the build's list.
export async function getPost(slug: string) {
  "use cache";
  cacheTag(POSTS_TAG);
  return (await loadPosts()).find((p) => p.slug === slug);
}

export const formatDate = (d: string) =>
  new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
