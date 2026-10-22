import type { Metadata } from "next";
import Image from "next/image";
import NewsletterForm from "@/components/NewsletterForm";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Community",
  description: "A free, kind and prayerful online community reading Elonai devotionals together.",
};

const RHYTHM = [
  { day: "Monday", title: "Verse of the week", text: "One verse to memorize together, with a printable card." },
  { day: "Wednesday", title: "Prayer wall", text: "Share a request (first name only) and pray for one another." },
  { day: "Friday", title: "Testimony Friday", text: "Tell how God met you this week. Small stories count." },
  { day: "Sunday", title: "The Sunday letter", text: "A short devotional in your inbox to start the week." },
];

export default function CommunityPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <Image src="/images/community.jpg" alt="" fill preload sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-night/90 via-night/60 to-night/10" />
        <div className="mx-auto max-w-7xl px-4 py-28 text-white sm:px-8 lg:py-40">
          <p className="eyebrow !text-gold-light">The Elonai community</p>
          <h1 className="mt-4 max-w-2xl text-6xl leading-none sm:text-7xl">You don’t have to walk alone.</h1>
          <p className="mt-6 max-w-xl text-lg text-white/80">
            A free, kind and prayerful space to read the devotionals together, share what God is doing and carry one
            another’s burdens.
          </p>
          <a href={site.community_url} target="_blank" rel="noopener" className="btn btn-gold mt-9">Join on Facebook</a>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-8">
        <p className="eyebrow">Our weekly rhythm</p>
        <h2 className="mt-3 text-5xl">A gentle rhythm, every week</h2>
        <div className="mt-12 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
          {RHYTHM.map((r) => (
            <div key={r.day} className="bg-paper p-8">
              <p className="eyebrow !text-sage">{r.day}</p>
              <h3 className="mt-3 text-3xl">{r.title}</h3>
              <p className="mt-2 text-muted">{r.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-20 grid gap-10 bg-linen p-8 sm:p-12 lg:grid-cols-2">
          <div>
            <h2 className="text-4xl">Our community promise</h2>
            <p className="mt-4 text-ink-soft">
              We point each other to Jesus. We keep prayer requests private to the group. We are kind in every comment.
              We never sell anything to one another. Everyone is welcome, whatever your story.
            </p>
          </div>
          <div>
            <h3 className="text-3xl">Not on Facebook?</h3>
            <p className="mt-2 text-muted">Get the Sunday letter by email instead.</p>
            <NewsletterForm source="community" />
          </div>
        </div>
      </section>
    </>
  );
}
