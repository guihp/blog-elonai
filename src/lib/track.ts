// Client-side helpers for /api/track, shared by <Analytics /> and the forms (funnel events).
export function send(data: Record<string, string | number | null>) {
  const body = JSON.stringify(data);
  if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "text/plain" }))) {
    fetch("/api/track", { method: "POST", body, keepalive: true }).catch(() => {});
  }
}

// A visit = one browser tab session, so funnel steps (book page → form → signup → download) can be linked.
export function session() {
  try {
    let id = sessionStorage.getItem("elonai_s");
    const first = !id;
    if (!id) sessionStorage.setItem("elonai_s", (id = crypto.randomUUID().slice(0, 12)));
    return { id, first };
  } catch {
    return { id: null, first: true };
  }
}

export function track(kind: "form_open" | "signup", target: string) {
  send({ kind, path: location.pathname, target, session: session().id });
}
