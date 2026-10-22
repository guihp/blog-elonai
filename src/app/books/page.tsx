import type { Metadata } from "next";
import Link from "next/link";
import BookCover from "@/components/BookCover";
import { books } from "@/lib/content";

export const metadata: Metadata = {
  title: "Free Christian Devotionals",
  description: "Beautifully designed, Bible-based devotionals and prayer journals. Free to download, print and share.",
};

export default function BooksPage() {
  const free = books.filter((b) => b.status === "free");
  const soon = books.filter((b) => b.status !== "free");
  return (
    <div className="mx-auto max-w-7xl px-4 pt-14 sm:px-8">
      <header className="max-w-3xl">
        <p className="eyebrow">The Elonai Devotional Collection</p>
        <h1 className="mt-4 text-6xl leading-none sm:text-7xl">Free books for your walk with God.</h1>
        <p className="mt-6 text-lg text-muted">Each devotional is written to be read slowly, printed, written in and passed on. Always free.</p>
        <p className="mt-5 inline-flex items-center gap-2 border border-gold-light bg-white px-4 py-2 text-sm text-ink-soft">
          <span className="text-gold">✦</span> Digital PDF downloads only. No physical books are shipped.
        </p>
      </header>

      <div className="mt-16 grid gap-16 border-t border-line pt-16 md:grid-cols-2">
        {free.map((b) => (
          <Link key={b.slug} href={`/books/${b.slug}`} className="group grid items-center gap-8 sm:grid-cols-[minmax(0,220px)_1fr]">
            <BookCover slug={b.slug} title={b.title} sizes="220px" className="mx-auto w-[200px] transition-transform duration-500 group-hover:-translate-y-2 sm:w-full" />
            <div>
              <p className="eyebrow">{b.topic} · Free PDF</p>
              <h2 className="mt-2 text-4xl group-hover:text-gold-dark">{b.title}</h2>
              <p className="font-serif text-xl italic text-muted">{b.subtitle}</p>
              <p className="mt-4 text-ink-soft">{b.short}</p>
              <span className="mt-5 inline-block border-b border-gold pb-1 text-sm uppercase tracking-[0.2em] text-gold-dark">Get it free →</span>
            </div>
          </Link>
        ))}
      </div>

      {soon.length > 0 && (
      <section className="mt-24 bg-linen px-6 py-16 sm:px-12">
        <p className="eyebrow">Coming soon</p>
        <h2 className="mt-3 text-5xl">In the writing room</h2>
        <div className="mt-12 grid gap-12 sm:grid-cols-3">
          {soon.map((b) => (
            <Link key={b.slug} href={`/books/${b.slug}`} className="group">
              <BookCover slug={b.slug} title={b.title} sizes="(max-width: 640px) 80vw, 25vw" className="mx-auto max-w-[260px] transition-transform duration-500 group-hover:-translate-y-2" />
              <h3 className="mt-6 text-3xl">{b.title}</h3>
              <p className="text-muted">{b.short}</p>
              <span className="mt-3 inline-block text-sm uppercase tracking-[0.2em] text-sage">Join the waitlist →</span>
            </Link>
          ))}
        </div>
      </section>
      )}
    </div>
  );
}
