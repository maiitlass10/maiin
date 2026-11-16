import { setRequestLocale } from "next-intl/server";
import { serverClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProduct({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const supabase = await serverClient();
  const { data: categories } = await supabase.from("categories").select("slug, name_ar, name_en").order("sort");
  return <ProductForm categories={categories ?? []} />;
}
