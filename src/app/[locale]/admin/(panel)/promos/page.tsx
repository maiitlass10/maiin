import { setRequestLocale } from "next-intl/server";
import { currentStaff, serverClient } from "@/lib/supabase/server";
import { OwnerOnlyNotice } from "@/components/admin/StaffRole";
import { PromoManager, type PromoRow } from "@/components/admin/PromoManager";

export default async function PromosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  // Owner only (supabase/sprint7.sql); staff see a short notice instead.
  if ((await currentStaff())?.role !== "owner") return <OwnerOnlyNotice />;
  const supabase = await serverClient();
  const { data } = await supabase.from("promo_codes").select("*").order("created_at", { ascending: false });
  return <PromoManager rows={(data ?? []) as PromoRow[]} />;
}
