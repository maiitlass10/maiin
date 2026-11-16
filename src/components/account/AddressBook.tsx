"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { browserClient } from "@/lib/supabase/browser";
import { GOVERNORATES, isSyrianMobile } from "@/lib/governorates";
import { useStore } from "@/components/store/StoreProvider";
import { Field, inputClass } from "@/components/admin/ui";

export type Address = { id: string; label: string | null; full_name: string; phone: string; governorate: string; area: string; street: string | null; details: string | null; is_default: boolean };
const blank = { label: "", full_name: "", phone: "", governorate: "", area: "", street: "", details: "", is_default: false };

export function AddressBook() {
  const t = useTranslations("addresses");
  const tg = useTranslations("governorates");
  const ta = useTranslations("account");
  const { user, toast } = useStore();
  const supabase = useMemo(() => browserClient(), []);
  const [list, setList] = useState<Address[] | null>(null);
  const [editing, setEditing] = useState<(typeof blank & { id?: string }) | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirm, setConfirm] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from("addresses").select("*").order("is_default", { ascending: false }).order("created_at");
    setList((data ?? []) as Address[]);
  }, [supabase]);
  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !user) return;
    const er: Record<string, string> = {};
    if (!editing.full_name.trim()) er.full_name = ta("required");
    if (!isSyrianMobile(editing.phone)) er.phone = t("phoneInvalid");
    if (!editing.governorate) er.governorate = ta("required");
    if (!editing.area.trim()) er.area = ta("required");
    setErrors(er);
    if (Object.keys(er).length) return;
    const makeDefault = editing.is_default || !list?.length;
    if (makeDefault) await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
    const row = { label: editing.label.trim() || null, full_name: editing.full_name.trim(), phone: editing.phone.trim(), governorate: editing.governorate, area: editing.area.trim(), street: editing.street.trim() || null, details: editing.details.trim() || null, is_default: makeDefault };
    const { error } = editing.id ? await supabase.from("addresses").update(row).eq("id", editing.id) : await supabase.from("addresses").insert(row);
    if (error) return toast(ta("genericError", { message: error.message }));
    setEditing(null);
    toast(ta("saved"));
    load();
  };

  const setDefault = async (id: string) => {
    if (!user) return;
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    load();
  };
  const remove = async (id: string) => {
    await supabase.from("addresses").delete().eq("id", id);
    setConfirm(null);
    load();
  };

  if (editing) {
    const set = (k: keyof typeof blank, v: string | boolean) => setEditing((s) => (s ? { ...s, [k]: v } : s));
    return (
      <form onSubmit={save} noValidate className="grid max-w-xl gap-4 border border-line p-5">
        <Field label={t("label")} htmlFor="ad-label">
          <input id="ad-label" value={editing.label} onChange={(e) => set("label", e.target.value)} placeholder={t("labelPh")} className={inputClass} maxLength={40} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("recipient")} htmlFor="ad-name" error={errors.full_name}>
            <input id="ad-name" value={editing.full_name} onChange={(e) => set("full_name", e.target.value)} autoComplete="name" aria-invalid={!!errors.full_name} className={inputClass} maxLength={120} />
          </Field>
          <Field label={t("phone")} htmlFor="ad-phone" error={errors.phone}>
            <input id="ad-phone" type="tel" dir="ltr" value={editing.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" aria-invalid={!!errors.phone} placeholder="09xx xxx xxx" className={inputClass} maxLength={30} />
          </Field>
          <Field label={t("governorate")} htmlFor="ad-gov" error={errors.governorate}>
            <select id="ad-gov" value={editing.governorate} onChange={(e) => set("governorate", e.target.value)} aria-invalid={!!errors.governorate} className={inputClass}>
              <option value="">{t("chooseGov")}</option>
              {GOVERNORATES.map((g) => (
                <option key={g} value={g}>
                  {tg(g)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("area")} htmlFor="ad-area" error={errors.area}>
            <input id="ad-area" value={editing.area} onChange={(e) => set("area", e.target.value)} aria-invalid={!!errors.area} className={inputClass} maxLength={120} />
          </Field>
        </div>
        <Field label={t("street")} htmlFor="ad-street">
          <input id="ad-street" value={editing.street} onChange={(e) => set("street", e.target.value)} autoComplete="address-line1" className={inputClass} maxLength={200} />
        </Field>
        <Field label={t("details")} htmlFor="ad-details">
          <input id="ad-details" value={editing.details} onChange={(e) => set("details", e.target.value)} placeholder={t("detailsPh")} className={inputClass} maxLength={300} />
        </Field>
        <label className="flex h-11 items-center gap-3 text-sm font-semibold">
          <input type="checkbox" checked={editing.is_default} onChange={(e) => set("is_default", e.target.checked)} className="size-5 accent-fg" />
          {t("default")}
        </label>
        <div className="flex gap-2">
          <button type="submit" className="h-12 flex-1 bg-fg font-bold text-bg">
            {t("save")}
          </button>
          <button type="button" onClick={() => setEditing(null)} className="h-12 flex-1 border border-line font-bold">
            {t("cancel")}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div>
      <button type="button" onClick={() => (setErrors({}), setEditing({ ...blank }))} className="mb-5 flex h-12 items-center gap-2 bg-fg px-5 font-bold text-bg">
        <Plus className="size-5" aria-hidden />
        {t("add")}
      </button>
      {list === null ? (
        <div className="h-32" aria-busy="true" />
      ) : list.length === 0 ? (
        <p className="border border-line p-8 text-center text-muted">{t("empty")}</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {list.map((a) => (
            <li key={a.id} className={`border p-4 ${a.is_default ? "border-fg" : "border-line"}`}>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0" strokeWidth={1.7} aria-hidden />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-bold">
                    {a.label || a.full_name}
                    {a.is_default && <span className="ms-2 bg-fg px-1.5 py-0.5 text-[11px] text-bg">{t("default")}</span>}
                  </p>
                  <p className="mt-1">{a.full_name} · <span dir="ltr">{a.phone}</span></p>
                  <p className="text-muted">{[tg(a.governorate as never), a.area, a.street, a.details].filter(Boolean).join("، ")}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => (setErrors({}), setEditing({ id: a.id, label: a.label ?? "", full_name: a.full_name, phone: a.phone, governorate: a.governorate, area: a.area, street: a.street ?? "", details: a.details ?? "", is_default: a.is_default }))} className="flex h-10 items-center gap-1.5 border border-line px-3 text-sm">
                  <Pencil className="size-3.5" aria-hidden />
                  {t("edit")}
                </button>
                {!a.is_default && (
                  <button type="button" onClick={() => setDefault(a.id)} className="h-10 border border-line px-3 text-sm">
                    {t("makeDefault")}
                  </button>
                )}
                {confirm === a.id ? (
                  <span className="flex items-center gap-2 text-sm">
                    {t("confirmDelete")}
                    <button type="button" onClick={() => remove(a.id)} className="h-10 bg-sale px-3 font-bold text-white">
                      {t("yes")}
                    </button>
                    <button type="button" onClick={() => setConfirm(null)} className="h-10 border border-line px-3">
                      {t("no")}
                    </button>
                  </span>
                ) : (
                  <button type="button" onClick={() => setConfirm(a.id)} className="flex h-10 items-center gap-1.5 px-3 text-sm text-sale">
                    <Trash2 className="size-3.5" aria-hidden />
                    {t("delete")}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
