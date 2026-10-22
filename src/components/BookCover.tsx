import Image from "next/image";
import { coverSrc } from "@/lib/content";

// A printed-book look: soft spine shading, page edge and a grounded shadow.
export default function BookCover({
  slug,
  title,
  sizes = "(max-width: 768px) 70vw, 30vw",
  preload = false,
  className = "",
}: {
  slug: string;
  title: string;
  sizes?: string;
  preload?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative aspect-[8.5/11] overflow-hidden rounded-r-[3px] shadow-[0_1px_1px_rgba(0,0,0,.08),0_12px_24px_-6px_rgba(60,40,20,.25),0_40px_60px_-20px_rgba(60,40,20,.35)]">
        <Image src={coverSrc(slug)} alt={`${title} book cover`} fill sizes={sizes} className="object-cover" preload={preload} />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[7%] bg-gradient-to-r from-black/25 via-white/10 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 left-[7%] w-px bg-white/30" />
      </div>
    </div>
  );
}
