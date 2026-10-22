import type { Metadata } from "next";
import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";
import { site } from "@/lib/content";
import TodayWord from "./TodayWord";

export const metadata: Metadata = {
  title: "Today’s Word",
  description: "A verse and a short devotional message for today. A new word every morning.",
};

export default function TodayPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-12 sm:px-8">
      <header className="mb-10 text-center">
        <p className="eyebrow">A new word every morning</p>
        <h1 className="mt-3 text-5xl sm:text-6xl">Today’s Word</h1>
      </header>
      <TodayWord siteUrl={site.site_url} />
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
