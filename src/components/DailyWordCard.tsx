import Image from "next/image";
import type { DailyWord } from "@/lib/daily";

export default function DailyWordCard({ word, date, label = "Today’s Word", children }: { word: DailyWord; date: string; label?: string; children?: React.ReactNode }) {
  return (
    <article>
      <div className="relative h-36 overflow-hidden sm:h-44">
        <Image src="/images/daily-word.jpg" alt="" fill loading="eager" sizes="(max-width: 640px) 100vw, 640px" className="object-cover object-[50%_65%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-night/75 via-night/25 to-transparent" />
        <div className="absolute bottom-5 left-6 right-6 sm:left-10">
          <p className="eyebrow !text-gold-light">{label}</p>
          <p className="mt-1 font-serif text-lg italic text-white/90">{date}</p>
        </div>
      </div>

      <div className="px-6 pb-8 pt-8 sm:px-10">
        <blockquote className="text-center">
          <p className="font-serif text-[1.7rem] italic leading-snug text-ink sm:text-[2rem]">“{word.verse}”</p>
          <footer className="eyebrow mt-4">{word.ref} · KJV</footer>
        </blockquote>

        <div className="ornament my-7 text-xs">✦</div>

        <h2 className="text-3xl leading-tight sm:text-[2.2rem]">{word.title}</h2>
        <div className="mt-3 space-y-3 text-[1.05rem] leading-relaxed text-ink-soft">
          {word.message.map((p) => <p key={p}>{p}</p>)}
        </div>

        <div className="mt-6 border-l-2 border-gold bg-linen px-5 py-4">
          <p className="eyebrow !text-[0.65rem]">Pray</p>
          <p className="mt-1 font-serif text-lg italic leading-snug">{word.prayer}</p>
        </div>

        {children}
      </div>
    </article>
  );
}
