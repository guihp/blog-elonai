import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import BookCover from "@/components/BookCover";
import GetBook, { DigitalOnlyNote } from "@/components/GetBook";
import PostCard from "@/components/PostCard";
import WaitlistForm from "@/components/WaitlistForm";
import { books, coverSrc, getBook, getPosts, pdfSrc, site } from "@/lib/content";
import { donateOptions } from "@/lib/qr";

export function generateStaticParams() {
  return books.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: PageProps<"/books/[slug]">): Promise<Metadata> {
  const b = getBook((await params).slug);
  if (!b) return {};
  const title = `${b.title}: ${b.subtitle}`;
  return { title, description: b.short, openGraph: { title, description: b.short, images: [coverSrc(b.slug)] } };
}

export default function BookPage({ params }: PageProps<"/books/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <BookContent params={params} />
    </Suspense>
  );
}

async function BookContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const b = getBook(slug);
  if (!b) notFound();
  const free = b.status === "free";
  const donate = (await donateOptions())[0];
  const related = (await getPosts()).filter((p) => p.book === slug).slice(0, 3);
  const get = (label?: string, className?: string, openOnHash = false) => (
    <GetBook
      slug={b.slug}
      title={b.title}
      subtitle={b.subtitle}
      pages={b.pages}
      pdfUrl={pdfSrc(b)!}
      communityUrl={site.community_url}
      donate={donate}
      label={label}
      className={className}
      openOnHash={openOnHash}
    />
  );

  return (
    <>
      <section className="bg-linen">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-24">
          <BookCover slug={b.slug} title={b.title} preload sizes="(max-width: 1024px) 70vw, 420px" className="mx-auto w-[min(72vw,400px)] animate-rise" />
          <div>
            <Link href="/books" className="eyebrow hover:underline">{free ? `Free devotional · ${b.topic}` : `Coming soon · ${b.topic}`}</Link>
            <h1 className="mt-4 text-6xl leading-none sm:text-8xl">{b.title}</h1>
            <p className="mt-3 font-serif text-2xl italic text-muted sm:text-3xl">{b.subtitle}</p>
            <div className="mt-7 space-y-4 text-lg leading-relaxed text-ink-soft">
              {b.description.map((p) => <p key={p}>{p}</p>)}
            </div>
            <div className="mt-9 max-w-xl">
              {free ? (
                <div className="flex flex-wrap items-center gap-5">
                  {get("Get it free", undefined, true)}
                  <span className="text-sm text-muted">PDF · {b.pages} pages · US Letter, printable</span>
                  <DigitalOnlyNote className="mt-1 w-full max-w-md" />
                </div>
              ) : (
                <WaitlistForm slug={b.slug} title={b.title} />
              )}
            </div>
          </div>
        </div>
      </section>

      {free && (
        <>
          <section className="mx-auto max-w-7xl px-4 py-24 sm:px-8">
            <div className="grid gap-14 lg:grid-cols-[1fr_1.2fr]">
              <div>
                <p className="eyebrow">The journey</p>
                <h2 className="mt-3 text-5xl">Three weeks. Ten minutes a day.</h2>
                <ol className="mt-10 space-y-6">
                  {b.weeks.map((w, i) => (
                    <li key={w.name} className="grid grid-cols-[3.5rem_1fr] border-t border-line pt-5">
                      <span className="font-serif text-4xl leading-none text-gold">{i + 1}</span>
                      <div>
                        <p className="eyebrow !text-muted">Week {["One", "Two", "Three"][i]}</p>
                        <h3 className="mt-1 text-3xl">{w.name}</h3>
                        <p className="mt-1 text-muted">{w.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="eyebrow mt-14">What’s inside</p>
                <ul className="mt-5 space-y-3">
                  {b.inside.map((x) => (
                    <li key={x} className="flex gap-3 text-ink-soft"><span className="text-gold">✦</span>{x}</li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4 self-start">
                {["letter", "week1", "day-read", "day-respond"].map((p, i) => (
                  <Image
                    key={p}
                    src={`/books/${b.slug}/${p}.jpg`}
                    alt={`${b.title} sample page`}
                    width={1100}
                    height={1424}
                    sizes="(max-width: 1024px) 45vw, 27vw"
                    className={`shadow-[0_20px_40px_-18px_rgba(60,40,20,.4)] ${i % 2 ? "translate-y-10" : ""}`}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="bg-night text-white">
            <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-8">
              <p className="eyebrow !text-gold-light">Free, always</p>
              <h2 className="mt-4 text-5xl leading-tight sm:text-6xl">Begin tomorrow morning.</h2>
              <p className="mx-auto mt-5 max-w-xl text-white/70">
                Download the PDF, print it or write in it on your tablet, and start Day 1 with your morning coffee.
              </p>
              <div className="mt-9 flex justify-center">{get("Download free", "btn btn-gold")}</div>
            </div>
          </section>
        </>
      )}

      <section className="mx-auto max-w-3xl px-4 pt-24 sm:px-8">
        <p className="eyebrow text-center">Questions</p>
        <h2 className="mt-3 text-center text-4xl sm:text-5xl">Good to know</h2>
        <div className="mt-10 divide-y divide-line border-y border-line">
          {[
            ["Will I receive a printed book in the mail?", "No. This is a digital book only. After you sign up, you’ll download a PDF file right away. Nothing is shipped, and we will never ask for your address."],
            ["Is it really free?", "Yes. Every Elonai devotional is a free gift. There is no payment, trial or subscription. If it blesses you, you’re welcome to give, but it’s never required."],
            ["How do I use the PDF?", "Read it on your phone, tablet or computer, write on it in an app like GoodNotes, or print it at home or at a local print shop (US Letter size)."],
            ["Can I share it with my small group or church?", "Absolutely. Please share it freely, as long as it isn’t sold or changed. You can also send friends to this page to get their own copy."],
          ].map(([q, a]) => (
            <details key={q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-serif text-2xl">
                {q}
                <span className="text-gold transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-ink-soft">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-8">
          <p className="eyebrow">Related reading</p>
          <h2 className="mt-3 text-4xl">From the blog</h2>
          <div className="mt-10 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => <PostCard key={p.slug} post={p} />)}
          </div>
        </section>
      )}
    </>
  );
}
