import { createClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "./env";

/** Tag on every catalogue request, so admin saves can refresh the shop instantly. */
export const CATALOG_TAG = "catalog";

/**
 * Anonymous client for reading the public catalogue on the server. Requests are
 * cached and refreshed every minute, or immediately when staff save a change.
 */
export function publicClient() {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, next: { revalidate: 60, tags: [CATALOG_TAG] } }),
    },
  });
}
