"use client";

import { useState } from "react";
import { shareWord, type DailyWord } from "@/lib/daily";

export default function ShareWord({ word, url }: { word: DailyWord; url: string }) {
  const [msg, setMsg] = useState("");
  return (
    <>
      <button
        className="btn btn-gold mt-8 w-full"
        onClick={async () => (await shareWord(word, url)) === "copied" && setMsg("Link copied. Paste it anywhere to share.")}
      >
        Share this word
      </button>
      {msg && <p className="mt-3 text-center text-sm text-sage">{msg}</p>}
    </>
  );
}
