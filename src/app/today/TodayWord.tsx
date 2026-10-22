"use client";

import { useState, useSyncExternalStore } from "react";
import DailyWordCard from "@/components/DailyWordCard";
import { dateLabel, shareWord, todayKey, wordFor } from "@/lib/daily";

const noop = () => () => {};

export default function TodayWord({ siteUrl }: { siteUrl: string }) {
  // The date only exists in the browser (each visitor's own timezone), so the server renders a placeholder.
  const key = useSyncExternalStore(noop, todayKey, () => null);
  const [msg, setMsg] = useState("");

  if (!key) return <div className="h-[720px] animate-pulse bg-linen" />;
  const word = wordFor(key);

  return (
    <div className="bg-white shadow-[0_30px_60px_-30px_rgba(60,40,20,.35)]">
      <DailyWordCard word={word} date={dateLabel(key)}>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            className="btn btn-gold flex-1"
            onClick={async () => (await shareWord(word, `${siteUrl}/today`)) === "copied" && setMsg("Link copied. Paste it anywhere to share.")}
          >
            Share this word
          </button>
        </div>
        {msg && <p className="mt-3 text-center text-sm text-sage">{msg}</p>}
      </DailyWordCard>
    </div>
  );
}
