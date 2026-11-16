import { setRequestLocale } from "next-intl/server";
import { serverClient } from "@/lib/supabase/server";
import { PromoManager, type PromoRow } from "@/components/admin/PromoManager";

export default async function PromosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const supabase = await serverClient();
  const { data } = await supabase.from("promo_codes").select("*").order("created_at", { ascending: false });
  return <PromoManager rows={(data ?? []) as PromoRow[]} />;
}
