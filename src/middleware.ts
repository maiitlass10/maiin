import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { routing } from "./i18n/routing";
import { SUPABASE_KEY, SUPABASE_URL } from "./lib/supabase/env";

const intl = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const response = intl(request);
  // Only admin pages need a session; keep shop pages fully cacheable.
  if (!/^\/(ar|en)\/admin(\/|$)/.test(request.nextUrl.pathname) || response.headers.get("location")) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => list.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
    },
  });
  await supabase.auth.getUser();
  return response satisfies NextResponse;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
