import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireAdminPage } from "@/lib/admin-guard";
import { wordSlug } from "@/lib/daily";
import { getDailyWords, MIN_WORDS } from "@/lib/daily-words";
import AdminNav from "../../AdminNav";
import ConfirmButton from "../../ConfirmButton";
import { deleteWord } from "../actions";
import WordEditor from "../WordEditor";

export const metadata: Metadata = { title: "Editar palavra", robots: { index: false, follow: false } };

type Props = PageProps<"/admin/words/[slug]">;

export default function EditWordPage({ params, searchParams }: Props) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-20 text-muted sm:px-8">Carregando…</div>}>
      <Edit params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Edit({ params, searchParams }: Pick<Props, "params" | "searchParams">) {
  await requireAdminPage();
  const { slug } = await params;
  const saved = (await searchParams).saved === "1";
  const words = await getDailyWords();
  const word = words.find((w) => wordSlug(w) === slug);
  if (slug !== "new" && !word) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-6 sm:px-8">
      <AdminNav current="/admin/words" title={word ? "Editar palavra" : "Nova palavra"}>
        {word && words.length > MIN_WORDS && (
          <form action={deleteWord}>
            <input type="hidden" name="slug" value={slug} />
            <ConfirmButton message="Apagar esta palavra?" className="text-sm text-red-700 hover:underline">Apagar</ConfirmButton>
          </form>
        )}
      </AdminNav>
      <WordEditor key={slug} word={word} original={word ? slug : ""} notice={saved ? "Salvo. Já está no site." : ""} />
    </div>
  );
}
