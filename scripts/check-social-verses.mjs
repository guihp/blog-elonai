// Checks every Bible quotation in src/content/social.ts against the KJV (same rules as src/lib/kjv.ts).
// Run: node scripts/check-social-verses.mjs
import fs from "node:fs";

const src = fs.readFileSync("src/content/social.ts", "utf8");
const words = (t) =>
  t.replace(/[’‘]/g, "'").toLowerCase().replace(/'s /g, "s ").replace(/[^a-z0-9' ]+/g, " ").split(/\s+/).filter(Boolean).join(" ");

const pairs = [];
for (const m of src.matchAll(/ref: "([^"]+)",\s*verse: "([^"]+)"/g)) pairs.push([m[1], m[2]]);
// Quotes inside pin descriptions, like “…” (Psalm 46:1 KJV)
for (const m of src.matchAll(/“([^”]{8,})” \(([^()]+?) KJV\)/g)) pairs.push([m[2], m[1]]);

let bad = 0;
for (const [ref, quote] of pairs) {
  let kjv = "";
  for (let tries = 0; tries < 4 && !kjv; tries++) {
    const res = await fetch(`https://bible-api.com/${encodeURIComponent(ref.replace(/[–—]/g, "-"))}?translation=kjv`);
    if (res.ok) kjv = (await res.json()).text.replace(/\s+/g, " ");
    else await new Promise((r) => setTimeout(r, 5000)); // the free API rate-limits bursts
  }
  const ok = kjv && quote.replace(/\.\.\./g, "…").split("…").every((part) => words(kjv).includes(words(part)));
  if (!ok) {
    bad++;
    console.log(`✗ ${ref}\n  quote: ${quote}\n  kjv:   ${kjv || "(not found)"}`);
  }
  await new Promise((r) => setTimeout(r, 1500));
}
console.log(`${pairs.length - bad}/${pairs.length} quotations match the KJV`);
process.exit(bad ? 1 : 0);
