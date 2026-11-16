import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Pencil, Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { serverClient } from "@/lib/supabase/server";
import { formatUsd } from "@/lib/format";
import type { RackRow } from "@/lib/data";
import { Badge } from "@/components/admin/ui";

export default async function RackList({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.rack");
  const tp = await getTranslations("admin.products");
  const supabase = await serverClient();
  const { data } = await supabase.from("rack_pieces").select("*").order("sort");
  const rows = (data ?? []) as RackRow[];
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black">{t("title")}</h1>
        <Link href="/admin/rack/new" className="flex h-11 items-center gap-2 bg-fg px-4 font-bold text-bg">
          <Plus className="size-5" aria-hidden />
          {t("add")}
        </Link>
      </div>
      <p className="mb-5 text-sm text-muted">{t("text")}</p>
      {rows.length === 0 ? (
        <p className="border border-line bg-bg p-8 text-center text-muted">{t("empty")}</p>
      ) : (
        <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {rows.map((r, i) => (
            <li key={r.id} className={`border border-line bg-bg ${r.is_active ? "" : "opacity-60"}`}>
              <Link href={`/admin/rack/${r.id}`} className="group block">
                <div className="relative aspect-[3/4] bg-soft">
                  <Image src={r.cutout_url} alt="" fill sizes="240px" className="object-contain p-3" />
                  <span className="absolute start-2 top-2 bg-fg px-1.5 font-latin text-xs font-bold text-bg">{String(i + 1).padStart(2, "0")}</span>
                  <span className="absolute end-2 top-2 grid size-9 place-items-center bg-bg opacity-0 transition-opacity group-hover:opacity-100">
                    <Pencil className="size-4" aria-hidden />
                  </span>
                </div>
                <div className="grid gap-1 p-3">
                  <p className="truncate text-sm font-semibold">{locale === "ar" ? r.name_ar : r.name_en}</p>
                  <p className="flex items-center gap-2 text-sm">
                    <span className="font-latin font-bold">{formatUsd(Number(r.price))}</span>
                    <Badge tone={r.is_active ? "ok" : "muted"}>{r.is_active ? tp("visible") : tp("hidden")}</Badge>
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
