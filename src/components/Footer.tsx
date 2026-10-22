import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/content";
import NewsletterForm from "./NewsletterForm";

export default function Footer() {
  const socials = Object.entries(site.socials).filter(([, url]) => url);
  return (
    <footer className="mt-24 bg-night text-[#e9dfcf]">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <p className="eyebrow !text-gold-light">A word for your week</p>
            <h2 className="mt-4 text-4xl leading-tight text-white sm:text-5xl">
              Encouragement in your inbox,
              <br />
              <em>every Sunday morning.</em>
            </h2>
            <p className="mt-4 max-w-md text-[#bfb2a0]">
              One short devotional, one verse to carry and the newest free resources. No spam, ever.
            </p>
            <NewsletterForm source="footer" dark />
          </div>
          <div>
            <p className="eyebrow !text-gold-light">Explore</p>
            <ul className="mt-5 space-y-3 font-serif text-xl">
              <li><Link href="/today" className="hover:text-gold-light">Today’s Word</Link></li>
              <li><Link href="/blog" className="hover:text-gold-light">The Blog</Link></li>
              <li><Link href="/books" className="hover:text-gold-light">Free Devotionals</Link></li>
              <li><Link href="/small-groups" className="hover:text-gold-light">Small Groups</Link></li>
              <li><Link href="/community" className="hover:text-gold-light">Community</Link></li>
              <li><Link href="/give" className="hover:text-gold-light">Give</Link></li>
              <li><Link href="/about" className="hover:text-gold-light">About</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow !text-gold-light">Stay close</p>
            <ul className="mt-5 space-y-3 text-[#cfc3b2]">
              <li><a href={site.community_url} target="_blank" rel="noopener" className="hover:text-white">Facebook community</a></li>
              {socials.map(([name, url]) => (
                <li key={name}><a href={url} target="_blank" rel="noopener" className="hover:text-white">{name}</a></li>
              ))}
              <li><a href={`mailto:${site.contact_email}`} className="hover:text-white">{site.contact_email}</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-6 border-t border-white/10 pt-8 text-sm text-[#9d907f] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo-mark.png" alt="" width={22} height={29} className="h-7 w-auto opacity-80" />
            <span>© 2026 Elonai Store · <Link href="/privacy" className="hover:text-white">Privacy</Link></span>
          </div>
          <p className="max-w-xl sm:text-right">
            All books are free digital downloads (PDF); no physical products are shipped. Our resources are not a substitute for professional care. In crisis? Call or text <b className="text-white">988</b> (US).
          </p>
        </div>
      </div>
    </footer>
  );
}
