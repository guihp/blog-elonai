"use client";

import { useActionState } from "react";
import type { DailyWord } from "@/lib/daily";
import { saveWord, type WordState } from "./actions";

const label = "mb-1.5 block text-[0.68rem] font-medium uppercase tracking-[0.16em] text-muted";

export default function WordEditor({ word, original, notice }: { word?: DailyWord; original: string; notice: string }) {
  const [state, action, pending] = useActionState<WordState, FormData>(saveWord, { ok: true, message: notice });

  return (
    <form action={action} className="mt-8 space-y-5">
      <input type="hidden" name="original" value={original} />
      <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
        <label className="block">
          <span className={label}>Referência</span>
          <input name="ref" required defaultValue={word?.ref} placeholder="Psalm 46:10" className="field !bg-white" />
        </label>
        <label className="block">
          <span className={label}>Título</span>
          <input name="title" required maxLength={90} defaultValue={word?.title} className="field !bg-white" />
        </label>
      </div>
      <label className="block">
        <span className={label}>Versículo (KJV, palavra por palavra)</span>
        <textarea name="verse" required rows={3} defaultValue={word?.verse} className="field resize-y !bg-white" />
      </label>
      <label className="block">
        <span className={label}>Mensagem (1 a 3 parágrafos, separe com uma linha em branco)</span>
        <textarea name="message" required rows={8} defaultValue={word?.message.join("\n\n")} className="field resize-y !bg-white" />
      </label>
      <label className="block">
        <span className={label}>Oração</span>
        <textarea name="prayer" required rows={3} defaultValue={word?.prayer} className="field resize-y !bg-white" />
      </label>

      {state.kjv && (
        <div className="border-l-2 border-gold bg-linen p-4 text-sm">
          <p className="eyebrow !text-[0.62rem]">Texto da KJV</p>
          <p className="mt-1 font-serif text-lg italic">{state.kjv}</p>
        </div>
      )}
      {!state.ok && (
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" name="force" className="h-4 w-4 accent-[#a5743c]" /> Salvar mesmo assim
        </label>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button disabled={pending} className="btn btn-ink">{pending ? "Conferindo e salvando…" : "Salvar"}</button>
        {state.message && <p aria-live="polite" className={`text-sm ${state.ok ? "text-sage" : "text-red-700"}`}>{state.message}</p>}
      </div>
      <p className="text-xs text-muted">Ao salvar, o versículo é conferido automaticamente com a King James Version.</p>
    </form>
  );
}
