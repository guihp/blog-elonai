"use client";

import Image from "next/image";
import { useActionState, useRef, useState } from "react";
import { renderMarkdown } from "@/lib/markdown";
import { savePost, type PostState } from "./actions";

type Post = { id?: string; slug: string; title: string; excerpt: string; category: string; image: string; book: string | null; body: string; published: boolean; date: string };
type Props = {
  post: Post;
  categories: string[];
  books: { slug: string; title: string }[];
  images: { name: string; label: string }[];
  notice?: string;
};

const label = "mb-1.5 block text-[0.68rem] font-medium uppercase tracking-[0.16em] text-muted";
const slugify = (v: string) =>
  v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100);
const src = (image: string) => (image.startsWith("https://") ? image : `/images/${image}.jpg`);

// Phone photos are often 5+ MB: shrink to 1800 px wide JPEG in the browser before sending.
async function shrink(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1800 / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob>((ok) => canvas.toBlob((b) => ok(b!), "image/jpeg", 0.85));
  return new File([blob], "cover.jpg", { type: "image/jpeg" });
}

export default function PostEditor({ post, categories, books, images, notice }: Props) {
  const [state, action, pending] = useActionState<PostState, FormData>(savePost, { ok: true, message: notice ?? "" });
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(post.id));
  const [body, setBody] = useState(post.body);
  const [image, setImage] = useState(post.image);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const fileInput = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return setUploadPreview(null);
    const small = await shrink(file);
    const dt = new DataTransfer();
    dt.items.add(small);
    e.target.files = dt.files;
    setUploadPreview(URL.createObjectURL(small));
  }

  return (
    <form action={action} className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
      {post.id && <input type="hidden" name="id" value={post.id} />}
      <input type="hidden" name="image" value={image} />

      <div className="space-y-5">
        <label className="block">
          <span className={label}>Título</span>
          <input
            name="title"
            required
            maxLength={160}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            className="field !bg-white !text-xl"
          />
        </label>
        <label className="block">
          <span className={label}>Endereço</span>
          <div className="flex items-center gap-1 text-sm text-muted">
            /blog/
            <input name="slug" required value={slug} onChange={(e) => (setSlugTouched(true), setSlug(slugify(e.target.value)))} className="field !bg-white !py-2" />
          </div>
        </label>
        <label className="block">
          <span className={label}>Resumo (aparece no Google e nos cards)</span>
          <textarea name="excerpt" required maxLength={400} rows={2} defaultValue={post.excerpt} className="field resize-y !bg-white" />
        </label>

        <div>
          <div className="flex items-end justify-between">
            <span className={label}>Texto</span>
            <div className="mb-1.5 flex border border-line text-xs">
              {(["write", "preview"] as const).map((t) => (
                <button key={t} type="button" onClick={() => setTab(t)} className={`px-3 py-1 ${tab === t ? "bg-ink text-paper" : "bg-white"}`}>
                  {t === "write" ? "Escrever" : "Ver prévia"}
                </button>
              ))}
            </div>
          </div>
          <textarea
            name="body"
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={24}
            className={`field resize-y !bg-white font-mono !text-sm leading-relaxed ${tab === "write" ? "" : "hidden"}`}
          />
          {tab === "preview" && (
            <div className="prose-elonai min-h-96 border border-line bg-white p-6" dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }} />
          )}
          <p className="mt-2 text-xs leading-relaxed text-muted">
            <b>## Título de seção</b> · <b>**negrito**</b> · <i>*itálico*</i> · <b>[texto do link](/books/anchored)</b> · lista com “- ” no começo da linha.
            Versículo: “texto da KJV” (Psalm 46:10). Ao salvar, cada versículo escrito assim é conferido com a KJV.
          </p>
        </div>
      </div>

      <aside className="space-y-5">
        <div className="border border-gold bg-linen p-5">
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" name="published" defaultChecked={post.published} className="h-4 w-4 accent-[#a5743c]" />
            Publicado no site
          </label>
          <button disabled={pending} className="btn btn-ink mt-4 w-full">{pending ? "Salvando…" : "Salvar"}</button>
          {state.message && <p aria-live="polite" className={`mt-3 text-sm ${state.ok ? "text-sage" : "text-red-700"}`}>{state.message}</p>}
          {!!state.warnings?.length && (
            <div className="mt-3 space-y-2 text-xs">
              <p className="font-medium text-red-700">Confira estes versículos:</p>
              {state.warnings.map((w, i) => (
                <div key={i} className="border-l-2 border-red-700 bg-white p-2">
                  <p><b>{w.ref}</b>: “{w.quote}”</p>
                  <p className="mt-1 text-muted">{w.kjv ? `KJV: ${w.kjv}` : "Não consegui buscar essa referência. Confira se está escrita certo."}</p>
                </div>
              ))}
            </div>
          )}
          {slug && post.id && <a href={`/blog/${slug}`} target="_blank" className="mt-3 block text-center text-sm text-gold-dark underline">Abrir no site</a>}
        </div>

        <label className="block">
          <span className={label}>Data</span>
          <input name="date" type="date" required defaultValue={post.date} className="field !bg-white" />
        </label>
        <label className="block">
          <span className={label}>Categoria</span>
          <input name="category" required list="categories" maxLength={60} defaultValue={post.category} className="field !bg-white" />
          <datalist id="categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
        </label>
        <label className="block">
          <span className={label}>Livro recomendado no fim</span>
          <select name="book" defaultValue={post.book ?? ""} className="field !bg-white">
            <option value="">Nenhum</option>
            {books.map((b) => <option key={b.slug} value={b.slug}>{b.title}</option>)}
          </select>
        </label>

        <div>
          <span className={label}>Imagem de capa</span>
          <div className="relative aspect-[16/10] overflow-hidden bg-sand">
            {uploadPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={uploadPreview} alt="" className="h-full w-full object-cover" />
            ) : (
              image && <Image src={src(image)} alt="" fill sizes="320px" className="object-cover" />
            )}
          </div>
          <select
            value={images.some((i) => i.name === image) ? image : ""}
            onChange={(e) => {
              setImage(e.target.value);
              setUploadPreview(null);
              if (fileInput.current) fileInput.current.value = "";
            }}
            className="field mt-2 !bg-white !py-2 text-sm"
          >
            {!images.some((i) => i.name === image) && <option value="">{image ? "Imagem enviada" : "Escolha uma imagem"}</option>}
            {images.map((i) => <option key={i.name} value={i.name}>{i.label}</option>)}
          </select>
          <label className="mt-2 block text-sm">
            <span className="text-muted">ou envie uma foto sua:</span>
            <input ref={fileInput} type="file" name="upload" accept="image/jpeg,image/png,image/webp" onChange={onFile} className="mt-1 block w-full text-xs" />
          </label>
        </div>
      </aside>
    </form>
  );
}
