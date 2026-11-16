import { setRequestLocale } from "next-intl/server";
import { serverClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const supabase = await serverClient();
  const { data } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
  return (
    <SettingsForm
      initial={{
        syp_per_usd: data?.syp_per_usd ?? 13000,
        free_shipping_from: data?.free_shipping_from ?? 50,
        shipping_fee: data?.shipping_fee ?? 3,
        sham_cash_account: data?.sham_cash_account ?? "",
      }}
    />
  );
}
