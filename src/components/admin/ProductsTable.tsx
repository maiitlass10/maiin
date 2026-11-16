"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Eye, EyeOff, Pencil, Search } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { normalize } from "@/lib/catalog";
import { formatUsd } from "@/lib/format";
import type { ProductRow } from "@/lib/data";
import { setProductActive } from "@/app/[locale]/admin/actions";
import { Badge } from "./ui";

export function ProductsTable({ rows }: { rows: ProductRow[] }) {
  const t = useTranslations("admin.products");
  const tf = useTranslations("admin.form");
  const locale = useLocale();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [pending, start] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  const list = useMemo(() => {
    const n = normalize(q);
    return n ? rows.filter((r) => normalize(`${r.name_ar} ${r.name_en} ${r.id}`).includes(n)) : rows;
  }, [q, rows]);

  const toggle = (r: ProductRow) => {
    setBusyId(r.id);
    start(async () => {
      await setProductActive(r.id, !r.is_active);
      router.refresh();
      setBusyId(null);
    });
  };

  return (
    <div>
      <label className="mb-4 flex h-11 items-center gap-2 border border-line bg-bg px-3">
        <Search className="size-4 text-muted" aria-hidden />
        <span className="sr-only">{t("search")}</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search")} className="h-full flex-1 bg-transparent outline-none" />
      </label>
      <p className="mb-2 text-sm text-muted">{t("count", { count: list.length })}</p>
      {list.length === 0 ? (
        <p className="border border-line bg-bg p-8 text-center text-muted">{t("empty")}</p>
      ) : (
        <ul className="divide-y divide-line border border-line bg-bg">
          {list.map((r) => (
            <li key={r.id} className={`flex items-center gap-3 p-3 ${r.is_active ? "" : "opacity-60"}`}>
              <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-soft">{r.images?.[0] && <Image src={r.images[0]} alt="" fill sizes="48px" className="object-cover" />}</div>
              <div className="min-w-0 flex-1">
                <Link href={`/admin/products/${r.id}`} className="block truncate font-semibold hover:underline">
                  {locale === "ar" ? r.name_ar : r.name_en}
                </Link>
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                  <span className="font-latin font-bold">{formatUsd(Number(r.price))}</span>
                  {r.old_price && <s className="font-latin text-xs text-muted">{formatUsd(Number(r.old_price))}</s>}
                  <Badge tone={r.is_active ? "ok" : "muted"}>{r.is_active ? t("visible") : t("hidden")}</Badge>
                  {r.is_new && <Badge>{tf("isNew")}</Badge>}
                  {r.is_flash && <Badge tone="sale">{tf("isFlash")}</Badge>}
                </p>
              </div>
              <button type="button" onClick={() => toggle(r)} disabled={pending && busyId === r.id} aria-label={`${r.is_active ? t("hide") : t("show")}: ${r.name_ar}`} title={r.is_active ? t("hide") : t("show")} className="grid size-11 place-items-center border border-line hover:border-fg disabled:opacity-40">
                {r.is_active ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
              </button>
              <Link href={`/admin/products/${r.id}`} aria-label={`${t("edit")}: ${r.name_ar}`} className="grid size-11 place-items-center border border-line hover:border-fg">
                <Pencil className="size-4" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
