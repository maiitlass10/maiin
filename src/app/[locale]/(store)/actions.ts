"use server";

import { createClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase/env";

export type PromoResult = { ok: true; code: string; discount: number } | { ok: false; code: string; error: string; minSubtotal?: number };

/** Checks a promo code against the current subtotal. Never cached: codes change and have usage limits. */
export async function checkPromo(code: string, subtotal: number): Promise<PromoResult> {
  const clean = String(code ?? "").trim().toUpperCase().slice(0, 30);
  if (!clean) return { ok: false, code: clean, error: "not_found" };
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  const { data, error } = await supabase.rpc("check_promo", { p_code: clean, p_subtotal: Math.max(0, Number(subtotal) || 0) });
  const row = Array.isArray(data) ? data[0] : null;
  if (error || !row) return { ok: false, code: clean, error: "not_found" };
  if (row.error) return { ok: false, code: row.code, error: row.error, minSubtotal: row.min_subtotal != null ? Number(row.min_subtotal) : undefined };
  return { ok: true, code: row.code, discount: Number(row.discount) };
}

export type PlaceOrderInput = { lines: { id: string; size: string; qty: number }[]; addressId: string; payment: "cod" | "shamcash"; promo: string | null; notes: string };
export type PlaceOrderResult = { ok: true; id: string; number: number } | { ok: false; error: string; message?: string };

/** Places the order through the database function, acting as the signed-in customer. */
export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const { serverClient } = await import("@/lib/supabase/server");
  const supabase = await serverClient();
  const lines = (Array.isArray(input.lines) ? input.lines : []).slice(0, 30).map((l) => ({ id: String(l.id).slice(0, 40), size: String(l.size).slice(0, 20), qty: Math.max(1, Math.min(9, Math.round(Number(l.qty) || 1))) }));
  const { data, error } = await supabase.rpc("place_order", {
    p_lines: lines,
    p_address_id: input.addressId,
    p_payment: input.payment === "shamcash" ? "shamcash" : "cod",
    p_promo: input.promo || null,
    p_notes: String(input.notes ?? "").slice(0, 500) || null,
  });
  if (error) {
    const code = error.message.split(":")[0];
    const known = ["not_signed_in", "address_not_found", "empty_bag", "too_many_items", "sold_out", "bad_size", "unavailable", "promo_invalid"];
    return { ok: false, error: known.includes(code) ? code : "generic", message: error.message };
  }
  const row = Array.isArray(data) ? data[0] : data;
  return { ok: true, id: row.order_id, number: Number(row.order_number) };
}
