"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { serverClient, currentStaff } from "@/lib/supabase/server";
import { CATALOG_TAG } from "@/lib/supabase/public";

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

const clean = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const list = (v: unknown, max = 40) => (Array.isArray(v) ? v.map((x) => clean(x, 200)).filter(Boolean).slice(0, max) : []);
const money = (v: unknown) => {
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
};

function refresh() {
  revalidateTag(CATALOG_TAG);
  revalidatePath("/", "layout");
}

async function guard() {
  const staff = await currentStaff();
  if (!staff) throw new Error("not signed in as staff");
  return serverClient();
}

export type ProductInput = {
  id?: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  price: number | string;
  old_price?: number | string | null;
  images: string[];
  categories: string[];
  colors: string[];
  sizes: string[];
  sold_out: string[];
  is_new: boolean;
  is_flash: boolean;
  is_active: boolean;
  sort: number | string;
};

export async function saveProduct(input: ProductInput): Promise<ActionResult> {
  try {
    const supabase = await guard();
    const price = money(input.price);
    const oldPrice = input.old_price === "" || input.old_price == null ? null : money(input.old_price);
    const sizes = list(input.sizes);
    const row = {
      name_ar: clean(input.name_ar, 160),
      name_en: clean(input.name_en, 160),
      description_ar: clean(input.description_ar) || null,
      description_en: clean(input.description_en) || null,
      price,
      old_price: oldPrice,
      images: list(input.images, 12),
      categories: list(input.categories),
      colors: list(input.colors),
      sizes,
      sold_out: list(input.sold_out).filter((s) => sizes.includes(s)),
      is_new: !!input.is_new,
      is_flash: !!input.is_flash,
      is_active: !!input.is_active,
      sort: Math.round(Number(input.sort) || 0),
    };
    if (!row.name_ar || !row.name_en || price === null) return { ok: false, error: "missing name or price" };
    if (oldPrice !== null && oldPrice <= price) return { ok: false, error: "old price must be higher than price" };

    const q = input.id ? supabase.from("products").update(row).eq("id", input.id).select("id").single() : supabase.from("products").insert(row).select("id").single();
    const { data, error } = await q;
    if (error) return { ok: false, error: error.message };
    refresh();
    return { ok: true, id: data.id };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function setProductActive(id: string, active: boolean): Promise<ActionResult> {
  try {
    const supabase = await guard();
    const { error } = await supabase.from("products").update({ is_active: active }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    refresh();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    const supabase = await guard();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    refresh();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export type RackInput = {
  id?: string;
  product_id?: string | null;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  material_ar?: string;
  material_en?: string;
  color_ar?: string;
  color_en?: string;
  price: number | string;
  sizes: string[];
  cutout_url: string;
  look_url?: string | null;
  sort: number | string;
  is_active: boolean;
};

export async function saveRackPiece(input: RackInput): Promise<ActionResult> {
  try {
    const supabase = await guard();
    const price = money(input.price);
    const row = {
      product_id: clean(input.product_id ?? "") || null,
      name_ar: clean(input.name_ar, 160),
      name_en: clean(input.name_en, 160),
      description_ar: clean(input.description_ar) || null,
      description_en: clean(input.description_en) || null,
      material_ar: clean(input.material_ar, 200) || null,
      material_en: clean(input.material_en, 200) || null,
      color_ar: clean(input.color_ar, 100) || null,
      color_en: clean(input.color_en, 100) || null,
      price,
      sizes: list(input.sizes),
      cutout_url: clean(input.cutout_url, 1000),
      look_url: clean(input.look_url ?? "", 1000) || null,
      sort: Math.round(Number(input.sort) || 0),
      is_active: !!input.is_active,
    };
    if (!row.name_ar || !row.name_en || price === null || !row.cutout_url) return { ok: false, error: "missing name, price or photo" };
    const q = input.id ? supabase.from("rack_pieces").update(row).eq("id", input.id).select("id").single() : supabase.from("rack_pieces").insert(row).select("id").single();
    const { data, error } = await q;
    if (error) return { ok: false, error: error.message };
    refresh();
    return { ok: true, id: data.id };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function deleteRackPiece(id: string): Promise<ActionResult> {
  try {
    const supabase = await guard();
    const { error } = await supabase.from("rack_pieces").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    refresh();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export type SettingsInput = { syp_per_usd: number | string; free_shipping_from: number | string; shipping_fee: number | string; sham_cash_account?: string };

export async function saveSettings(input: SettingsInput): Promise<ActionResult> {
  try {
    const supabase = await guard();
    const rate = money(input.syp_per_usd);
    const free = money(input.free_shipping_from);
    const fee = money(input.shipping_fee);
    if (!rate || free === null || fee === null) return { ok: false, error: "invalid numbers" };
    const { error } = await supabase
      .from("settings")
      .update({ syp_per_usd: rate, free_shipping_from: free, shipping_fee: fee, sham_cash_account: clean(input.sham_cash_account, 100) || null })
      .eq("id", 1);
    if (error) return { ok: false, error: error.message };
    refresh();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function signOut() {
  const supabase = await serverClient();
  await supabase.auth.signOut();
}
