"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { formatUsd } from "@/lib/format";
import { deletePromo, savePromo, type PromoInput } from "@/app/[locale]/admin/actions";
import { Badge, Check, Field, Section, inputClass } from "./ui";

export type PromoRow = {
  code: string;
  kind: "percent" | "fixed";
  value: number;
  min_subtotal: number;
  starts_at: string | null;
  ends_at: string | null;
  max_uses: number | null;
  uses: number;
  is_active: boolean;
};

const toLocal = (iso: string | null) => (iso ? new Date(iso).toISOString().slice(0, 16) : "");
const blank: PromoInput = { code: "", kind: "percent", value: "", min_subtotal: 0, starts_at: "", ends_at: "", max_uses: "", is_active: true };

export function PromoManager({ rows }: { rows: PromoRow[] }) {
  const t = useTranslations("admin.promos");
  const tf = useTranslations("admin.form");
  const router = useRouter();
  const [editing, setEditing] = useState<PromoInput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const set = (k: keyof PromoInput, v: string | boolean) => setEditing((s) => (s ? { ...s, [k]: v } : s));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const code = editing.code.trim().toUpperCase();
    if (!/^[A-Z0-9_-]{3,30}$/.test(code)) return setError(t("codeInvalid"));
    const v = parseFloat(String(editing.value));
    if (!(v > 0) || (editing.kind === "percent" && v > 90)) return setError(t("percentMax"));
    start(async () => {
      const r = await savePromo({ ...editing, code });
      if (!r.ok) return setError(tf("error", { message: r.error }));
      setEditing(null);
      router.refresh();
    });
  };

  const edit = (r: PromoRow) => {
    setError(null);
    setEditing({
      original: r.code,
      code: r.code,
      kind: r.kind,
      value: r.value,
      min_subtotal: r.min_subtotal,
      starts_at: toLocal(r.starts_at),
      ends_at: toLocal(r.ends_at),
      max_uses: r.max_uses ?? "",
      is_active: r.is_active,
    });
  };

  return (
    <div className="mx-auto grid max-w-4xl gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black">{t("title")}</h1>
        {!editing && (
          <button type="button" onClick={() => (setError(null), setEditing({ ...blank }))} className="flex h-11 items-center gap-2 bg-fg px-4 font-bold text-bg">
            <Plus className="size-5" aria-hidden />
            {t("add")}
          </button>
        )}
      </div>

      {editing && (
        <form onSubmit={submit} noValidate>
          <Section title={editing.original ?? t("add")}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("code")} htmlFor="pc-code" hint={t("codeHint")}>
                <input id="pc-code" dir="ltr" value={editing.code} onChange={(e) => set("code", e.target.value.toUpperCase())} className={`${inputClass} uppercase`} maxLength={30} />
              </Field>
              <Field label={t("kind")} htmlFor="pc-kind">
                <select id="pc-kind" value={editing.kind} onChange={(e) => set("kind", e.target.value)} className={inputClass}>
                  <option value="percent">{t("percent")}</option>
                  <option value="fixed">{t("fixed")}</option>
                </select>
              </Field>
              <Field label={t("value")} htmlFor="pc-value">
                <input id="pc-value" type="number" min="0" step="0.01" dir="ltr" value={editing.value} onChange={(e) => set("value", e.target.value)} className={inputClass} />
              </Field>
              <Field label={t("minSubtotal")} htmlFor="pc-min">
                <input id="pc-min" type="number" min="0" step="0.5" dir="ltr" value={editing.min_subtotal} onChange={(e) => set("min_subtotal", e.target.value)} className={inputClass} />
              </Field>
              <Field label={t("startsAt")} htmlFor="pc-start">
                <input id="pc-start" type="datetime-local" dir="ltr" value={editing.starts_at} onChange={(e) => set("starts_at", e.target.value)} className={inputClass} />
              </Field>
              <Field label={t("endsAt")} htmlFor="pc-end">
                <input id="pc-end" type="datetime-local" dir="ltr" value={editing.ends_at} onChange={(e) => set("ends_at", e.target.value)} className={inputClass} />
              </Field>
              <Field label={t("maxUses")} htmlFor="pc-max">
                <input id="pc-max" type="number" min="1" step="1" dir="ltr" value={editing.max_uses ?? ""} onChange={(e) => set("max_uses", e.target.value)} className={inputClass} />
              </Field>
              <Check id="pc-active" label={t("active")} checked={editing.is_active} onChange={(v) => set("is_active", v)} />
            </div>
            {error && (
              <p className="text-sm font-semibold text-sale" role="alert">
                {error}
              </p>
            )}
            <div className="flex gap-2">
              <button type="submit" disabled={pending} className="h-12 flex-1 bg-fg font-bold text-bg disabled:opacity-60">
                {pending ? tf("saving") : tf("save")}
              </button>
              <button type="button" onClick={() => setEditing(null)} className="h-12 flex-1 border border-line bg-bg font-bold">
                {tf("cancel")}
              </button>
            </div>
          </Section>
        </form>
      )}

      {rows.length === 0 ? (
        <p className="border border-line bg-bg p-8 text-center text-muted">{t("empty")}</p>
      ) : (
        <ul className="divide-y divide-line border border-line bg-bg">
          {rows.map((r) => (
            <li key={r.code} className="flex flex-wrap items-center gap-3 p-3">
              <div className="min-w-0 flex-1">
                <p className="font-latin text-lg font-extrabold tracking-wider" dir="ltr">
                  {r.code}
                </p>
                <p className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-latin font-bold">{r.kind === "percent" ? `${Number(r.value)}%` : formatUsd(Number(r.value))}</span>
                  {Number(r.min_subtotal) > 0 && <span className="text-muted">≥ {formatUsd(Number(r.min_subtotal))}</span>}
                  <Badge tone={r.is_active ? "ok" : "muted"}>{r.is_active ? t("active") : t("paused")}</Badge>
                  <span className="text-muted">
                    {t("uses", { count: r.uses })}
                    {r.max_uses ? ` / ${r.max_uses}` : ""}
                  </span>
                </p>
              </div>
              <button type="button" onClick={() => edit(r)} aria-label={`${tf("editTitle")}: ${r.code}`} className="grid size-11 place-items-center border border-line">
                <Pencil className="size-4" aria-hidden />
              </button>
              {confirm === r.code ? (
                <span className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      start(async () => {
                        await deletePromo(r.code);
                        setConfirm(null);
                        router.refresh();
                      })
                    }
                    className="h-11 bg-sale px-3 text-sm font-bold text-white"
                  >
                    {tf("confirmYes")}
                  </button>
                  <button type="button" onClick={() => setConfirm(null)} className="h-11 border border-line px-3 text-sm">
                    {tf("cancel")}
                  </button>
                </span>
              ) : (
                <button type="button" onClick={() => setConfirm(r.code)} aria-label={`${tf("delete")}: ${r.code}`} className="grid size-11 place-items-center border border-line text-sale">
                  <Trash2 className="size-4" aria-hidden />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
