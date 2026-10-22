import { displayUrl, type DonationMethod } from "@/lib/donation";

export type DonateOption = DonationMethod & { qr: string };

// Phone first: a big tap target and the written link. The QR code is for people reading on a computer.
export default function DonateOptions({ options, compact = false }: { options: DonateOption[]; compact?: boolean }) {
  return (
    <div className="space-y-4">
      {options.map((o) => (
        <div key={o.url} className={`flex items-center gap-6 ${compact ? "" : "border border-gold-light bg-white p-5 sm:p-6"}`}>
          <div className="min-w-0 flex-1">
            <a href={o.url} target="_blank" rel="noopener noreferrer" data-track="donate" className="btn btn-gold w-full !py-4">
              <HeartIcon /> Give with {o.label}
            </a>
            <p className="mt-2.5 text-center text-xs text-muted">
              {o.detail}
              <br />
              <a href={o.url} target="_blank" rel="noopener noreferrer" data-track="donate" className="font-medium text-gold-dark underline underline-offset-2">
                {displayUrl(o.url)}
              </a>
            </p>
          </div>
          <div className="hidden shrink-0 text-center md:block">
            <div className="mx-auto h-24 w-24 [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: o.qr }} />
            <p className="mt-1 text-[0.62rem] uppercase tracking-[0.16em] text-muted">Scan with phone</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 20s-7-4.4-9.2-8.6C1.2 8.3 3 5 6.3 5c2 0 3.3 1.1 3.9 2.2.3.5.5.5.8.5s.5 0 .8-.5C12.4 6.1 13.7 5 15.7 5 19 5 20.8 8.3 19.2 11.4 17 15.6 12 20 12 20z" strokeLinejoin="round" />
    </svg>
  );
}
