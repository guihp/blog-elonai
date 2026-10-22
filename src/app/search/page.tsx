import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { search } from "@/lib/search";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the Elonai blog, free devotionals and daily words.",
  robots: { index: false, follow: true },
};

const SUGGESTIONS = ["anxiety", "fear", "sleep", "grief", "prayer", "Holy Spirit", "be still"];

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-14 sm:px-8">
      <p className="eyebrow">Search Elonai</p>
      <h1 className="mt-3 text-5xl sm:text-6xl">What are you looking for?</h1>
      <Suspense fallback={<SearchForm q="" />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function SearchForm({ q }: { q: string }) {
  return (
    <form action="/search" role="search" className="mt-8 flex gap-3">
      <label htmlFor="q" className="sr-only">Search</label>
      <input id="q" name="q" type="search" defaultValue={q} maxLength={100} placeholder="Try “anxiety” or “Psalm 23”" className="field flex-1 !bg-white" autoFocus />
      <button className="btn btn-gold shrink-0">Search</button>
    </form>
  );
}

async function Results({ searchParams }: { searchParams: PageProps<"/search">["searchParams"] }) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw ?? "").slice(0, 100).trim();
  const results = q ? await search(q) : [];

  return (
    <>
      <SearchForm q={q} />
      {!q && (
        <p className="mt-6 flex flex-wrap gap-2 text-sm">
          {SUGGESTIONS.map((s) => (
            <Link key={s} href={`/search?q=${encodeURIComponent(s)}`} className="border border-line bg-white px-3 py-1.5 hover:bg-linen">{s}</Link>
          ))}
        </p>
      )}
      {q && (
        <p className="mt-6 text-sm text-muted" aria-live="polite">
          {results.length ? `${results.length} result${results.length === 1 ? "" : "s"} for “${q}”` : `Nothing found for “${q}”. Try a shorter or different word.`}
        </p>
      )}
      <ul className="mt-6 divide-y divide-line border-y border-line">
        {results.map((r) => (
          <li key={r.href}>
            <Link href={r.href} className="group block py-6">
              <p className="eyebrow !text-[0.65rem]">{r.kind}</p>
              <h2 className="mt-1 text-2xl leading-snug group-hover:text-gold-dark">{r.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{r.snippet}</p>
            </Link>
          </li>
        ))}
      </ul>
      {q && !results.length && (
        <p className="mt-8 text-ink-soft">
          You can also browse <Link href="/blog" className="underline">the blog</Link>, <Link href="/books" className="underline">the free devotionals</Link> or <Link href="/today" className="underline">every daily word</Link>.
        </p>
      )}
    </>
  );
}
