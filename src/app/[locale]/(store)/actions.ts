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
