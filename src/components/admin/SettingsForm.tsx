"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { saveSettings, type SettingsInput } from "@/app/[locale]/admin/actions";
import { Field, Section, inputClass } from "./ui";

export function SettingsForm({ initial }: { initial: SettingsInput }) {
  const t = useTranslations("admin.settings");
  const tf = useTranslations("admin.form");
  const router = useRouter();
  const [f, setF] = useState(initial);
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const set = (k: keyof SettingsInput, v: string) => {
    setF((s) => ({ ...s, [k]: v }));
    setStatus(null);
  };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await saveSettings(f);
          setStatus(r.ok ? { ok: true, text: tf("saved") } : { ok: false, text: tf("error", { message: r.error }) });
          if (r.ok) router.refresh();
        });
      }}
      className="mx-auto grid max-w-xl gap-4"
    >
      <h1 className="text-2xl font-black">{t("title")}</h1>
      <Section title={t("title")}>
        <Field label={t("rate")} htmlFor="s-rate" hint={t("rateHint")}>
          <input id="s-rate" type="number" min="1" step="1" dir="ltr" inputMode="numeric" value={f.syp_per_usd} onChange={(e) => set("syp_per_usd", e.target.value)} className={inputClass} required />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("freeFrom")} htmlFor="s-free">
            <input id="s-free" type="number" min="0" step="0.5" dir="ltr" inputMode="decimal" value={f.free_shipping_from} onChange={(e) => set("free_shipping_from", e.target.value)} className={inputClass} required />
          </Field>
          <Field label={t("fee")} htmlFor="s-fee">
            <input id="s-fee" type="number" min="0" step="0.5" dir="ltr" inputMode="decimal" value={f.shipping_fee} onChange={(e) => set("shipping_fee", e.target.value)} className={inputClass} required />
          </Field>
        </div>
        <Field label={t("shamCash")} htmlFor="s-sham" hint={t("shamCashHint")}>
          <input id="s-sham" dir="ltr" value={f.sham_cash_account ?? ""} onChange={(e) => set("sham_cash_account", e.target.value)} className={inputClass} maxLength={100} />
        </Field>
      </Section>
      <div className="flex items-center justify-end gap-3">
        {status && (
          <p role="status" className={`me-auto text-sm font-semibold ${status.ok ? "text-ok" : "text-sale"}`}>
            {status.text}
          </p>
        )}
        <button type="submit" disabled={pending} className="h-12 min-w-40 bg-fg px-8 font-bold text-bg disabled:opacity-60">
          {pending ? tf("saving") : tf("save")}
        </button>
      </div>
    </form>
  );
}
