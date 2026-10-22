import Link from "next/link";

const LINKS = [
  { href: "/admin", label: "Visitas" },
  { href: "/admin/subscribers", label: "Inscritos" },
  { href: "/admin/prayers", label: "Pedidos de oração" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/words", label: "Palavras diárias" },
  { href: "/admin/social", label: "Divulgação" },
  { href: "/admin/settings", label: "Configurações" },
];

// Title row shared by every admin page.
export default function AdminNav({ current, title, children }: { current: string; title: string; children?: React.ReactNode }) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <nav className="flex flex-wrap gap-1 text-sm" aria-label="Painel">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={l.href === current ? "page" : undefined}
              className={`px-3 py-1.5 ${l.href === current ? "bg-ink text-paper" : "text-ink-soft hover:bg-linen"}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <form action="/api/admin/logout" method="post">
          <button className="border border-line bg-white px-3 py-1.5 text-sm hover:bg-linen">Sair</button>
        </form>
      </div>
      <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Painel Elonai</p>
          <h1 className="mt-2 text-5xl">{title}</h1>
        </div>
        {children}
      </div>
    </div>
  );
}
