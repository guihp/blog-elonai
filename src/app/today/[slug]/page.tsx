import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DailyWordCard from "@/components/DailyWordCard";
import JsonLd from "@/components/JsonLd";
import { site } from "@/lib/content";
import { wordSlug } from "@/lib/daily";
import { getDailyWords, getWordPage } from "@/lib/daily-words";
import ShareWord from "./ShareWord";

export async function generateStaticParams() {
  return (await getDailyWords()).map((w) => ({ slug: wordSlug(w) }));
}

export async function generateMetadata({ params }: PageProps<"/today/[slug]">): Promise<Metadata> {
  const page = await getWordPage((await params).slug);
  if (!page) return {};
  const { word } = page;
  const title = `${word.title} (${word.ref})`;
  const description = `“${word.verse}” A short devotional and prayer on ${word.ref}.`.slice(0, 300);
  return {
    title,
    description,
    alternates: { canonical: `/today/${wordSlug(word)}` },
    openGraph: { type: "article", title, description, images: ["/images/daily-word.jpg"] },
  };
}

export default async function DailyWordPage({ params }: PageProps<"/today/[slug]">) {
  const { slug } = await params;
  const page = await getWordPage(slug);
  if (!page) notFound();
  const { word, prev, next } = page;
  const url = `${site.site_url}/today/${wordSlug(word)}`;

  return (
    <div className="mx-auto max-w-2xl px-4 pt-12 sm:px-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: word.title,
          description: word.verse,
          image: `${site.site_url}/images/daily-word.jpg`,
          inLanguage: "en-US",
          mainEntityOfPage: url,
          author: { "@type": "Organization", name: "Elonai", url: site.site_url },
          publisher: { "@id": `${site.site_url}/#org` },
        }}
      />
      <p className="mb-6 text-center">
        <Link href="/today" className="eyebrow hover:underline">See today’s word</Link>
      </p>
      <div className="bg-white shadow-[0_30px_60px_-30px_rgba(60,40,20,.35)]">
        <DailyWordCard word={word} label="Daily Word" date={word.ref}>
          <ShareWord word={word} url={url} />
        </DailyWordCard>
      </div>
      <nav className="mt-8 flex justify-between gap-4 text-sm" aria-label="More daily words">
        <Link href={`/today/${wordSlug(prev)}`} className="text-muted hover:text-gold-dark">← {prev.title}</Link>
        <Link href={`/today/${wordSlug(next)}`} className="text-right text-muted hover:text-gold-dark">{next.title} →</Link>
      </nav>
    </div>
  );
}
