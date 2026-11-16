import { setRequestLocale } from "next-intl/server";
import { serverClient } from "@/lib/supabase/server";
import { RackForm } from "@/components/admin/RackForm";

export default async function NewRack({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const supabase = await serverClient();
  const { data: products } = await supabase.from("products").select("id, name_ar, name_en, price, sizes, description_ar, description_en, images").order("sort");
  return <RackForm products={products ?? []} />;
}
