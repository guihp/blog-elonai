"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import DonateOptions, { type DonateOption } from "@/components/DonateOptions";
import { isEmail, subscribe } from "@/lib/subscribe";
import { SURVEY, SURVEY_FIELDS } from "@/lib/survey";
import { track } from "@/lib/track";

type Props = {
  slug: string;
  title: string;
  subtitle: string;
  pages?: number;
  pdfUrl: string;
  communityUrl: string;
  donate: DonateOption;
  label?: string;
  className?: string;
  openOnHash?: boolean; // open automatically when the URL ends in #get (links from posts and emails)
};

const SIGNED_KEY = "elonai_signed";

// Returning visitors (signed up before on this device) skip straight to the download step.
function readSigned() {
  try {
    return localStorage.getItem(SIGNED_KEY);
  } catch {
    return null;
  }
}

function onStorage(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

function signedName(raw: string | null) {
  try {
    return raw ? (JSON.parse(raw).name as string) : "";
  } catch {
    return "";
  }
}

// A 21-day daily reminder the reader can add to her phone calendar.
function downloadIcs(title: string, time: string, url: string) {
  const [h, m] = time.split(":").map(Number);
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(h, m, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const end = new Date(start.getTime() + 15 * 60000);
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Elonai//Devotional//EN", "BEGIN:VEVENT",
    `UID:${Date.now()}@elonai`, `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`, "RRULE:FREQ=DAILY;COUNT=21",
    `SUMMARY:${title} — today's devotional`, `DESCRIPTION:Ten quiet minutes with God. ${url}`,
    "BEGIN:VALARM", "TRIGGER:PT0M", "ACTION:DISPLAY", `DESCRIPTION:${title}`, "END:VALARM",
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  a.download = `${title.toLowerCase()}-reminder.ics`;
  a.click();
}

const Check = () => (
  <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-gold" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function DigitalOnlyNote({ className = "" }: { className?: string }) {
  return (
    <p className={`flex items-start gap-2.5 text-sm leading-snug text-ink-soft ${className}`}>
      <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-gold-dark" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" />
      </svg>
      <span>
        <b className="font-medium text-ink">Digital download only.</b> You’ll receive a PDF to read on your phone or print at home. No physical book will be shipped.
      </span>
    </p>
  );
}

const field = "field !bg-white";
const label = "mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.18em] text-ink-soft";

export default function GetBook({
  slug, title, subtitle, pages, pdfUrl, communityUrl, donate,
  label: buttonLabel = "Get it free", className = "btn btn-gold", openOnHash = false,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState<"form" | "done">("form");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [time, setTime] = useState("07:00");
  const signed = useSyncExternalStore(onStorage, readSigned, () => null);
  const done = step === "done" || signed !== null;

  useEffect(() => {
    if (openOnHash && window.location.hash === "#get") {
      dialog.current?.showModal();
      track("form_open", slug);
    }
  }, [openOnHash, slug]);

  // Funnel step 2: the download box was opened (step 1 is the book page view, 3 the signup, 4 the PDF click).
  function open() {
    dialog.current?.showModal();
    track("form_open", slug);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const first = String(f.get("first_name") ?? "").trim();
    const email = String(f.get("email") ?? "").trim();
    if (!first) return setError("Please tell us your first name.");
    if (!isEmail(email)) return setError("Please enter a valid email so we can send your reminders.");
    setError("");
    setSending(true);
    // Never block the download on the network: the gift is the point.
    await subscribe({
      kind: "download",
      book: slug,
      first_name: first,
      email,
      state: String(f.get("state") ?? ""),
      prayer_request: String(f.get("prayer_request") ?? ""),
      email_reminders: f.get("email_reminders") === "on",
      share_request: f.get("share_request") === "on",
      company: String(f.get("company") ?? ""),
      source: `book:${slug}`,
      ...Object.fromEntries(SURVEY_FIELDS.map((k) => [k, String(f.get(k) ?? "")])),
    });
    track("signup", `book:${slug}`);
    try {
      localStorage.setItem(SIGNED_KEY, JSON.stringify({ name: first }));
    } catch {}
    setName(first);
    setSending(false);
    setStep("done");
  }

  return (
    <>
      <button type="button" className={className} onClick={open}>
        {buttonLabel}
      </button>

      <dialog
        ref={dialog}
        className="modal w-[min(920px,calc(100vw-24px))]"
        aria-label={`Get ${title}`}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
      >
        <button onClick={() => dialog.current?.close()} className="modal-close" aria-label="Close">×</button>

        <div className="grid md:grid-cols-[290px_1fr]">
          {/* Book summary */}
          <aside className="flex items-center gap-5 bg-linen px-6 py-6 md:flex-col md:items-stretch md:gap-7 md:px-8 md:py-10">
            <div className="relative aspect-[8.5/11] w-20 shrink-0 overflow-hidden rounded-r-[2px] shadow-[0_18px_30px_-12px_rgba(60,40,20,.45)] md:w-full">
              <Image src={`/books/${slug}/cover.jpg`} alt={`${title} cover`} fill sizes="(max-width: 768px) 80px, 230px" className="object-cover" />
              <div className="absolute inset-y-0 left-0 w-[7%] bg-gradient-to-r from-black/25 to-transparent" />
            </div>
            <div className="min-w-0">
              <p className="eyebrow !text-[0.65rem]">Free devotional</p>
              <h3 className="mt-1 text-3xl leading-none">{title}</h3>
              <p className="mt-1 font-serif text-[1.05rem] italic leading-snug text-muted">{subtitle}</p>
              <ul className="mt-5 hidden space-y-2.5 text-sm text-ink-soft md:block">
                <li className="flex gap-2.5"><Check />Free, forever. No payment, ever.</li>
                <li className="flex gap-2.5"><Check />Instant PDF download{pages ? `, ${pages} pages` : ""}.</li>
                <li className="flex gap-2.5"><Check />Print at home or write on a tablet.</li>
                <li className="flex gap-2.5"><Check />Daily reminders to keep you going.</li>
              </ul>
            </div>
            <DigitalOnlyNote className="hidden border-t border-gold-light/70 pt-5 md:flex" />
          </aside>

          {/* Steps */}
          <div className="px-6 pb-8 pt-7 sm:px-10 sm:pb-10 sm:pt-10">
            <ol className="mb-7 flex items-center gap-3 text-[0.68rem] font-medium uppercase tracking-[0.2em]" aria-label="Progress">
              <li className={`flex items-center gap-2 ${done ? "text-muted" : "text-gold-dark"}`}>
                <span className={`grid h-6 w-6 place-items-center rounded-full text-[0.7rem] ${done ? "bg-gold text-white" : "border border-gold text-gold-dark"}`}>{done ? "✓" : "1"}</span>
                Your details
              </li>
              <li className="h-px flex-1 bg-gold-light" aria-hidden />
              <li className={`flex items-center gap-2 ${done ? "text-gold-dark" : "text-muted"}`}>
                <span className={`grid h-6 w-6 place-items-center rounded-full border text-[0.7rem] ${done ? "border-gold text-gold-dark" : "border-line"}`}>2</span>
                Your book
              </li>
            </ol>

            {!done ? (
              <form onSubmit={onSubmit} noValidate>
                <h2 className="text-[2.1rem] leading-[1.08] sm:text-[2.5rem]">Before you begin, can we pray for you?</h2>
                <p className="mt-3 text-ink-soft">
                  Our team prays over every request. Tell us where to send your book, and we’ll send a gentle reminder each
                  morning so you never miss a day.
                </p>

                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className={label}>First name *</span>
                    <input name="first_name" className={field} autoComplete="given-name" required />
                  </label>
                  <label className="block">
                    <span className={label}>State <span className="normal-case tracking-normal text-muted">(optional)</span></span>
                    <input name="state" className={field} autoComplete="address-level1" />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className={label}>Email *</span>
                    <input name="email" type="email" className={field} autoComplete="email" required />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className={label}>How can we pray for you? <span className="normal-case tracking-normal text-muted">(optional)</span></span>
                    <textarea name="prayer_request" rows={3} className={`${field} resize-none`} placeholder="Share as much or as little as you like." />
                  </label>
                </div>

                <div className="mt-5 space-y-3 text-sm text-ink-soft">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input type="checkbox" name="email_reminders" defaultChecked className="mt-0.5 h-4 w-4 accent-[#a5743c]" />
                    Send me a short daily reminder and encouragement by email.
                  </label>
                  <label className="flex cursor-pointer items-start gap-3">
                    <input type="checkbox" name="share_request" className="mt-0.5 h-4 w-4 accent-[#a5743c]" />
                    You may share my request (first name only) so our community can pray too.
                  </label>
                </div>

                <fieldset className="mt-6 border-t border-line pt-5">
                  <legend className="pr-3 text-sm text-ink-soft">
                    Help us write what you need next <span className="text-muted">(optional)</span>
                  </legend>
                  <div className="mt-2 grid gap-4 sm:grid-cols-3">
                    {SURVEY_FIELDS.map((k) => (
                      <label key={k} className="block">
                        <span className={label}>{SURVEY[k].label}</span>
                        <select name={k} defaultValue="" className={field}>
                          <option value="">Choose…</option>
                          {SURVEY[k].options.map((o) => <option key={o}>{o}</option>)}
                        </select>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

                {error && <p className="mt-4 border-l-2 border-[#a2452c] pl-3 text-sm text-[#a2452c]" role="alert">{error}</p>}

                <button className="btn btn-gold mt-7 w-full !py-4" disabled={sending}>
                  {sending ? "Sending…" : "Send me the free PDF"}
                </button>
                <DigitalOnlyNote className="mt-5 md:hidden" />
                <p className="mt-4 text-center text-xs text-muted">
                  We’ll never sell your information. Unsubscribe anytime. <a href="/privacy" className="underline">Privacy</a>
                </p>
              </form>
            ) : (
              <div>
                <h2 className="text-[2.1rem] leading-[1.08] sm:text-[2.5rem]">Welcome, {name || signedName(signed) || "friend"}.</h2>
                <p className="mt-3 text-ink-soft">Your digital copy is ready. We’re so glad you’re here.</p>

                <a href={pdfUrl} download className="btn btn-gold mt-7 w-full !py-4">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 20h14" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  Download PDF{pages ? ` · ${pages} pages` : ""}
                </a>
                <p className="mt-2 text-center text-xs text-muted">Digital file only. Nothing will be mailed to you.</p>

                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <div className="border border-line bg-white p-5">
                    <p className="eyebrow !text-[0.65rem]">Walk together</p>
                    <p className="mt-2 font-serif text-xl leading-snug">Join our free community</p>
                    <p className="mt-1 text-sm text-muted">Share prayer requests and encourage each other.</p>
                    <a href={communityUrl} target="_blank" rel="noopener" className="btn btn-line mt-4 w-full !py-2.5">Join free</a>
                  </div>
                  <div className="border border-line bg-white p-5">
                    <p className="eyebrow !text-[0.65rem]">Never miss a day</p>
                    <p className="mt-2 font-serif text-xl leading-snug">Add a daily reminder</p>
                    <p className="mt-1 text-sm text-muted">A 21-day alarm in your phone calendar.</p>
                    <div className="mt-4 flex gap-2">
                      <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="field !w-auto min-w-0 flex-1 !py-2" aria-label="Reminder time" />
                      <button className="btn btn-line !px-4 !py-2.5" onClick={() => downloadIcs(title, time, pdfUrl)}>Add</button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-linen p-5">
                  <p className="mb-4 text-sm text-ink-soft">
                    <b className="font-medium text-ink">Free, always.</b> If this book blesses you, a small gift helps us give it to the next person.
                  </p>
                  <DonateOptions options={[donate]} compact />
                </div>
              </div>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
