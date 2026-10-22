"use client";

import { useState } from "react";
import { isEmail, subscribe } from "@/lib/subscribe";
import { track } from "@/lib/track";

export default function WaitlistForm({ slug, title }: { slug: string; title: string }) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "");
    if (!isEmail(email)) return setError("Please enter a valid email.");
    setError("");
    await subscribe({
      kind: "waitlist",
      book: slug,
      email,
      first_name: String(f.get("first_name") ?? ""),
      company: String(f.get("company") ?? ""),
      source: `waitlist:${slug}`,
    });
    track("signup", `waitlist:${slug}`);
    setDone(true);
  }

  if (done)
    return (
      <div className="border border-gold-light bg-white p-6">
        <p className="font-serif text-2xl">You’re on the list.</p>
        <p className="mt-1 text-muted">We’ll email you the moment <em>{title}</em> is ready, free, as always.</p>
      </div>
    );

  return (
    <form onSubmit={onSubmit} noValidate className="border border-gold-light bg-white p-6">
      <p className="eyebrow">Coming soon · Join the waitlist</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1.4fr]">
        <input name="first_name" placeholder="First name" className="field" autoComplete="given-name" />
        <input name="email" type="email" placeholder="Email address" className="field" autoComplete="email" />
      </div>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {error && <p className="mt-3 text-sm text-[#a2452c]">{error}</p>}
      <button className="btn btn-ink mt-4 w-full">Notify me when it’s ready</button>
    </form>
  );
}
