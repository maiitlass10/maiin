import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { serverClient } from "@/lib/supabase/server";
import type { RackRow } from "@/lib/data";
import { RackForm } from "@/components/admin/RackForm";

export default async function EditRack({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const supabase = await serverClient();
  const [{ data: piece }, { data: products }] = await Promise.all([
    supabase.from("rack_pieces").select("*").eq("id", id).maybeSingle(),
    supabase.from("products").select("id, name_ar, name_en, price, sizes, description_ar, description_en, images").order("sort"),
  ]);
  if (!piece) notFound();
  return <RackForm key={piece.id} piece={piece as RackRow} products={products ?? []} />;
}
