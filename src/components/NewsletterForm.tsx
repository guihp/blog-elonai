"use client";

import { useState } from "react";
import { isEmail, subscribe } from "@/lib/subscribe";
import { track } from "@/lib/track";

export default function NewsletterForm({ source, dark = false }: { source: string; dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isEmail(email)) return setState("error");
    setState("sending");
    const company = String(new FormData(e.currentTarget).get("company") ?? "");
    await subscribe({ kind: "newsletter", email, source, company });
    track("signup", `newsletter:${source}`);
    setState("done");
  }

  if (state === "done")
    return <p className={`mt-8 font-serif text-2xl italic ${dark ? "text-gold-light" : "text-gold-dark"}`}>Thank you. See you Sunday.</p>;

  return (
    <form onSubmit={onSubmit} className="mt-8 flex max-w-md flex-col gap-3 sm:flex-row" noValidate>
      <label className="sr-only" htmlFor={`nl-${source}`}>Email address</label>
      <input
        id={`nl-${source}`}
        type="email"
        placeholder="Your email address"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setState("idle"); }}
        className={`field flex-1 ${dark ? "!border-white/15 !bg-white/5 !text-white placeholder:text-white/40" : ""}`}
        aria-invalid={state === "error"}
      />
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <button className="btn btn-gold" disabled={state === "sending"}>
        {state === "sending" ? "Joining…" : "Subscribe"}
      </button>
      {state === "error" && <p className="text-sm text-[#e7a58c] sm:hidden">Please enter a valid email.</p>}
    </form>
  );
}
