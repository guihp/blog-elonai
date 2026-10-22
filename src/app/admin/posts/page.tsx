import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdminPage } from "@/lib/admin-guard";
import { formatDate, getDbPosts, getPosts } from "@/lib/content";
import AdminNav from "../AdminNav";

export const metadata: Metadata = { title: "Posts", robots: { index: false, follow: false } };

export default function PostsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-20 text-muted sm:px-8">Carregando…</div>}>
      <Posts />
    </Suspense>
  );
}

async function Posts() {
  await requireAdminPage();
  const [mine, live] = await Promise.all([getDbPosts(true), getPosts()]);
  const fromCode = live.filter((p) => !mine.some((m) => m.slug === p.slug));

  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-6 sm:px-8">
      <AdminNav current="/admin/posts" title="Posts">
        <Link href="/admin/posts/new" className="btn btn-ink !py-2.5">Novo post</Link>
      </AdminNav>

      <h2 className="mt-10 text-2xl">Escritos no painel</h2>
      <ul className="mt-3 divide-y divide-line border border-line bg-white">
        {mine.map((p) => (
          <li key={p.id}>
            <Link href={`/admin/posts/${p.id}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-linen">
              <span>
                <span className="font-serif text-xl">{p.title}</span>
                <span className="ml-2 text-xs text-muted">{p.category} · {formatDate(p.date)}</span>
              </span>
              <span className={`text-xs ${p.published ? "text-sage" : "text-muted"}`}>{p.published ? "Publicado" : "Rascunho"}</span>
            </Link>
          </li>
        ))}
        {!mine.length && <li className="px-5 py-8 text-center text-muted">Nenhum ainda. Clique em “Novo post”.</li>}
      </ul>

      <h2 className="mt-10 text-2xl">Já no site (feitos no código)</h2>
      <p className="mt-1 text-sm text-muted">Estes eu escrevi e revisei. Para mudar um deles, me peça.</p>
      <ul className="mt-3 divide-y divide-line border border-line bg-white">
        {fromCode.map((p) => (
          <li key={p.slug} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
            <span className="font-serif text-lg">{p.title}</span>
            <a href={`/blog/${p.slug}`} target="_blank" className="text-xs text-gold-dark underline">Ver</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
