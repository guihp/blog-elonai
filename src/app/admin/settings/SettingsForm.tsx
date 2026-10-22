"use client";

import { useActionState } from "react";
import { saveSettings, type SaveState } from "./actions";

type Props = {
  settings: {
    donation_methods: { label: string; detail: string; url: string }[];
    community_url: string;
    contact_email: string;
    socials: Record<string, string>;
  };
  socialNames: string[];
  maxDonations: number;
  withCode: boolean;
};

const label = "mb-1.5 block text-[0.68rem] font-medium uppercase tracking-[0.16em] text-muted";

export default function SettingsForm({ settings, socialNames, maxDonations, withCode }: Props) {
  const [state, action, pending] = useActionState<SaveState, FormData>(saveSettings, { ok: true, message: "" });

  return (
    <form action={action} className="space-y-8">
      <section className="border border-line bg-white p-6">
        <h2 className="text-2xl">Doações</h2>
        <p className="mt-1 text-sm text-muted">
          A primeira aparece nos livros e no formulário de download. O QR code é gerado sozinho a partir do link, então ele
          sempre leva para o mesmo lugar que o botão.
        </p>
        <div className="mt-5 space-y-5">
          {Array.from({ length: maxDonations }, (_, i) => {
            const m = settings.donation_methods[i];
            return (
              <fieldset key={i} className="grid gap-3 border-t border-line pt-5 first:border-0 first:pt-0 md:grid-cols-[1fr_1.4fr_2fr]">
                <legend className="sr-only">Doação {i + 1}</legend>
                <label className="block">
                  <span className={label}>Nome {i + 1}</span>
                  <input name={`d${i}_label`} defaultValue={m?.label} maxLength={40} placeholder="Ko-fi" className="field !bg-white" />
                </label>
                <label className="block">
                  <span className={label}>Como pagar</span>
                  <input name={`d${i}_detail`} defaultValue={m?.detail} maxLength={80} placeholder="Card, Apple Pay or PayPal" className="field !bg-white" />
                </label>
                <label className="block">
                  <span className={label}>Link</span>
                  <input name={`d${i}_url`} type="url" defaultValue={m?.url} maxLength={300} placeholder="https://ko-fi.com/seu-nome" className="field !bg-white" />
                </label>
              </fieldset>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-muted">
          Aceita: Ko-fi, PayPal, Cash App, Venmo, Stripe, Givebutter, Buy Me a Coffee, Zeffy e Tithe.ly. Deixe a linha em
          branco para remover.
        </p>
      </section>

      <section className="border border-line bg-white p-6">
        <h2 className="text-2xl">Comunidade e contato</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className={label}>Link do grupo</span>
            <input name="community_url" type="url" required defaultValue={settings.community_url} className="field !bg-white" />
            <span className="mt-1 block text-xs text-muted">Facebook, WhatsApp, Telegram, Discord ou GroupMe.</span>
          </label>
          <label className="block">
            <span className={label}>Email de contato</span>
            <input name="contact_email" type="email" required defaultValue={settings.contact_email} className="field !bg-white" />
          </label>
        </div>
      </section>

      <section className="border border-line bg-white p-6">
        <h2 className="text-2xl">Redes sociais</h2>
        <p className="mt-1 text-sm text-muted">Aparecem no rodapé do site. Deixe em branco as que você não usa.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {socialNames.map((n) => (
            <label key={n} className="block">
              <span className={label}>{n}</span>
              <input name={`social_${n}`} type="url" defaultValue={settings.socials[n]} maxLength={300} className="field !bg-white" />
            </label>
          ))}
        </div>
      </section>

      <section className="border border-gold bg-linen p-6">
        <h2 className="text-2xl">Confirmar e salvar</h2>
        <p className="mt-1 text-sm text-ink-soft">
          {withCode
            ? "Para salvar, digite o código de 6 dígitos que está no seu app autenticador agora."
            : "Para salvar, digite a senha do painel."}
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            name="confirm"
            required
            autoComplete={withCode ? "one-time-code" : "current-password"}
            type={withCode ? "text" : "password"}
            inputMode={withCode ? "numeric" : undefined}
            maxLength={withCode ? 7 : 200}
            placeholder={withCode ? "123 456" : "Senha"}
            className="field !bg-white sm:max-w-[14rem]"
          />
          <button disabled={pending} className="btn btn-ink">{pending ? "Salvando…" : "Salvar alterações"}</button>
        </div>
        {state.message && (
          <p aria-live="polite" className={`mt-3 text-sm ${state.ok ? "text-sage" : "text-red-700"}`}>{state.message}</p>
        )}
      </section>
    </form>
  );
}
