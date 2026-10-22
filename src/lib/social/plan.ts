// The daily posting plan shown in /admin/social: what to post, where, when (US Eastern time) and why.
// Pure functions: the same date always gives the same plan, so the owner can prepare a whole week ahead.

import {
  BOARDS, BOOK_LINES, DEFAULT_SCENES, EVENING_CLOSERS, EVENING_INTROS, FRIDAY_REFLECTIONS, GROUP_DAYS, HOLIDAYS,
  PRAYER_INVITES, QUESTIONS, SCENES, SUNDAY_NOTES, type HolidayCopy,
} from "@/content/social";
import { wordFor, wordSlug, type DailyWord } from "@/lib/daily";
import { dayNumber, holidayOn, shiftKey, upcomingHolidays, weekday, weekNumber } from "./calendar";

export type Platform = "page" | "group" | "pinterest";

export type SocialItem = {
  key: string; // "2026-10-23:page-am", used for the "posted" mark
  platform: Platform;
  time: string; // New York time, "07:30"
  label: string; // Portuguese, for the owner
  format: "image" | "text" | "pin";
  why: string; // Portuguese strategy note
  text?: string;
  firstComment?: string;
  imagePrompt?: string;
  siteImage?: string; // an image already on the site that can be used instead of generating one
  instagram?: string;
  pin?: { title: string; description: string; link: string; board: string };
};

export type PlanInput = {
  site: string;
  words: DailyWord[];
  posts: { slug: string; title: string; excerpt: string; category: string; image: string }[];
  books: { slug: string; title: string; subtitle: string; short: string }[];
};

const HASHTAGS = "#BibleVerse #DailyDevotional #ChristianWomen #KJV #Faith";
const LONG_VERSE = 190; // longer verses go in the caption; the image shows the title and reference

