"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import DailyWordCard from "@/components/DailyWordCard";
import { dateLabel, fetchWord, shareWord, todayKey, wordSlug, type DailyWord } from "@/lib/daily";

const noop = () => () => {};

export default function TodayWord({ siteUrl }: { siteUrl: string }) {
  // The date only exists in the browser (each visitor's own timezone), so the server renders a placeholder.
  const key = useSyncExternalStore(noop, todayKey, () => null);
  const [msg, setMsg] = useState("");
  const [word, setWord] = useState<DailyWord | null>(null);

  useEffect(() => {
    if (key) fetchWord(key).then(setWord);
  }, [key]);

  if (!key || !word) return <div className="h-[720px] animate-pulse bg-linen" />;

  return (
    <div className="bg-white shadow-[0_30px_60px_-30px_rgba(60,40,20,.35)]">
      <DailyWordCard word={word} date={dateLabel(key)}>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            className="btn btn-gold flex-1"
            onClick={async () => (await shareWord(word, `${siteUrl}/today/${wordSlug(word)}`)) === "copied" && setMsg("Link copied. Paste it anywhere to share.")}
          >
            Share this word
          </button>
        </div>
        {msg && <p className="mt-3 text-center text-sm text-sage">{msg}</p>}
      </DailyWordCard>
    </div>
  );
}
