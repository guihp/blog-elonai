import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import BookCover from "@/components/BookCover";
import PostCard from "@/components/PostCard";
import { formatDate, getBook, getPost, getPosts } from "@/lib/content";

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { type: "article", title: post.title, description: post.excerpt, images: [`/images/${post.image}.jpg`] },
  };
}

export default function PostPage({ params }: PageProps<"/blog/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <PostContent params={params} />
    </Suspense>
  );
}

async function PostContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const book = post.book ? getBook(post.book) : undefined;
  const more = (await getPosts()).filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <article>
      <header className="mx-auto max-w-3xl px-4 pt-14 text-center sm:px-8">
        <Link href="/blog" className="eyebrow hover:underline">{post.category}</Link>
        <h1 className="mt-5 text-5xl leading-[1.05] sm:text-6xl">{post.title}</h1>
        <p className="mt-6 text-sm uppercase tracking-[0.2em] text-muted">
          {formatDate(post.date)} · {post.minutes} min read
        </p>
      </header>
      <div className="relative mx-auto mt-12 aspect-[16/9] max-w-6xl overflow-hidden sm:px-8">
        <div className="relative h-full w-full overflow-hidden">
          <Image src={`/images/${post.image}.jpg`} alt="" fill preload sizes="(max-width: 1200px) 100vw, 1150px" className="object-cover" />
        </div>
      </div>

      <div className="mx-auto max-w-[44rem] px-4 pt-14 sm:px-8">
        <p className="font-serif text-2xl italic leading-snug text-ink">{post.excerpt}</p>
        <div className="ornament my-10 text-xs">✦</div>
        <div className="prose-elonai" data-read dangerouslySetInnerHTML={{ __html: post.html }} />

        {book && (
          <aside className="mt-16 grid items-center gap-8 bg-linen p-8 sm:grid-cols-[150px_1fr] sm:p-10">
            <Link href={`/books/${book.slug}`} className="mx-auto w-[140px]">
              <BookCover slug={book.slug} title={book.title} sizes="150px" />
            </Link>
            <div>
              <p className="eyebrow">{book.status === "free" ? "Free devotional" : "Coming soon"}</p>
              <h2 className="mt-2 text-3xl">{book.title}: {book.subtitle}</h2>
              <p className="mt-2 text-muted">{book.short}</p>
              <Link href={`/books/${book.slug}`} className="btn btn-gold mt-5">
                {book.status === "free" ? "Get it free" : "Join the waitlist"}
              </Link>
            </div>
          </aside>
        )}
      </div>

      <section className="mx-auto mt-24 max-w-7xl border-t border-line px-4 pt-16 sm:px-8">
        <h2 className="text-4xl">Keep reading</h2>
        <div className="mt-10 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {more.map((p) => <PostCard key={p.slug} post={p} />)}
        </div>
      </section>
    </article>
  );
}
