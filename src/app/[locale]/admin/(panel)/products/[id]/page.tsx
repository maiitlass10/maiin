import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { serverClient } from "@/lib/supabase/server";
import type { ProductRow } from "@/lib/data";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProduct({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const supabase = await serverClient();
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("slug, name_ar, name_en").order("sort"),
  ]);
  if (!product) notFound();
  return <ProductForm key={product.id} product={product as ProductRow} categories={categories ?? []} />;
}
