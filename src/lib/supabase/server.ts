import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_KEY, SUPABASE_URL } from "./env";

/** Client acting as the signed-in staff member (session read from cookies). */
export async function serverClient() {
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a Server Component: the middleware refreshes the session instead.
        }
      },
    },
  });
}

/** Returns the signed-in user when they are on the staff list, otherwise null. */
export async function currentStaff() {
  const supabase = await serverClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: staff } = await supabase.from("staff").select("role").eq("user_id", data.user.id).maybeSingle();
  return staff ? { user: data.user, role: staff.role as "owner" | "editor" } : null;
}
