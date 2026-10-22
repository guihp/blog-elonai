"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { send, session } from "@/lib/track";

// Sends one beacon per page view, plus clicks on PDF downloads, giving links and the community link,
// and one "read" beacon when the reader leaves a page (how far they scrolled and how long they stayed).

let lastView = ""; // React may run effects twice in development; count each page once

// How far down the reader got, in %. Pages can mark their main text with data-read (blog posts do) so the
// footer and "keep reading" cards don't count as unread article.
function scrollDepth() {
  const el = document.querySelector<HTMLElement>("[data-read]") ?? document.documentElement;
  const rect = el.getBoundingClientRect();
  const seen = window.innerHeight - rect.top;
  return Math.max(0, Math.min(100, Math.round((seen / Math.max(1, rect.height)) * 100)));
}

export default function Analytics({ communityUrl }: { communityUrl: string }) {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin") || lastView === pathname) return;
    lastView = pathname;
    const s = session();
    const q = new URLSearchParams(location.search);
    send({
      kind: "view",
      path: pathname,
      session: s.id,
      // where they came from only matters on the first page of a visit
      referrer: s.first ? document.referrer || null : null,
      utm_source: s.first ? q.get("utm_source") ?? q.get("ref") : null,
      utm_campaign: s.first ? q.get("utm_campaign") : null,
    });
  }, [pathname]);

  // Reading: only time with the tab visible counts. Sent once, when the tab is hidden/closed or the route changes.
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    let depth = 0;
    let active = 0;
    let since = document.visibilityState === "visible" ? Date.now() : 0;
    let sent = false;
    const onScroll = () => (depth = Math.max(depth, scrollDepth()));
    const flush = () => {
      if (sent) return;
      if (since) active += Date.now() - since;
      since = 0;
      const seconds = Math.round(active / 1000);
      if (seconds < 1) return;
      sent = true;
      send({ kind: "read", path: pathname, depth: Math.max(depth, scrollDepth()), seconds: Math.min(seconds, 3600), session: session().id });
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
      else if (!sent) since = Date.now();
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      flush();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, [pathname]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const a = (e.target as Element).closest?.("a");
      if (!a || location.pathname.startsWith("/admin")) return;
      const href = a.getAttribute("href") ?? "";
      const kind = a.dataset.track ?? (href.endsWith(".pdf") ? "download" : href === communityUrl ? "community" : null);
      if (kind) send({ kind, path: location.pathname, target: href, session: session().id });
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [communityUrl]);

  return null;
}
