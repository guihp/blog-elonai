"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm({ withCode }: { withCode: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: f.get("password"), code: f.get("code") ?? "" }),
    }).catch(() => null);
    if (res?.ok) return router.replace("/admin");
    setError((await res?.json().catch(() => null))?.error ?? "Something went wrong. Try again.");
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      <label className="block">
        <span className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.18em] text-ink-soft">Password</span>
        <input name="password" type="password" autoComplete="current-password" required className="field" />
      </label>
      {withCode && (
        <label className="block">
          <span className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.18em] text-ink-soft">6-digit code from your authenticator app</span>
          <input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" required className="field tracking-[0.4em]" />
        </label>
      )}
      {error && <p className="border-l-2 border-[#a2452c] pl-3 text-sm text-[#a2452c]" role="alert">{error}</p>}
      <button className="btn btn-ink w-full" disabled={busy}>{busy ? "Checking…" : "Sign in"}</button>
    </form>
  );
}
