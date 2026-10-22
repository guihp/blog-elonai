import type { Metadata } from "next";
import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";
import { site } from "@/lib/content";
import { dailyWords, wordSlug } from "@/lib/daily";
import TodayWord from "./TodayWord";

export const metadata: Metadata = {
  title: "Today’s Word",
  description: "A verse and a short devotional message for today. A new word every morning.",
  alternates: { canonical: "/today" },
};

export default function TodayPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-12 sm:px-8">
      <header className="mb-10 text-center">
        <p className="eyebrow">A new word every morning</p>
        <h1 className="mt-3 text-5xl sm:text-6xl">Today’s Word</h1>
      </header>
      <TodayWord siteUrl={site.site_url} />
      <section className="mt-16">
        <h2 className="text-center text-3xl">Every daily word</h2>
        <ul className="mt-6 grid gap-x-8 sm:grid-cols-2">
          {dailyWords.map((w) => (
            <li key={w.ref} className="border-b border-line">
              <Link href={`/today/${wordSlug(w)}`} className="flex items-baseline justify-between gap-4 py-3 hover:text-gold-dark">
                <span className="font-serif text-lg">{w.title}</span>
                <span className="shrink-0 text-xs text-muted">{w.ref}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-16 text-center">
        <h2 className="text-3xl">Want to go deeper?</h2>
        <p className="mt-2 text-muted">
          Start a free 21-day devotional, or get a short word in your inbox every Sunday.
        </p>
        <Link href="/books" className="btn btn-line mt-6">Browse free books</Link>
        <div className="mx-auto mt-6 flex max-w-md justify-center [&>form]:w-full">
          <NewsletterForm source="today" />
        </div>
      </section>
    </div>
  );
}
