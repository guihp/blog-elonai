import Image from "next/image";
import Link from "next/link";
import BookCover from "@/components/BookCover";
import PostCard from "@/components/PostCard";
import { books, getBook, getPosts } from "@/lib/content";

export default async function Home() {
  const posts = await getPosts();
  const [featured, ...rest] = posts;
  const spotlight = getBook("breathe")!;

  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-10 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-16">
        <div className="animate-rise">
          <p className="eyebrow">Free devotionals · Honest encouragement</p>
          <h1 className="mt-5 text-[3.4rem] leading-[0.98] sm:text-7xl lg:text-[5.6rem]">
            Daily words for <em className="text-gold-dark">weary</em> hearts.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
            Bible-rooted devotionals, prayer journals and stories that bring you back to Jesus, one quiet morning at a
            time. Everything here is free.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/books" className="btn btn-gold">Browse free books</Link>
            <Link href="/blog" className="btn btn-line">Read the blog</Link>
          </div>
          <p className="mt-10 font-serif text-lg italic text-muted">
            “Come unto me, all ye that labour and are heavy laden, and I will give you rest.”{" "}
            <span className="not-italic eyebrow !text-[0.65rem]">Matthew 11:28</span>
          </p>
        </div>

        <div className="relative animate-rise [animation-delay:150ms]">
          <div className="relative ml-auto aspect-[4/5] w-full max-w-[560px] overflow-hidden">
            <Image src="/images/hero-home.jpg" alt="A woman reading her Bible by a window at sunrise" fill preload sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover object-[60%_center]" />
          </div>
          <Link href="/books/anchored" className="absolute -bottom-10 left-0 w-[38%] max-w-[210px] transition-transform duration-500 hover:-translate-y-1 sm:-left-8">
            <BookCover slug="anchored" title="Anchored" sizes="210px" />
          </Link>
        </div>
      </section>

      {/* Latest posts */}
      <section className="border-t border-line bg-white/50">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-8">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow">From the blog</p>
              <h2 className="mt-3 text-5xl sm:text-6xl">Latest encouragement</h2>
            </div>
            <Link href="/blog" className="hidden text-sm uppercase tracking-[0.2em] text-gold-dark hover:underline sm:block">All posts →</Link>
          </div>
          <div className="mt-14 grid gap-14 lg:grid-cols-[1.6fr_1fr]">
            {featured && <PostCard post={featured} large />}
            <div className="grid gap-10">
              {rest.slice(0, 2).map((p) => <PostCard key={p.slug} post={p} />)}
            </div>
          </div>
        </div>
      </section>

      {/* The collection */}
      <section className="bg-linen">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">The Elonai Devotional Collection</p>
            <h2 className="mt-3 text-5xl sm:text-6xl">Beautiful books, freely given</h2>
            <p className="mt-5 text-lg text-muted">
              Every devotional is a free digital download (PDF), designed to be printed at home, written in and shared.
              No cost, no catch, just a gift to help you draw near to God.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
            {books.map((b) => (
              <Link key={b.slug} href={`/books/${b.slug}`} className="group">
                <BookCover slug={b.slug} title={b.title} sizes="(max-width: 640px) 45vw, 20vw" className="transition-transform duration-500 group-hover:-translate-y-2" />
                <p className={`eyebrow mt-6 ${b.status === "free" ? "" : "!text-sage"}`}>{b.status === "free" ? "Free download" : "Coming soon"}</p>
                <h3 className="mt-1 text-2xl">{b.title}</h3>
                <p className="text-sm text-muted">{b.topic}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Spotlight */}
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-24 sm:px-8 lg:grid-cols-2">
        <div className="relative mx-auto w-full max-w-[520px]">
          <div className="grid grid-cols-2 gap-4">
            <Image src={`/books/${spotlight.slug}/day-read.jpg`} alt="A reading page from Breathe" width={1100} height={1424} className="shadow-xl" sizes="(max-width: 1024px) 45vw, 25vw" />
            <Image src={`/books/${spotlight.slug}/day-respond.jpg`} alt="A journal page from Breathe" width={1100} height={1424} className="mt-12 shadow-xl" sizes="(max-width: 1024px) 45vw, 25vw" />
          </div>
        </div>
        <div>
          <p className="eyebrow">New · Free devotional</p>
          <h2 className="mt-3 text-5xl sm:text-6xl">{spotlight.title}</h2>
          <p className="mt-2 font-serif text-2xl italic text-muted">{spotlight.subtitle}</p>
          <p className="mt-6 text-lg leading-relaxed text-ink-soft">{spotlight.short}</p>
          <ul className="mt-7 space-y-4">
            {spotlight.weeks.map((w, i) => (
              <li key={w.name} className="flex gap-5 border-t border-line pt-4">
                <span className="font-serif text-3xl leading-none text-gold">{["i", "ii", "iii"][i]}.</span>
                <span><b className="font-medium">{w.name}.</b> <span className="text-muted">{w.desc}</span></span>
              </li>
            ))}
          </ul>
          <Link href={`/books/${spotlight.slug}`} className="btn btn-gold mt-9">Get Breathe free</Link>
        </div>
      </section>

      {/* Community + give */}
      <section className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-8 md:grid-cols-2">
        {[
          { href: "/community", img: "community", eyebrow: "Community", title: "You don’t have to walk alone.", text: "Join women and families reading together, sharing prayer requests and cheering each other on.", cta: "Join the community" },
          { href: "/give", img: "give", eyebrow: "Give", title: "Help the next person find Him.", text: "Every book stays free. Your gift helps us create and share new devotionals with people who need them.", cta: "Give a gift" },
        ].map((c) => (
          <Link key={c.href} href={c.href} className="group relative flex min-h-[460px] items-end overflow-hidden p-8 text-white sm:p-10">
            <Image src={`/images/${c.img}.jpg`} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-[1.4s] group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/35 to-transparent" />
            <div className="relative">
              <p className="eyebrow !text-gold-light">{c.eyebrow}</p>
              <h3 className="mt-3 text-4xl leading-tight sm:text-5xl">{c.title}</h3>
              <p className="mt-3 max-w-md text-white/80">{c.text}</p>
              <span className="mt-6 inline-block border-b border-gold-light pb-1 text-sm uppercase tracking-[0.2em]">{c.cta} →</span>
            </div>
          </Link>
        ))}
      </section>
    </>
  );
}
