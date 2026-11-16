"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import type { ProductRow, RackRow } from "@/lib/data";
import { removeBackground, toWebp, uploadImage } from "@/lib/images";
import { deleteRackPiece, saveRackPiece, type RackInput } from "@/app/[locale]/admin/actions";
import { Check, Field, Section, areaClass, inputClass } from "./ui";

/** Checkerboard so a transparent cut-out is easy to judge. */
const checker = { backgroundImage: "repeating-conic-gradient(#eee 0 25%, #fff 0 50%)", backgroundSize: "20px 20px" };

export function RackForm({ piece, products }: { piece?: RackRow; products: Pick<ProductRow, "id" | "name_ar" | "name_en" | "price" | "sizes" | "description_ar" | "description_en" | "images">[] }) {
  const t = useTranslations("admin.rack");
  const tf = useTranslations("admin.form");
  const locale = useLocale();
  const router = useRouter();
  const cutRef = useRef<HTMLInputElement>(null);
  const lookRef = useRef<HTMLInputElement>(null);
  const [saving, start] = useTransition();
  const [busy, setBusy] = useState<null | "cutout" | "look">(null);
  const [removeBg, setRemoveBg] = useState(true);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [f, setF] = useState<RackInput & { sizesText: string }>({
    id: piece?.id,
    product_id: piece?.product_id ?? "",
    name_ar: piece?.name_ar ?? "",
    name_en: piece?.name_en ?? "",
    description_ar: piece?.description_ar ?? "",
    description_en: piece?.description_en ?? "",
    material_ar: piece?.material_ar ?? "",
    material_en: piece?.material_en ?? "",
    color_ar: piece?.color_ar ?? "",
    color_en: piece?.color_en ?? "",
    price: piece?.price ?? "",
    sizes: piece?.sizes ?? [],
    sizesText: (piece?.sizes ?? []).join(", "),
    cutout_url: piece?.cutout_url ?? "",
    look_url: piece?.look_url ?? "",
    sort: piece?.sort ?? 0,
    is_active: piece?.is_active ?? true,
  });
  const set = (k: keyof typeof f, v: string | boolean) => {
    setF((s) => ({ ...s, [k]: v }));
    setStatus(null);
  };

  const fillFromProduct = () => {
    const p = products.find((x) => x.id === f.product_id);
    if (!p) return;
    setF((s) => ({ ...s, name_ar: p.name_ar, name_en: p.name_en, description_ar: p.description_ar ?? s.description_ar, description_en: p.description_en ?? s.description_en, price: p.price, sizes: p.sizes, sizesText: p.sizes.join(", "), look_url: s.look_url || p.images?.[0] || "" }));
  };

  const pick = async (kind: "cutout" | "look", file?: File) => {
    if (!file) return;
    setBusy(kind);
    setStatus(null);
    try {
      const blob = kind === "cutout" && removeBg ? await removeBackground(file) : await toWebp(file, kind === "cutout" ? 960 : 1200);
      const url = await uploadImage(blob, kind === "cutout" ? "rack" : "looks");
      set(kind === "cutout" ? "cutout_url" : "look_url", url);
    } catch (e) {
      setStatus({ ok: false, text: kind === "cutout" && removeBg ? t("bgFailed") : tf("error", { message: (e as Error).message }) });
    } finally {
      setBusy(null);
      if (cutRef.current) cutRef.current.value = "";
      if (lookRef.current) lookRef.current.value = "";
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name_ar.trim() || !f.name_en.trim() || !String(f.price).trim()) return setStatus({ ok: false, text: tf("required") });
    if (!f.cutout_url) return setStatus({ ok: false, text: t("needCutout") });
    start(async () => {
      const r = await saveRackPiece({ ...f, sizes: f.sizesText.split(/[,،]/).map((s) => s.trim()).filter(Boolean) });
      if (!r.ok) return setStatus({ ok: false, text: tf("error", { message: r.error }) });
      setStatus({ ok: true, text: tf("saved") });
      if (!f.id && r.id) router.replace(`/admin/rack/${r.id}`);
      else router.refresh();
    });
  };

  const text = (k: keyof typeof f, label: string, dir: "rtl" | "ltr", area = false) => (
    <Field label={label} htmlFor={`r-${String(k)}`}>
      {area ? (
        <textarea id={`r-${String(k)}`} dir={dir} value={String(f[k] ?? "")} onChange={(e) => set(k, e.target.value)} className={areaClass} maxLength={2000} />
      ) : (
        <input id={`r-${String(k)}`} dir={dir} value={String(f[k] ?? "")} onChange={(e) => set(k, e.target.value)} className={inputClass} maxLength={200} />
      )}
    </Field>
  );

  return (
    <form onSubmit={submit} noValidate className="mx-auto grid max-w-5xl gap-4 pb-24">
      <div className="flex items-center gap-3">
        <Link href="/admin/rack" aria-label={tf("back")} className="grid size-11 place-items-center border border-line bg-bg">
          <ArrowRight className="size-5 ltr:rotate-180" aria-hidden />
        </Link>
        <h1 className="text-2xl font-black">{f.id ? t("editTitle") : t("newTitle")}</h1>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="grid content-start gap-4">
          <Section title={t("cutout")}>
            <p className="-mt-2 text-xs text-muted">{t("cutoutHint")}</p>
            <div className="relative aspect-[3/4] w-full overflow-hidden border border-line" style={checker}>
              {f.cutout_url && <Image src={f.cutout_url} alt="" fill sizes="400px" className="object-contain p-3" />}
              {busy === "cutout" && (
                <div className="absolute inset-0 grid place-items-center bg-bg/80 p-4 text-center text-sm font-semibold">
                  <span className="grid justify-items-center gap-2">
                    <Loader2 className="size-6 animate-spin" aria-hidden />
                    {removeBg ? t("processing") : tf("uploading")}
                  </span>
                </div>
              )}
            </div>
            <Check id="r-removebg" label={t("removeBg")} checked={removeBg} onChange={setRemoveBg} />
            <button type="button" disabled={!!busy} onClick={() => cutRef.current?.click()} className="flex h-11 items-center justify-center gap-2 border border-fg font-bold disabled:opacity-60">
              <ImagePlus className="size-5" aria-hidden />
              {tf("upload")}
            </button>
            <input ref={cutRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => pick("cutout", e.target.files?.[0])} />
          </Section>
          <Section title={t("look")}>
            <div className="relative aspect-[3/4] w-full overflow-hidden border border-line bg-soft">
              {f.look_url && <Image src={f.look_url} alt="" fill sizes="400px" className="object-cover" />}
              {busy === "look" && (
                <div className="absolute inset-0 grid place-items-center bg-bg/80">
                  <Loader2 className="size-6 animate-spin" aria-hidden />
                </div>
              )}
            </div>
            <button type="button" disabled={!!busy} onClick={() => lookRef.current?.click()} className="flex h-11 items-center justify-center gap-2 border border-fg font-bold disabled:opacity-60">
              <ImagePlus className="size-5" aria-hidden />
              {tf("upload")}
            </button>
            <input ref={lookRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => pick("look", e.target.files?.[0])} />
          </Section>
        </div>
        <div className="grid content-start gap-4">
          <Section title={tf("basics")}>
            <Field label={t("linked")} htmlFor="r-product">
              <div className="flex gap-2">
                <select id="r-product" value={f.product_id ?? ""} onChange={(e) => set("product_id", e.target.value)} className={inputClass}>
                  <option value="">{t("none")}</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {locale === "ar" ? p.name_ar : p.name_en}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={fillFromProduct} disabled={!f.product_id} className="h-11 shrink-0 border border-line px-3 text-sm font-semibold disabled:opacity-40">
                  {t("fillFromProduct")}
                </button>
              </div>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              {text("name_ar", tf("nameAr"), "rtl")}
              {text("name_en", tf("nameEn"), "ltr")}
              {text("description_ar", tf("descAr"), "rtl", true)}
              {text("description_en", tf("descEn"), "ltr", true)}
              {text("material_ar", t("materialAr"), "rtl")}
              {text("material_en", t("materialEn"), "ltr")}
              {text("color_ar", t("colorAr"), "rtl")}
              {text("color_en", t("colorEn"), "ltr")}
              <Field label={tf("price")} htmlFor="r-price">
                <input id="r-price" type="number" min="0" step="0.01" dir="ltr" value={f.price} onChange={(e) => set("price", e.target.value)} className={inputClass} />
              </Field>
              {text("sizesText", t("sizesText"), "ltr")}
              <Field label={tf("sort")} htmlFor="r-sort">
                <input id="r-sort" type="number" dir="ltr" value={f.sort} onChange={(e) => set("sort", e.target.value)} className={inputClass} />
              </Field>
              <Check id="r-active" label={tf("isActive")} checked={f.is_active} onChange={(v) => set("is_active", v)} />
            </div>
          </Section>
          {f.id && (
            <Section title={tf("delete")}>
              {confirmDelete ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      start(async () => {
                        const r = await deleteRackPiece(f.id!);
                        if (!r.ok) return setStatus({ ok: false, text: tf("error", { message: r.error }) });
                        router.replace("/admin/rack");
                        router.refresh();
                      })
                    }
                    className="h-11 flex-1 bg-sale font-bold text-white"
                  >
                    {tf("confirmYes")}
                  </button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className="h-11 flex-1 border border-line font-bold">
                    {tf("cancel")}
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirmDelete(true)} className="flex h-11 items-center justify-center gap-2 border border-sale font-bold text-sale">
                  <Trash2 className="size-4" aria-hidden />
                  {tf("delete")}
                </button>
              )}
            </Section>
          )}
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg pb-[env(safe-area-inset-bottom)] lg:start-[240px]">
        <div className="gutter mx-auto flex max-w-5xl items-center justify-end gap-3 py-3 lg:px-8">
          {status && (
            <p role="status" className={`me-auto text-sm font-semibold ${status.ok ? "text-ok" : "text-sale"}`}>
              {status.text}
            </p>
          )}
          <button type="submit" disabled={saving || !!busy} className="h-12 min-w-40 bg-fg px-8 font-bold text-bg disabled:opacity-60">
            {saving ? tf("saving") : tf("save")}
          </button>
        </div>
      </div>
    </form>
  );
}
