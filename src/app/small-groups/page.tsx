import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { games, guides, leaderTips } from "@/content/small-groups";
import { getBook } from "@/lib/content";

export const metadata: Metadata = {
  title: "Small Group Resources",
  description:
    "Free small group resources: leader tips, ready-to-use Bible discussion guides, icebreakers and faith-building games for home groups and life groups.",
};

const SECTIONS = [
  { id: "tips", label: "Leader tips" },
  { id: "guides", label: "Discussion guides" },
  { id: "games", label: "Games & icebreakers" },
  { id: "books", label: "Study a book together" },
];

export default function SmallGroupsPage() {
  const groupBooks = ["anchored", "breathe"].map((s) => getBook(s)!);
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <Image src="/images/small-groups.jpg" alt="" fill preload sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-night/90 via-night/65 to-night/20" />
        <div className="mx-auto max-w-7xl px-4 py-24 text-white sm:px-8 lg:py-36">
          <p className="eyebrow !text-gold-light">Small groups · Life groups · Home groups</p>
          <h1 className="mt-4 max-w-3xl text-6xl leading-[0.98] sm:text-7xl">Grow closer to God, together.</h1>
          <p className="mt-6 max-w-xl text-lg text-white/80">
            Free tools for your small group: practical tips for leaders, ready-to-use Bible discussion guides, and games
            that turn laughter into connection and connection into faith.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#guides" className="btn btn-gold">Get a discussion guide</a>
            <a href="#games" className="btn border border-white/60 text-white hover:bg-white hover:text-ink">See the games</a>
          </div>
        </div>
      </section>

      <nav className="sticky top-18 z-30 border-b border-line bg-paper/95 backdrop-blur" aria-label="On this page">
        <div className="mx-auto flex max-w-7xl gap-7 overflow-x-auto px-4 sm:px-8 [scrollbar-width:none]">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="shrink-0 py-4 text-[0.72rem] uppercase tracking-[0.2em] text-ink-soft hover:text-gold-dark">
              {s.label}
            </a>
          ))}
        </div>
      </nav>

      {/* Leader tips */}
      <section id="tips" className="mx-auto max-w-7xl scroll-mt-32 px-4 py-24 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="eyebrow">For leaders &amp; hosts</p>
            <h2 className="mt-3 text-5xl leading-tight">12 tips for a group people love coming back to</h2>
            <p className="mt-4 text-muted">
              You don’t need to be a Bible scholar to lead a small group. You need to love people, open the Word and
              make room for the Holy Spirit.
            </p>
          </div>
          <ol className="grid gap-px bg-line sm:grid-cols-2">
            {leaderTips.map((t, i) => (
              <li key={t.title} className="bg-paper p-7">
                <span className="font-serif text-3xl text-gold">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 text-2xl">{t.title}</h3>
                <p className="mt-2 text-muted">{t.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Discussion guides */}
      <section id="guides" className="scroll-mt-32 bg-linen">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-8">
          <div className="max-w-2xl">
            <p className="eyebrow">Ready to use</p>
            <h2 className="mt-3 text-5xl">Bible discussion guides</h2>
            <p className="mt-4 text-muted">
              Each guide fills about 45 minutes: an opening question, a passage to read aloud, discussion questions, one
              way to live it out this week, and a prayer idea. Tap a guide to open it.
            </p>
          </div>
          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            {guides.map((g) => (
              <details key={g.slug} id={g.slug} className="group self-start bg-paper shadow-[0_1px_0_var(--color-line)] open:shadow-[0_20px_40px_-24px_rgba(60,40,20,.35)]">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 p-7">
                  <div>
                    <p className="eyebrow !text-sage">{g.theme}</p>
                    <h3 className="mt-2 text-3xl">{g.title}</h3>
                    <p className="mt-1 text-sm text-muted">Read: {g.read}</p>
                  </div>
                  <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold-light text-xl text-gold transition-transform group-open:rotate-45">+</span>
                </summary>
                <div className="space-y-6 border-t border-line px-7 pb-8 pt-6">
                  <blockquote className="border-l-2 border-gold pl-4 font-serif text-xl italic">
                    “{g.keyVerse}” <span className="eyebrow not-italic !text-[0.65rem]">{g.keyRef}</span>
                  </blockquote>
                  <div>
                    <p className="eyebrow">Open · 10 min</p>
                    <p className="mt-1 text-ink-soft">{g.open}</p>
                  </div>
                  <div>
                    <p className="eyebrow">Read &amp; discuss · 25 min</p>
                    <p className="mt-1 text-sm text-muted">Have one or two people read {g.read} aloud.</p>
                    <ol className="mt-3 list-decimal space-y-2 pl-5 text-ink-soft marker:text-gold">
                      {g.questions.map((q) => <li key={q}>{q}</li>)}
                    </ol>
                  </div>
                  <div>
                    <p className="eyebrow">Live it out</p>
                    <p className="mt-1 text-ink-soft">{g.apply}</p>
                  </div>
                  <div>
                    <p className="eyebrow">Pray · 10 min</p>
                    <p className="mt-1 text-ink-soft">{g.pray}</p>
                  </div>
                  {g.book && (
                    <p className="bg-linen p-4 text-sm text-ink-soft">
                      Want to go deeper? This guide pairs with our free devotional{" "}
                      <Link href={`/books/${g.book}`} className="text-gold-dark underline">{getBook(g.book)?.title}</Link>.
                    </p>
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Games */}
      <section id="games" className="mx-auto max-w-7xl scroll-mt-32 px-4 py-24 sm:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow">Laugh, connect, grow</p>
          <h2 className="mt-3 text-5xl">Games, icebreakers &amp; challenges</h2>
          <p className="mt-4 text-muted">
            Great groups play together. These activities work for youth groups, women’s and men’s groups, families and
            mixed ages, and every one points back to God.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((g) => (
            <article key={g.name} className="flex flex-col border border-line bg-white p-7">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.18em] ${
                  g.kind === "Icebreaker" ? "bg-linen text-gold-dark" : g.kind === "Game" ? "bg-[#eef0e8] text-[#5b6650]" : "bg-[#f3e7df] text-[#8a5a44]"
                }`}>{g.kind}</span>
                <span className="text-xs text-muted">{g.time}</span>
              </div>
              <h3 className="mt-4 text-[1.7rem] leading-tight">{g.name}</h3>
              <p className="mt-1 text-xs uppercase tracking-[0.15em] text-muted">Group: {g.size} · Need: {g.need}</p>
              <p className="mt-4 text-ink-soft">{g.how}</p>
              <p className="mt-auto border-t border-line pt-4 text-sm text-muted">
                <span className="text-gold">✦</span> {g.faith}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Books for groups */}
      <section id="books" className="mx-auto max-w-7xl scroll-mt-32 px-4 sm:px-8">
        <div className="grid items-center gap-10 bg-night p-8 text-white sm:p-14 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="eyebrow !text-gold-light">Study a book together</p>
            <h2 className="mt-3 text-5xl leading-tight">Take a 3-week journey as a group.</h2>
            <p className="mt-4 text-white/75">
              Our free 21-day devotionals are perfect for groups: everyone reads the daily pages at home, and you meet once
              a week to talk through the week’s theme. Each member downloads their own free digital copy (PDF).
            </p>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {groupBooks.map((b) => (
              <Link key={b.slug} href={`/books/${b.slug}`} className="group">
                <div className="relative aspect-[8.5/11] overflow-hidden shadow-2xl transition-transform duration-500 group-hover:-translate-y-1">
                  <Image src={`/books/${b.slug}/cover.jpg`} alt={b.title} fill sizes="200px" className="object-cover" />
                </div>
                <p className="mt-3 font-serif text-xl">{b.title}</p>
                <p className="text-sm text-white/60">{b.topic}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
