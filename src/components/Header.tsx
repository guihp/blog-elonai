"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const NAV = [
  { href: "/today", label: "Today’s Word" },
  { href: "/blog", label: "Blog" },
  { href: "/books", label: "Free Books" },
  { href: "/small-groups", label: "Small Groups" },
  { href: "/community", label: "Community" },
];

function DesktopLinks({ pathname }: { pathname: string }) {
  return NAV.map((n) => (
    <Link
      key={n.href}
      href={n.href}
      className={`text-[0.78rem] uppercase tracking-[0.2em] transition-colors hover:text-gold-dark ${
        pathname.startsWith(n.href) ? "text-gold-dark" : "text-ink-soft"
      }`}
    >
      {n.label}
    </Link>
  ));
}

// usePathname suspends on routes whose params are only known at request time, so it lives behind <Suspense>.
function ActiveDesktopLinks() {
  return <DesktopLinks pathname={usePathname()} />;
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-[background-color,box-shadow] duration-300 ${
        scrolled || open ? "bg-paper/95 backdrop-blur shadow-[0_1px_0_var(--color-line)]" : "bg-paper"
      }`}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Elonai home">
          <Image src="/logo-mark.png" alt="" width={30} height={40} className="h-9 w-auto" preload />
          <span className="font-serif text-[1.55rem] tracking-[0.28em] text-ink">ELONAI</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          <Suspense fallback={<DesktopLinks pathname="" />}>
            <ActiveDesktopLinks />
          </Suspense>
          <Link href="/give" className="btn btn-line !py-2.5 !px-5">
            Give
          </Link>
        </nav>

        <button
          className="lg:hidden -mr-2 p-2"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span className={`block h-px w-6 bg-ink transition ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
          <span className={`mt-1.5 block h-px w-6 bg-ink transition ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
        </button>
      </div>

      {open && (
        <nav className="border-t border-line px-4 pb-6 pt-2 lg:hidden">
          {[...NAV, { href: "/about", label: "About" }, { href: "/give", label: "Give" }].map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="block border-b border-line py-4 font-serif text-2xl">
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
