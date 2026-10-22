"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import DailyWordCard from "./DailyWordCard";
import { dateLabel, shareWord, todayKey, wordFor, type DailyWord } from "@/lib/daily";

const SEEN_KEY = "elonai_word_seen";

// Greets each visitor with the day's word the first time they open the site that day.
export default function DailyWordPopup({ siteUrl }: { siteUrl: string }) {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const [today, setToday] = useState<{ key: string; word: DailyWord } | null>(null);
  const [shareMsg, setShareMsg] = useState("");

  useEffect(() => {
    if (pathname === "/today" || pathname.startsWith("/admin")) return;
    const timer = setTimeout(() => {
      const key = todayKey();
      let seen: string | null = null;
      try {
        seen = localStorage.getItem(SEEN_KEY);
      } catch {}
      if (seen === key || window.location.hash === "#get" || document.querySelector("dialog[open]")) return;
      setToday({ key, word: wordFor(key) });
      dialog.current?.showModal();
      try {
        localStorage.setItem(SEEN_KEY, key);
      } catch {}
    }, 1400);
    return () => clearTimeout(timer);
  }, [pathname]);

  async function onShare() {
    if (!today) return;
    const r = await shareWord(today.word, `${siteUrl}/today`);
    if (r === "copied") setShareMsg("Link copied. Paste it anywhere to share.");
  }

  return (
    <dialog
      ref={dialog}
      className="modal w-[min(640px,calc(100vw-24px))]"
      aria-label="Today’s Word"
      onClick={(e) => e.target === dialog.current && dialog.current?.close()}
    >
      {today && (
        <>
          <button onClick={() => dialog.current?.close()} className="modal-close !text-white" aria-label="Close">×</button>
          <DailyWordCard word={today.word} date={dateLabel(today.key)}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button className="btn btn-gold flex-1" onClick={() => dialog.current?.close()} autoFocus>Amen</button>
              <button className="btn btn-line flex-1" onClick={onShare}>Share this word</button>
            </div>
            {shareMsg && <p className="mt-3 text-center text-sm text-sage">{shareMsg}</p>}
            <p className="mt-5 text-center text-sm text-muted">
              A new word every morning ·{" "}
              <Link href="/today" onClick={() => dialog.current?.close()} className="text-gold-dark underline underline-offset-2">
                open today’s page
              </Link>
            </p>
          </DailyWordCard>
        </>
      )}
    </dialog>
  );
}
