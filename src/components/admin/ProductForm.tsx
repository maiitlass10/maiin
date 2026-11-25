"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, ImagePlus, Star, Trash2, X } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { COLORS, type ColorKey } from "@/data/products";
import type { ProductRow } from "@/lib/data";
import { toWebp, uploadImage } from "@/lib/images";
import { deleteProduct, saveProduct, type ProductInput } from "@/app/[locale]/admin/actions";
import { Check, Field, Section, areaClass, inputClass } from "./ui";
import { useIsOwner } from "./StaffRole";

type Category = { slug: string; name_ar: string; name_en: string };

const PRESETS: Record<string, string[]> = {
  presetClothes: ["XS", "S", "M", "L", "XL"],
  presetWaist: ["28", "30", "32", "34", "36"],
  presetShoes: ["40", "41", "42", "43", "44"],
  presetKids: ["2Y", "4Y", "6Y", "8Y"],
  presetOne: ["—"],
};

export function ProductForm({ product, categories }: { product?: ProductRow; categories: Category[] }) {
  const isOwner = useIsOwner();
  const t = useTranslations("admin.form");
  const locale = useLocale() as "ar" | "en";
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, startSave] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newSize, setNewSize] = useState("");

  const [f, setF] = useState<ProductInput>({
    id: product?.id,
    name_ar: product?.name_ar ?? "",
    name_en: product?.name_en ?? "",
    description_ar: product?.description_ar ?? "",
    description_en: product?.description_en ?? "",
    price: product?.price ?? "",
    old_price: product?.old_price ?? "",
    images: product?.images ?? [],
    categories: product?.categories ?? [],
    colors: product?.colors ?? [],
    sizes: product?.sizes ?? [],
    sold_out: product?.sold_out ?? [],
    is_new: product?.is_new ?? true,
    is_flash: product?.is_flash ?? false,
    is_active: product?.is_active ?? true,
    sort: product?.sort ?? 0,
  });
  const set = <K extends keyof ProductInput>(k: K, v: ProductInput[K]) => {
    setF((s) => ({ ...s, [k]: v }));
    setStatus(null);
  };
  const toggleIn = (k: "categories" | "colors" | "sold_out", v: string) => set(k, f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v]);

  // "One size" replaces everything; any real size replaces "one size".
  const addSizes = (list: string[]) =>
    set("sizes", list.includes("—") ? ["—"] : [...f.sizes.filter((s) => s !== "—"), ...list.filter((s) => !f.sizes.includes(s))]);
  const removeSize = (s: string) => {
    setF((st) => ({ ...st, sizes: st.sizes.filter((x) => x !== s), sold_out: st.sold_out.filter((x) => x !== s) }));
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setStatus(null);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files).slice(0, 12)) urls.push(await uploadImage(await toWebp(file), `products/${f.id ?? "new"}`));
      setF((s) => ({ ...s, images: [...s.images, ...urls].slice(0, 12) }));
    } catch (e) {
      setStatus({ tone: "err", text: t("error", { message: (e as Error).message }) });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!f.name_ar.trim()) e.name_ar = t("required");
    if (!f.name_en.trim()) e.name_en = t("required");
    const price = parseFloat(String(f.price));
    if (!Number.isFinite(price) || price < 0) e.price = t("required");
    if (f.old_price !== "" && f.old_price != null && !(parseFloat(String(f.old_price)) > price)) e.old_price = t("oldPriceError");
    if (!f.categories.length) e.categories = t("needCategory");
    if (!f.sizes.length) e.sizes = t("needSize");
    setErrors(e);
    if (Object.keys(e).length) document.getElementById(`f-${Object.keys(e)[0]}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    return !Object.keys(e).length;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    startSave(async () => {
      const res = await saveProduct(f);
      if (!res.ok) return setStatus({ tone: "err", text: t("error", { message: res.error }) });
      setStatus({ tone: "ok", text: t("saved") });
      if (!f.id && res.id) router.replace(`/admin/products/${res.id}`);
      else router.refresh();
    });
  };

  const remove = () =>
    startSave(async () => {
      if (!f.id) return;
      const res = await deleteProduct(f.id);
      if (!res.ok) return setStatus({ tone: "err", text: t("error", { message: res.error }) });
      router.replace("/admin/products");
      router.refresh();
    });

  return (
    <form onSubmit={submit} noValidate className="mx-auto grid max-w-5xl gap-4 pb-24">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" aria-label={t("back")} className="grid size-11 place-items-center border border-line bg-bg">
          <ArrowRight className="size-5 ltr:rotate-180" aria-hidden />
        </Link>
        <h1 className="text-2xl font-black">{f.id ? t("editTitle") : t("newTitle")}</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="grid content-start gap-4">
          <Section title={t("basics")}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("nameAr")} htmlFor="f-name_ar" error={errors.name_ar}>
                <input id="f-name_ar" dir="rtl" value={f.name_ar} onChange={(e) => set("name_ar", e.target.value)} aria-invalid={!!errors.name_ar} className={inputClass} maxLength={160} />
              </Field>
              <Field label={t("nameEn")} htmlFor="f-name_en" error={errors.name_en}>
                <input id="f-name_en" dir="ltr" value={f.name_en} onChange={(e) => set("name_en", e.target.value)} aria-invalid={!!errors.name_en} className={inputClass} maxLength={160} />
              </Field>
              <Field label={t("descAr")} htmlFor="f-desc_ar" hint={t("descHint")}>
                <textarea id="f-desc_ar" dir="rtl" value={f.description_ar} onChange={(e) => set("description_ar", e.target.value)} className={areaClass} maxLength={2000} />
              </Field>
              <Field label={t("descEn")} htmlFor="f-desc_en">
                <textarea id="f-desc_en" dir="ltr" value={f.description_en} onChange={(e) => set("description_en", e.target.value)} className={areaClass} maxLength={2000} />
              </Field>
            </div>
          </Section>

          <Section title={t("photos")}>
            <p className="-mt-2 text-xs text-muted">{t("photosHint")}</p>
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {f.images.map((src, i) => (
                <li key={src} className="relative aspect-[3/4] overflow-hidden border border-line bg-soft">
                  <Image src={src} alt="" fill sizes="160px" className="object-cover" />
                  {i === 0 && <span className="absolute start-1 top-1 bg-fg px-1.5 text-[11px] font-bold text-bg">1</span>}
                  <div className="absolute inset-x-1 bottom-1 flex justify-between">
                    {i > 0 ? (
                      <button type="button" onClick={() => set("images", [src, ...f.images.filter((x) => x !== src)])} aria-label={t("makeMain")} title={t("makeMain")} className="grid size-9 place-items-center bg-bg/90">
                        <Star className="size-4" aria-hidden />
                      </button>
                    ) : (
                      <span />
                    )}
                    <button type="button" onClick={() => set("images", f.images.filter((x) => x !== src))} aria-label={t("removePhoto")} title={t("removePhoto")} className="grid size-9 place-items-center bg-bg/90 text-sale">
                      <X className="size-4" aria-hidden />
                    </button>
                  </div>
                </li>
              ))}
              <li>
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="grid aspect-[3/4] w-full place-items-center border-2 border-dashed border-line bg-bg text-sm text-muted hover:border-fg disabled:opacity-60">
                  <span className="grid justify-items-center gap-1">
                    <ImagePlus className="size-6" aria-hidden />
                    {uploading ? t("uploading") : t("upload")}
                  </span>
                </button>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => upload(e.target.files)} />
              </li>
            </ul>
          </Section>

          <Section title={t("sizes")}>
            <div id="f-sizes" className="grid gap-3">
              <div className="flex flex-wrap gap-2">
                <span className="self-center text-xs text-muted">{t("sizePresets")}:</span>
                {Object.entries(PRESETS).map(([k, list]) => (
                  <button key={k} type="button" onClick={() => addSizes(list)} className="h-9 border border-line px-3 text-sm hover:border-fg">
                    {t(k)}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (newSize.trim()) addSizes([newSize.trim().toUpperCase()]);
                      setNewSize("");
                    }
                  }}
                  aria-label={t("addSize")}
                  placeholder={t("addSize")}
                  className={`${inputClass} max-w-40`}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newSize.trim()) addSizes([newSize.trim().toUpperCase()]);
                    setNewSize("");
                  }}
                  className="h-11 border border-fg px-4 text-sm font-bold"
                >
                  {t("addSize")}
                </button>
              </div>
              {f.sizes.length > 0 && <p className="text-xs text-muted">{t("soldOutHint")}</p>}
              <ul className="flex flex-wrap gap-2">
                {f.sizes.map((s) => {
                  const out = f.sold_out.includes(s);
                  return (
                    <li key={s} className="flex">
                      <button type="button" onClick={() => toggleIn("sold_out", s)} aria-pressed={out} className={`h-10 min-w-12 border px-3 font-latin text-sm font-semibold ${out ? "border-sale text-sale line-through" : "border-fg"}`} title={out ? t("soldOut") : s}>
                        {s}
                      </button>
                      <button type="button" onClick={() => removeSize(s)} aria-label={`${t("removePhoto")} ${s}`} className="grid h-10 w-8 place-items-center border border-s-0 border-line text-muted hover:text-sale">
                        <X className="size-3.5" aria-hidden />
                      </button>
                    </li>
                  );
                })}
              </ul>
              {errors.sizes && <p className="text-xs font-semibold text-sale">{errors.sizes}</p>}
            </div>
          </Section>
        </div>

        <div className="grid content-start gap-4">
          <Section title={t("pricing")}>
            <Field label={t("price")} htmlFor="f-price" error={errors.price}>
              <input id="f-price" type="number" inputMode="decimal" min="0" step="0.01" dir="ltr" value={f.price} onChange={(e) => set("price", e.target.value)} aria-invalid={!!errors.price} className={inputClass} />
            </Field>
            <Field label={t("oldPrice")} htmlFor="f-old_price" hint={t("oldPriceHint")} error={errors.old_price}>
              <input id="f-old_price" type="number" inputMode="decimal" min="0" step="0.01" dir="ltr" value={f.old_price ?? ""} onChange={(e) => set("old_price", e.target.value)} aria-invalid={!!errors.old_price} className={inputClass} />
            </Field>
          </Section>

          <Section title={t("visibility")}>
            <div className="-my-2">
              <Check id="f-active" label={t("isActive")} checked={f.is_active} onChange={(v) => set("is_active", v)} />
              <Check id="f-new" label={t("isNew")} checked={f.is_new} onChange={(v) => set("is_new", v)} />
              <Check id="f-flash" label={t("isFlash")} checked={f.is_flash} onChange={(v) => set("is_flash", v)} />
            </div>
            <Field label={t("sort")} htmlFor="f-sort">
              <input id="f-sort" type="number" dir="ltr" value={f.sort} onChange={(e) => set("sort", e.target.value)} className={inputClass} />
            </Field>
          </Section>

          <Section title={t("categories")}>
            <div id="f-categories" className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button key={c.slug} type="button" aria-pressed={f.categories.includes(c.slug)} onClick={() => toggleIn("categories", c.slug)} className={`h-10 border px-3 text-sm font-semibold ${f.categories.includes(c.slug) ? "border-fg bg-fg text-bg" : "border-line hover:border-fg"}`}>
                  {locale === "ar" ? c.name_ar : c.name_en}
                </button>
              ))}
            </div>
            {errors.categories && <p className="text-xs font-semibold text-sale">{errors.categories}</p>}
          </Section>

          <Section title={t("colors")}>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(COLORS) as ColorKey[]).map((c) => (
                <button key={c} type="button" aria-pressed={f.colors.includes(c)} onClick={() => toggleIn("colors", c)} className={`flex h-10 items-center gap-2 border pe-3 ps-2 text-sm ${f.colors.includes(c) ? "border-fg bg-soft font-semibold" : "border-line hover:border-fg"}`}>
                  <span className="size-5 rounded-full border border-line" style={{ background: COLORS[c].hex }} />
                  {COLORS[c][locale]}
                </button>
              ))}
            </div>
          </Section>

          {f.id && isOwner && (
            <Section title={t("delete")}>
              {confirmDelete ? (
                <div className="grid gap-3">
                  <p className="text-sm">{t("confirmDelete")}</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={remove} disabled={saving} className="h-11 flex-1 bg-sale font-bold text-white disabled:opacity-60">
                      {t("confirmYes")}
                    </button>
                    <button type="button" onClick={() => setConfirmDelete(false)} className="h-11 flex-1 border border-line font-bold">
                      {t("cancel")}
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirmDelete(true)} className="flex h-11 items-center justify-center gap-2 border border-sale font-bold text-sale">
                  <Trash2 className="size-4" aria-hidden />
                  {t("delete")}
                </button>
              )}
            </Section>
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg pb-[env(safe-area-inset-bottom)] lg:start-[240px]">
        <div className="gutter mx-auto flex max-w-5xl items-center justify-end gap-3 py-3 lg:px-8">
          {status && (
            <p role="status" className={`me-auto text-sm font-semibold ${status.tone === "ok" ? "text-ok" : "text-sale"}`}>
              {status.text}
            </p>
          )}
          <button type="submit" disabled={saving || uploading} className="h-12 min-w-40 bg-fg px-8 font-bold text-bg transition-opacity hover:opacity-85 disabled:opacity-60">
            {saving ? t("saving") : t("save")}
          </button>
        </div>
      </div>
    </form>
  );
}
