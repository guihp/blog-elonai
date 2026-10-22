"use server";

import { randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { updateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdminAction } from "@/lib/admin-guard";
import { clientIp } from "@/lib/analytics";
import { audit } from "@/lib/audit";
import { books, POSTS_TAG } from "@/lib/content";
import { checkPostQuotes } from "@/lib/kjv";
import { BUILTIN_IMAGES } from "@/lib/post-images";
import { supabaseAdmin } from "@/lib/supabase";

export type PostState = { ok: boolean; message: string; warnings?: { ref: string; quote: string; kjv: string | null }[] };

const field = (form: FormData, name: string, max: number) => String(form.get(name) ?? "").trim().slice(0, max);
const slugify = (v: string) =>
  v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100);

// Real JPEG / PNG / WebP files only, checked by their first bytes (not by the name the browser sends).
function imageType(b: Buffer) {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { mime: "image/jpeg", ext: "jpg" };
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { mime: "image/png", ext: "png" };
  if (b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP") return { mime: "image/webp", ext: "webp" };
  return null;
}

async function fileSlugs() {
  const dir = path.join(process.cwd(), "src", "content", "posts");
  try {
    return new Set((await fs.readdir(dir)).map((f) => f.replace(/\.md$/, "")));
  } catch {
    return new Set<string>();
  }
}

export async function savePost(_: PostState, form: FormData): Promise<PostState> {
  await requireAdminAction();
  const db = supabaseAdmin();
  if (!db) return { ok: false, message: "O Supabase não está configurado." };

  const id = field(form, "id", 40);
  const title = field(form, "title", 160);
  const slug = slugify(field(form, "slug", 120) || title);
  const excerpt = field(form, "excerpt", 400);
  const category = field(form, "category", 60);
  const book = field(form, "book", 40);
  const body = String(form.get("body") ?? "").replace(/\r\n/g, "\n").trim().slice(0, 60000);
  const date = field(form, "date", 10);
  const published = form.get("published") === "on";
  let image = field(form, "image", 400);

  if (!title || !excerpt || !category || !body) return { ok: false, message: "Preencha título, resumo, categoria e texto." };
  if (!slug) return { ok: false, message: "Endereço (slug) inválido." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, message: "Data inválida." };
  if (book && !books.some((b) => b.slug === book)) return { ok: false, message: "Livro inválido." };
  if ((await fileSlugs()).has(slug)) return { ok: false, message: "Já existe um post com esse endereço. Mude o slug." };

  const upload = form.get("upload");
  if (upload instanceof File && upload.size > 0) {
    if (upload.size > 4 * 1024 * 1024) return { ok: false, message: "A imagem passa de 4 MB." };
    const bytes = Buffer.from(await upload.arrayBuffer());
    const type = imageType(bytes);
    if (!type) return { ok: false, message: "A imagem precisa ser JPG, PNG ou WebP." };
    const key = `${slug}-${randomBytes(4).toString("hex")}.${type.ext}`;
    const { error } = await db.storage.from("post-images").upload(key, bytes, { contentType: type.mime, cacheControl: "31536000" });
    if (error) return { ok: false, message: `Não foi possível enviar a imagem: ${error.message}` };
    image = db.storage.from("post-images").getPublicUrl(key).data.publicUrl;
  }
  const ownUpload = image.startsWith(`${process.env.SUPABASE_URL}/storage/v1/object/public/post-images/`);
  if (!BUILTIN_IMAGES.some((i) => i.name === image) && !ownUpload) return { ok: false, message: "Escolha uma imagem ou envie uma." };

  const row = { slug, title, excerpt, category, image, book: book || null, body, published, date, updated_at: new Date().toISOString() };
  const res = id ? await db.from("posts").update(row).eq("id", id).select("id").single() : await db.from("posts").insert(row).select("id").single();
  if (res.error) {
    return { ok: false, message: res.error.code === "23505" ? "Já existe um post com esse endereço. Mude o slug." : `Não foi possível salvar: ${res.error.message}` };
  }

  await audit(id ? "post.update" : "post.create", clientIp(await headers()), { slug, published });
  updateTag(POSTS_TAG);

  const checks = await checkPostQuotes(body);
  const warnings = checks.filter((c) => !c.ok).map(({ ref, quote, kjv }) => ({ ref, quote, kjv }));
  if (!id) redirect(`/admin/posts/${res.data.id}?saved=${published ? "published" : "draft"}${warnings.length ? "&check=1" : ""}`);

  const verses = checks.length ? ` ${checks.length - warnings.length} de ${checks.length} versículos conferem com a KJV.` : "";
  return { ok: true, message: (published ? "Publicado." : "Rascunho salvo.") + verses, warnings };
}

export async function deletePost(form: FormData) {
  await requireAdminAction();
  const id = String(form.get("id") ?? "");
  const db = supabaseAdmin();
  if (!db || !id) return;
  const { data } = await db.from("posts").delete().eq("id", id).select("slug,image").single();
  if (data?.image.includes("/post-images/")) await db.storage.from("post-images").remove([data.image.split("/post-images/")[1]]);
  await audit("post.delete", clientIp(await headers()), { slug: data?.slug });
  updateTag(POSTS_TAG);
  redirect("/admin/posts");
}
