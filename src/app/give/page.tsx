import type { Metadata } from "next";
import Image from "next/image";
import DonateOptions from "@/components/DonateOptions";
import { donateOptions } from "@/lib/qr";

export const metadata: Metadata = {
  title: "Give",
  description: "Every Elonai devotional is free. Your gift helps us create new resources and put them in the hands of people who need them.",
};

export default async function GivePage() {
  const options = await donateOptions();
  return (
    <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pt-14 sm:px-8 lg:grid-cols-2">
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image src="/images/give.jpg" alt="Open hands holding warm light" fill preload sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
      </div>
      <div>
        <p className="eyebrow">A gift that keeps going</p>
        <h1 className="mt-4 text-6xl leading-none sm:text-7xl">Help the next person find Him.</h1>
        <div className="mt-7 space-y-4 text-lg leading-relaxed text-ink-soft">
          <p>Every book on Elonai is given freely, because no one should have to pay to hear that God sees them. They will always stay free.</p>
          <p>If these resources have blessed you, a small gift helps us write, design and share new devotionals, and reach more people who are lying awake tonight wondering if anyone cares.</p>
        </div>
        <div className="mt-9 bg-linen p-5 sm:p-7">
          <p className="eyebrow mb-4">Any amount is a blessing · $5 · $10 · $25</p>
          <DonateOptions options={options} />
          <p className="mt-4 text-sm text-ink-soft">
            <b className="font-medium text-ink">On your phone?</b> Just tap the button. It opens a secure checkout where you can pay with
            card, Apple Pay or Google Pay. No account needed.
          </p>
        </div>
        <p className="mt-5 flex gap-3 border-l-2 border-gold pl-4 text-sm text-ink-soft">
          <span><b className="font-medium text-ink">Give safely.</b> These are our only official giving links. We will never message you
          asking for money or send a different payment link. If someone does, please don&rsquo;t pay and let us know.</span>
        </p>
        <p className="mt-8 font-serif text-xl italic text-muted">“Freely ye have received, freely give.” <span className="eyebrow not-italic !text-[0.65rem]">Matthew 10:8</span></p>
        <p className="mt-6 text-sm text-muted">
          Gifts go to Elonai Store, an independent creator, to fund free faith resources. Elonai Store is not a registered charity, so gifts are not tax-deductible.
        </p>
      </div>
    </div>
  );
}
