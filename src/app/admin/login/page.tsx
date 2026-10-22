import type { Metadata } from "next";
import { adminConfigured, totpEnabled } from "@/lib/admin-auth";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default function AdminLogin() {
  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <p className="eyebrow">Elonai admin</p>
      <h1 className="mt-3 text-5xl">Sign in</h1>
      {adminConfigured() ? (
        <LoginForm withCode={totpEnabled()} />
      ) : (
        <p className="mt-6 border-l-2 border-gold pl-4 text-ink-soft">
          The admin area is not set up yet. In the <code>web</code> folder run <code>npm run admin:setup</code> and follow the steps.
        </p>
      )}
    </div>
  );
}
