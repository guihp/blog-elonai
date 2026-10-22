"use client";

import { useState } from "react";

// A labelled piece of text with a copy button, for pasting into ChatGPT, Facebook or Pinterest.
export default function CopyBlock({ label, text, small }: { label: string; text: string; small?: boolean }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <div className="border border-line bg-paper">
      <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-1.5">
        <span className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted">{label}</span>
        <button type="button" onClick={copy} className={`px-2.5 py-1 text-xs ${copied ? "bg-sage text-white" : "bg-ink text-paper hover:opacity-90"}`}>
          {copied ? "Copiado ✓" : "Copiar"}
        </button>
      </div>
      <p className={`whitespace-pre-wrap break-words px-3 py-2.5 text-ink ${small ? "max-h-40 overflow-y-auto text-xs" : "text-sm"}`}>{text}</p>
    </div>
  );
}
