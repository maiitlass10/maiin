import { setRequestLocale } from "next-intl/server";
import { currentStaff, serverClient } from "@/lib/supabase/server";
import { OwnerOnlyNotice } from "@/components/admin/StaffRole";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  // Owner only (supabase/sprint7.sql); staff see a short notice instead.
  if ((await currentStaff())?.role !== "owner") return <OwnerOnlyNotice />;
  const supabase = await serverClient();
  const { data } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
  return (
    <SettingsForm
      initial={{
        syp_per_usd: data?.syp_per_usd ?? 13000,
        free_shipping_from: data?.free_shipping_from ?? 50,
        shipping_fee: data?.shipping_fee ?? 3,
        sham_cash_account: data?.sham_cash_account ?? "",
        whatsapp: data?.whatsapp ?? "",
        phone: data?.phone ?? "",
        email: data?.email ?? "",
        address_ar: data?.address_ar ?? "",
        address_en: data?.address_en ?? "",
        hours_ar: data?.hours_ar ?? "",
        hours_en: data?.hours_en ?? "",
        instagram: data?.instagram ?? "",
        facebook: data?.facebook ?? "",
        tiktok: data?.tiktok ?? "",
        exchange_days: data?.exchange_days ?? 7,
        delivery_days: data?.delivery_days ?? "2-5",
      }}
    />
  );
}
