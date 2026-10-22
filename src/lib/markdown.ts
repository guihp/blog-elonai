import { Marked } from "marked";

// Markdown for posts written in the admin panel. Raw HTML is shown as text and links/images only accept
// http(s), mailto and site-relative URLs, so a post can never carry a script onto the site.
// Runs on the server (published pages) and in the browser (the editor preview).

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const safeUrl = (href: string) => (/^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(href.trim()) ? href.trim() : null);

const md = new Marked({
  gfm: true,
  renderer: {
    html({ text }) {
      return esc(text);
    },
    link({ href, title, tokens }) {
      const url = safeUrl(href);
      const inner = this.parser.parseInline(tokens);
      if (!url) return inner;
      const external = /^https?:\/\//i.test(url);
      return `<a href="${esc(url)}"${title ? ` title="${esc(title)}"` : ""}${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${inner}</a>`;
    },
    image({ href, title, text }) {
      const url = safeUrl(href);
      return url ? `<img src="${esc(url)}" alt="${esc(text)}"${title ? ` title="${esc(title)}"` : ""} loading="lazy">` : esc(text);
    },
  },
});

export const renderMarkdown = (source: string) => md.parse(source, { async: false }) as string;
