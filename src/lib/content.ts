import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import booksData from "@/content/books.json";
import siteData from "@/content/site.json";

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

const POSTS_DIR = path.join(process.cwd(), "src", "content", "posts");

// New blog posts: drop a .md file with the same frontmatter into src/content/posts.
export async function getPosts(): Promise<Post[]> {
  "use cache";
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
        minutes: Math.max(1, Math.round(content.split(/\s+/).length / 230)),
        html: await marked.parse(content),
      } satisfies Post;
    }),
  );
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPost(slug: string) {
  return (await getPosts()).find((p) => p.slug === slug);
}

export const formatDate = (d: string) =>
  new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