const clip = (s: string, max: number) => (s.length <= max ? s : `${s.slice(0, max - 1).replace(/\s+\S*$/, "")}…`);
const fill = (s: string, vars: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

function scene(text: string, turn: number) {
  const t = text.toLowerCase();
  return SCENES.find((s) => s.words.some((w) => t.includes(w)))?.scene ?? DEFAULT_SCENES[turn % DEFAULT_SCENES.length];
}

function prompt(o: { pinterest?: boolean; scene: string; main: string; sub?: string }) {
  const size = o.pinterest
    ? "a vertical Pinterest pin image, 2:3 ratio (1000 × 1500 px)"
    : "a portrait image for Facebook and Instagram, 4:5 ratio (1080 × 1350 px)";
  return [
    `Create ${size}.`,
    "",
    `Background: ${o.scene}. Photographic, soft natural light, warm cream, linen and muted gold tones, calm and uncluttered. No faces.`,
    "",
    "Text on the image, centered, in an elegant serif font, large enough to read on a phone, on a soft light area so it stays readable:",
    o.main,
    ...(o.sub ? [`Below it, smaller: ${o.sub}`] : []),
    "At the very bottom, small and subtle: elonai",
    "",
    "Use exactly these words, spelled exactly as written. Do not add any other text, logos or watermarks.",
  ].join("\n");
}

function verseImage(word: DailyWord, turn: number, pinterest = false) {
  const long = word.verse.length > LONG_VERSE;
  return prompt({
    pinterest,
    scene: scene(word.verse, turn),
    main: long ? word.title : `“${word.verse}”`,
    sub: `${word.ref} (KJV)`,
  });
}

function board(text: string) {
  const t = text.toLowerCase();
  if (/anx|fear|afraid|worry|peace|sleep|still|rest|trouble/.test(t)) return BOARDS[1].name;
  if (/grief|loss|mourn|broken/.test(t)) return BOARDS[4].name;
  if (/journal/.test(t)) return BOARDS[6].name;
  if (/pray/.test(t)) return BOARDS[2].name;
  return BOARDS[0].name;
}

export function planDay(date: string, input: PlanInput): SocialItem[] {
  const { site, words, posts, books } = input;
  const link = (path: string, source: string, campaign: string) => `${site}${path}?utm_source=${source}&utm_campaign=${campaign}`;
  const n = dayNumber(date);
  const wk = weekNumber(date);
  const wd = weekday(date);
  const word = wordFor(words, date);
  const slug = wordSlug(word);
  const holidayKey = holidayOn(date);
  const holiday = holidayKey ? HOLIDAYS[holidayKey] : undefined;
  const question = QUESTIONS[n % QUESTIONS.length];
  const book = (i: number) => books[((i % books.length) + books.length) % books.length];
  const post = (i: number) => posts[((i % posts.length) + posts.length) % posts.length];
  const items: SocialItem[] = [];

  // Facebook Page, morning: the word of the day (the same one the site shows today).
  const imageMorning = wd % 2 === 0;
  items.push({
    key: `${date}:page-am`,
    platform: "page",
    time: "07:30",
    label: "Versículo da manhã",
    format: imageMorning ? "image" : "text",
    why: imageMorning
      ? "Imagem com versículo é o post mais compartilhado. Publique também no Instagram (no Business Suite marque as duas contas)."
      : "Só texto, sem link: no Facebook, versículo com uma pergunta costuma alcançar bem e gera comentários.",
    text: imageMorning
      ? `${word.title}\n\n${word.verse.length > LONG_VERSE ? `“${word.verse}” (${word.ref})\n\n` : ""}${word.message.at(-1)}\n\n${question}`
      : `“${word.verse}” (${word.ref})\n\n${word.message[0]}\n\n${question}`,
    imagePrompt: imageMorning ? verseImage(word, n) : undefined,
    instagram: imageMorning ? `${word.title}\n\n“${word.verse}” (${word.ref})\n\n${question}\n\nLink in bio for today’s devotional.\n\n${HASHTAGS}` : undefined,
    firstComment: `Today’s devotional and prayer: ${link(`/today/${slug}`, "facebook", "fb-verse")}`,
  });

  // Facebook Page, midday: rotates through the week; a holiday takes this slot.
  items.push(holiday ? holidayPost(holiday) : middayPost());

  // Facebook Page, evening: the prayer of the day.
  items.push({
    key: `${date}:page-pm`,
    platform: "page",
    time: "20:00",
    label: "Oração da noite",
    format: "text",
    why: "Fecha o dia com a oração da palavra de hoje e convida a mandar mensagem. A resposta automática do Messenger envia os links.",
    text: `${EVENING_INTROS[n % EVENING_INTROS.length]}\n\n${word.prayer} Amen.\n\n${EVENING_CLOSERS[(n + 1) % EVENING_CLOSERS.length]}`,
  });

  // Own group: one post a day, same rhythm as the /community page.
  const monday = wordFor(words, shiftKey(date, wd === 0 ? -6 : 1 - wd));
  const monthBook = book(Number(date.slice(0, 4)) * 12 + Number(date.slice(5, 7)));
  const day = GROUP_DAYS[wd];
  items.push({
    key: `${date}:group`,
    platform: "group",
    time: "10:00",
    label: holiday ? `Grupo: ${holiday.pt}` : `Grupo: ${day.title}`,
    format: "text",
    why: "Agende dentro do próprio grupo (ícone de calendário ao criar o post). Perguntas simples fazem os membros conversarem entre si.",
    text: holiday ? holiday.group : fill(day.variants[wk % day.variants.length], { verse: monday.verse, ref: monday.ref, book: monthBook.title }),
    firstComment: holiday
      ? undefined
      : wd === 4
        ? `Free PDF: ${link(`/books/${monthBook.slug}`, "facebook-group", "group-reading")}`
        : wd === 0 && posts.length
          ? `This week’s article: ${link(`/blog/${post(wk).slug}`, "facebook-group", "group-sunday")}`
          : undefined,
  });

  // Pinterest: 3 fresh pins in the evening, when US pinners are most active.
  items.push({
    key: `${date}:pin-word`,
    platform: "pinterest",
    time: "21:00",
    label: "Pin do versículo de hoje",
    format: "pin",
    why: "Imagem vertical 2:3. O link leva para a página da palavra de hoje, que fica no site para sempre.",
    imagePrompt: verseImage(word, n + 1, true),
    pin: {
      title: clip(`${word.ref} Bible Verse: ${word.title}`, 100),
      description: clip(`“${word.verse}” (${word.ref} KJV). ${word.message[0]}`, 420) + " #BibleVerse #DailyBibleVerse #ChristianWomen",
      link: link(`/today/${slug}`, "pinterest", "pin-word"),
      board: board(`${word.verse} ${word.title}`),
    },
  });

  if (posts.length) {
    const p = post(n);
    const round = Math.floor(n / posts.length) % 3;
    const title = [p.title, `${p.category}: ${p.title}`, `${p.title} | Elonai`][round];
    items.push({
      key: `${date}:pin-blog`,
      platform: "pinterest",
      time: "21:30",
      label: "Pin de artigo do blog",
      format: "pin",
      why: "O Pinterest valoriza pins novos: o mesmo artigo volta em outros dias com outra imagem e outro título.",
      imagePrompt: prompt({ pinterest: true, scene: scene(`${p.title} ${p.category}`, n + round), main: p.title.replace(/\s*\(.*\)\s*$/, ""), sub: p.category }),
      siteImage: p.image.startsWith("https://") ? p.image : `${site}/images/${p.image}.jpg`,
      pin: {
        title: clip(title, 100),
        description: clip(`${p.excerpt} Read the full article on Elonai.`, 440) + " #ChristianWomen #BibleStudy #Faith",
        link: link(`/blog/${p.slug}`, "pinterest", "pin-blog"),
        board: board(`${p.category} ${p.title}`),
      },
    });
  }

  items.push(thirdPin());
  return items;

  function holidayPost(h: HolidayCopy): SocialItem {
    const long = h.verse.length > LONG_VERSE;
    return {
      key: `${date}:page-noon`,
      platform: "page",
      time: "12:30",
      label: `Data especial: ${h.pt}`,
      format: "image",
      why: h.tip,
      text: `${h.caption}\n\n“${h.verse}” (${h.ref})`,
      imagePrompt: prompt({ scene: h.scene, main: long ? h.name : `“${h.verse}”`, sub: `${h.ref} (KJV)` }),
      instagram: `${h.caption}\n\n“${h.verse}” (${h.ref})\n\n${HASHTAGS}`,
      firstComment: h.book ? `Free devotional: ${link(`/books/${h.book}`, "facebook", `fb-${holidayKey}`)}` : undefined,
    };
  }

  function middayPost(): SocialItem {
    const base = { key: `${date}:page-noon`, platform: "page" as const, time: "12:30" };
    if (wd === 2) {
      return { ...base, label: "Convite para pedido de oração", format: "text", text: PRAYER_INVITES[wk % PRAYER_INVITES.length],
        why: "Gera mensagens no Messenger: a resposta automática agradece e manda os links. Responda pessoalmente depois." };
    }
    if (wd === 5) {
      return { ...base, label: "Reflexão de sexta", format: "text", text: FRIDAY_REFLECTIONS[wk % FRIDAY_REFLECTIONS.length],
        why: "Pergunta aberta no fim da semana: gera comentários, o que aumenta o alcance dos próximos posts." };
    }
    if (wd === 0 || !posts.length) {
      return { ...base, label: "Domingo", format: "text", text: SUNDAY_NOTES[wk % SUNDAY_NOTES.length],
        why: "Domingo é dia de post leve, sem link e sem pedir nada." };
    }
    if (wd === 3) {
      const b = book(wk);
      return {
        ...base,
        label: `Livro grátis: ${b.title}`,
        format: "image",
        why: "Uma vez por semana, um livro grátis. A capa já está pronta no site. Link no 1º comentário, nunca no texto.",
        text: fill(BOOK_LINES[wk % BOOK_LINES.length], { title: b.title, subtitle: b.subtitle, short: b.short }),
        siteImage: `${site}/books/${b.slug}/cover.jpg`,
        imagePrompt: prompt({ scene: "a cozy morning scene with a printed devotional booklet, a cup of coffee and a pen on a linen bedspread", main: `Free 21-day devotional: ${b.title}`, sub: b.subtitle }),
        instagram: `${fill(BOOK_LINES[0], { title: b.title, subtitle: b.subtitle, short: b.short }).replace("The link is in the first comment.", "Link in bio.")}\n\n${HASHTAGS}`,
        firstComment: `Download ${b.title} for free: ${link(`/books/${b.slug}`, "facebook", "fb-book")}`,
      };
    }
    const p = post(wk * 3 + (wd === 1 ? 0 : wd === 4 ? 1 : 2));
    return {
      ...base,
      label: "Artigo do blog",
      format: "image",
      why: "Link no 1º comentário: o Facebook mostra menos posts com link no texto e está testando limite de links para páginas. Link em comentário não conta.",
      text: `${p.title}\n\n${p.excerpt}\n\nThe full article is in the first comment.`,
      imagePrompt: prompt({ scene: scene(`${p.title} ${p.category}`, wk), main: p.title.replace(/\s*\(.*\)\s*$/, ""), sub: p.category }),
      siteImage: p.image.startsWith("https://") ? p.image : `${site}/images/${p.image}.jpg`,
      firstComment: `Read it here: ${link(`/blog/${p.slug}`, "facebook", "fb-blog")}`,
    };
  }

  function thirdPin(): SocialItem {
    const base = { key: `${date}:pin-extra`, platform: "pinterest" as const, time: "22:00", format: "pin" as const };
    // Seasonal pins go up weeks ahead: people search Pinterest for holidays long before the date.
    const next = holidayKey ? { key: holidayKey, date } : upcomingHolidays(shiftKey(date, 1), 45)[0];
    if (next && (holidayKey || n % 2 === 0)) {
      const h = HOLIDAYS[next.key];
      const long = h.verse.length > LONG_VERSE;
      return {
        ...base,
        label: `Pin sazonal: ${h.pt}`,
        why: holidayKey ? "Hoje é a data." : `Faltam ${dayNumber(next.date) - n} dias. No Pinterest, conteúdo de datas comemorativas deve entrar semanas antes.`,
        imagePrompt: prompt({ pinterest: true, scene: h.scene, main: long ? h.name : `“${h.verse}”`, sub: `${h.ref} (KJV)` }),
        pin: {
          title: clip(h.pinTitle, 100),
          description: clip(h.pinDescription, 500),
          link: link(h.book ? `/books/${h.book}` : "/today", "pinterest", `pin-${next.key}`),
          board: BOARDS[5].name,
        },
      };
    }
    if (n % 4 < 2) {
      const b = book(n);
      return {
        ...base,
        label: `Pin de livro: ${b.title}`,
        why: "Pins de material grátis para baixar são dos que mais recebem cliques no Pinterest.",
        siteImage: `${site}/books/${b.slug}/cover.jpg`,
        imagePrompt: prompt({ pinterest: true, scene: "a printed devotional booklet on a linen bedspread with coffee and a small vase of flowers, top view", main: `Free 21-Day Devotional: ${b.title}`, sub: b.subtitle }),
        pin: {
          title: clip(`${b.title}: ${b.subtitle} (Free Devotional PDF)`, 100),
          description: clip(`${b.short} A free printable 21-day devotional for women. Download the PDF at no cost.`, 440) + " #FreePrintable #ChristianDevotional #BibleStudyForWomen",
          link: link(`/books/${b.slug}`, "pinterest", "pin-book"),
          board: BOARDS[3].name,
        },
      };
    }
    const older = words[(n * 7) % words.length];
    return {
      ...base,
      label: "Pin de outro versículo",
      why: "Versículos de outros dias continuam sendo buscados. Mais pins diferentes = mais portas para o site.",
      imagePrompt: verseImage(older, n + 2, true),
      pin: {
        title: clip(`${older.ref} Bible Verse: ${older.title}`, 100),
        description: clip(`“${older.verse}” (${older.ref} KJV). ${older.message[0]}`, 420) + " #BibleVerse #EncouragingVerses #ChristianWomen",
        link: link(`/today/${wordSlug(older)}`, "pinterest", "pin-word"),
        board: board(`${older.verse} ${older.title}`),
      },
    };
  }
}

export const PLATFORM_LABEL: Record<Platform, string> = {
  page: "Página do Facebook",
  group: "Seu grupo",
  pinterest: "Pinterest",
};
