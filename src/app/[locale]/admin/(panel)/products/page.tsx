import { getTranslations, setRequestLocale } from "next-intl/server";
import { Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { serverClient } from "@/lib/supabase/server";
import type { ProductRow } from "@/lib/data";
import { ProductsTable } from "@/components/admin/ProductsTable";

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.products");
  const supabase = await serverClient();
  const { data } = await supabase.from("products").select("*").order("sort").order("created_at", { ascending: false });
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black">{t("title")}</h1>
        <Link href="/admin/products/new" className="flex h-11 items-center gap-2 bg-fg px-4 font-bold text-bg">
          <Plus className="size-5" aria-hidden />
          {t("add")}
        </Link>
      </div>
      <ProductsTable rows={(data ?? []) as ProductRow[]} />
    </div>
  );
}
