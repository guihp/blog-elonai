import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireAdminPage } from "@/lib/admin-guard";
import { books, getDbPosts, getPosts } from "@/lib/content";
import { BUILTIN_IMAGES } from "@/lib/post-images";
import AdminNav from "../../AdminNav";
import ConfirmButton from "../../ConfirmButton";
import { deletePost } from "../actions";
import PostEditor from "../PostEditor";

export const metadata: Metadata = { title: "Editar post", robots: { index: false, follow: false } };

export default function EditPostPage({ params, searchParams }: PageProps<"/admin/posts/[id]">) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-20 text-muted sm:px-8">Carregando…</div>}>
      <Edit params={params} searchParams={searchParams} />
    </Suspense>
  );
}

const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());

async function Edit({ params, searchParams }: { params: PageProps<"/admin/posts/[id]">["params"]; searchParams: PageProps<"/admin/posts/[id]">["searchParams"] }) {
  await requireAdminPage();
  const { id } = await params;
  const sp = await searchParams;
  const isNew = id === "new";
  const [mine, live] = await Promise.all([getDbPosts(true), getPosts()]);
  const existing = mine.find((p) => p.id === id);
  if (!isNew && !existing) notFound();

  const post = existing ?? { slug: "", title: "", excerpt: "", category: "", image: "", book: null, body: "", published: false, date: today() };
  const categories = [...new Set([...live, ...mine].map((p) => p.category))];
  const notice =
    sp.saved === "published" ? "Publicado." : sp.saved === "draft" ? "Rascunho salvo." : "";
  const check = sp.check ? " Alguns versículos não conferem com a KJV: salve de novo para ver quais." : "";

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-8">
      <AdminNav current="/admin/posts" title={isNew ? "Novo post" : "Editar post"}>
        {existing && (
          <form action={deletePost}>
            <input type="hidden" name="id" value={existing.id} />
            <ConfirmButton message="Apagar este post para sempre?" className="text-sm text-red-700 hover:underline">Apagar post</ConfirmButton>
          </form>
        )}
      </AdminNav>
      <PostEditor
        key={existing?.id ?? "new"}
        post={post}
        categories={categories}
        books={books.map((b) => ({ slug: b.slug, title: b.title }))}
        images={BUILTIN_IMAGES}
        notice={notice + check}
      />
    </div>
  );
}
