import { cache } from "react";
import { COLORS, products as fallbackProducts, rackPieces as fallbackRack, type ColorKey, type Product, type RackPiece } from "@/data/products";
import { siteConfig } from "./config";
import { hasSupabase } from "./supabase/env";
import { publicClient } from "./supabase/public";

export type Settings = {
  sypPerUsd: number;
  freeShippingFrom: number;
  shippingFee: number;
  shamCashAccount: string | null;
};

export type ProductRow = {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar: string | null;
  description_en: string | null;
  price: number;
  old_price: number | null;
  images: string[];
  categories: string[];
  colors: string[];
  sizes: string[];
  sold_out: string[];
  rating: number;
  reviews: number;
  sold: number;
  is_new: boolean;
  is_flash: boolean;
  is_active: boolean;
  sort: number;
};

export type RackRow = {
  id: string;
  product_id: string | null;
  name_ar: string;
  name_en: string;
  description_ar: string | null;
  description_en: string | null;
  material_ar: string | null;
  material_en: string | null;
  color_ar: string | null;
  color_en: string | null;
  price: number;
  sizes: string[];
  cutout_url: string;
  look_url: string | null;
  sort: number;
  is_active: boolean;
};

const PLACEHOLDER = "/icon.svg";

export function toProduct(r: ProductRow): Product {
  const images = r.images?.filter(Boolean) ?? [];
  return {
    id: r.id,
    name: { ar: r.name_ar, en: r.name_en },
    description: r.description_ar || r.description_en ? { ar: r.description_ar || r.description_en || "", en: r.description_en || r.description_ar || "" } : undefined,
    categories: (r.categories ?? []) as Product["categories"],
    price: Number(r.price),
    oldPrice: r.old_price != null ? Number(r.old_price) : undefined,
    image: images[0] ?? PLACEHOLDER,
    images: images.length ? images : [PLACEHOLDER],
    rating: Number(r.rating),
    reviews: r.reviews,
    sold: r.sold,
    colors: (r.colors ?? []).filter((c): c is ColorKey => c in COLORS),
    sizes: r.sizes?.length ? r.sizes : ["—"],
    soldOut: r.sold_out ?? [],
    isNew: r.is_new,
    flash: r.is_flash,
  };
}

export function toRackPiece(r: RackRow): RackPiece {
  const l = (ar: string | null, en: string | null) => ({ ar: ar || en || "", en: en || ar || "" });
  return {
    id: r.id,
    productId: r.product_id,
    name: l(r.name_ar, r.name_en),
    description: l(r.description_ar, r.description_en),
    material: l(r.material_ar, r.material_en),
    color: l(r.color_ar, r.color_en),
    price: Number(r.price),
    sizes: r.sizes?.length ? r.sizes : ["—"],
    cutout: r.cutout_url,
    look: r.look_url,
  };
}

const fallbackSettings: Settings = {
  sypPerUsd: siteConfig.sypPerUsd,
  freeShippingFrom: siteConfig.freeShippingFrom,
  shippingFee: siteConfig.shippingFee,
  shamCashAccount: null,
};

/** Active products in display order. Falls back to the bundled catalogue if Supabase can't be reached. */
export const getProducts = cache(async (): Promise<Product[]> => {
  if (!hasSupabase) return fallbackProducts;
  const { data, error } = await publicClient().from("products").select("*").eq("is_active", true).order("sort").order("created_at", { ascending: false });
  if (error || !data) {
    console.error("[data] products:", error?.message);
    return fallbackProducts;
  }
  return (data as ProductRow[]).map(toProduct);
});

export const getRackPieces = cache(async (): Promise<RackPiece[]> => {
  if (!hasSupabase) return fallbackRack;
  const { data, error } = await publicClient().from("rack_pieces").select("*").eq("is_active", true).order("sort");
  if (error || !data) {
    console.error("[data] rack:", error?.message);
    return fallbackRack;
  }
  return (data as RackRow[]).map(toRackPiece);
});

export const getSettings = cache(async (): Promise<Settings> => {
  if (!hasSupabase) return fallbackSettings;
  const { data, error } = await publicClient().from("settings").select("*").eq("id", 1).maybeSingle();
  if (error || !data) {
    console.error("[data] settings:", error?.message);
    return fallbackSettings;
  }
  return {
    sypPerUsd: Number(data.syp_per_usd),
    freeShippingFrom: Number(data.free_shipping_from),
    shippingFee: Number(data.shipping_fee),
    shamCashAccount: data.sham_cash_account,
  };
});

export async function getProduct(id: string) {
  return (await getProducts()).find((p) => p.id === id);
}
