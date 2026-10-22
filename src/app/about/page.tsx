import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "Elonai creates free, beautifully designed devotionals rooted in the Word of God.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-14 sm:px-8">
      <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="eyebrow">About Elonai</p>
          <h1 className="mt-4 text-6xl leading-none sm:text-7xl">Rooted in the Word. Freely given.</h1>
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-ink-soft">
            <p>
              Elonai began with a simple burden. Again and again, we saw people in comment sections, Facebook groups and
              prayer requests saying the same thing in different words: <em>I’m tired. I’m anxious. I don’t know how to
              get close to God.</em>
            </p>
            <p>
              Some of the books that drew us closest to God were simple, honest and deeply biblical. We wanted to make
              resources like that, beautiful enough to treasure and simple enough to use every day, and give them away.
            </p>
            <p>
              Everything we create is built on Scripture. We quote the King James Version, write every devotional
              ourselves, and keep every book free. If a resource helps you, the best thanks is to pass it on.
            </p>
          </div>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image src="/images/post-prayer-journal.jpg" alt="An open prayer journal and Bible" fill preload sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
        </div>
      </div>

      <div className="mt-24 grid gap-px bg-line md:grid-cols-3">
        {[
          ["Scripture first", "Every devotional is anchored in the Bible, read in context and applied to real life."],
          ["Free, always", "No paywalls. Our books are gifts, supported by readers who choose to give."],
          ["Made to be shared", "Print it, write in it, send it to a friend, use it with your small group."],
        ].map(([t, d]) => (
          <div key={t} className="bg-paper p-10">
            <h2 className="text-3xl">{t}</h2>
            <p className="mt-3 text-muted">{d}</p>
          </div>
        ))}
      </div>
      <div className="mt-20 text-center">
        <Link href="/books" className="btn btn-gold">Explore the free books</Link>
      </div>
    </div>
  );
}
