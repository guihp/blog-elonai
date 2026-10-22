import { books, getPosts } from "./content";
import { wordSlug } from "./daily";
import { getDailyWords } from "./daily-words";

export type Result = { href: string; kind: string; title: string; snippet: string; score: number };

// Lowercase, no accents, straight quotes, so "you’re" matches "youre" and "you're".
const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[’‘]/g, "'").replace(/[“”]/g, '"');
const plain = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim();

function snippet(text: string, terms: string[]) {
  const n = norm(text);
  const at = Math.min(...terms.map((t) => n.indexOf(t)).filter((i) => i >= 0), n.length);
  const start = Math.max(0, at - 70);
  return (start > 0 ? "…" : "") + text.slice(start, start + 200).trim() + (start + 200 < text.length ? "…" : "");
}

// Words that appear almost everywhere and would match every page.
const STOP = new Set(["a", "an", "and", "are", "be", "do", "for", "how", "i", "in", "is", "it", "me", "my", "of", "on", "the", "to", "what", "when", "you", "your"]);

export async function search(query: string): Promise<Result[]> {
  const words = norm(query).split(/[^a-z0-9']+/).filter((t) => t.length > 1);
  const meaningful = words.filter((t) => !STOP.has(t));
  const terms = (meaningful.length ? meaningful : words).slice(0, 8);
  if (!terms.length) return [];

  const docs = [
    ...(await getPosts()).map((p) => ({ href: `/blog/${p.slug}`, kind: "Blog", title: p.title, lead: `${p.excerpt} ${p.category}`, body: plain(p.html), boost: 3 })),
    ...books.map((b) => ({
      href: `/books/${b.slug}`,
      kind: b.status === "free" ? "Free devotional" : "Coming soon",
      title: `${b.title}: ${b.subtitle}`,
      lead: `${b.short} ${b.topic}`,
      body: [b.description, b.inside, b.weeks?.map((w) => w.desc)].flat(2).filter(Boolean).join(" "),
      boost: 4,
    })),
    ...(await getDailyWords()).map((w) => ({ href: `/today/${wordSlug(w)}`, kind: `Daily word · ${w.ref}`, title: w.title, lead: `${w.ref} ${w.verse}`, body: `${w.message.join(" ")} ${w.prayer}`, boost: 1 })),
  ];

  return docs
    .map((d) => {
      const [title, lead, body] = [norm(d.title), norm(d.lead), norm(d.body)];
      let score = 0;
      for (const t of terms) {
        const hit = (title.includes(t) ? 6 : 0) + (lead.includes(t) ? 3 : 0) + (body.includes(t) ? 1 : 0);
        if (!hit) return null; // every word must appear somewhere
        score += hit;
      }
      const text = norm(d.lead).includes(terms[0]) ? d.lead : d.body;
      return { href: d.href, kind: d.kind, title: d.title, snippet: snippet(text, terms), score: score + d.boost };
    })
    .filter((r): r is Result => r !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 30);
}
