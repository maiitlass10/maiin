"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useStore } from "@/components/store/StoreProvider";

/** Sends guests to the sign-in page and brings them back afterwards. */
export function RequireAccount({ children }: { children: React.ReactNode }) {
  const { user, authReady } = useStore();
  const router = useRouter();
  const path = usePathname();
  useEffect(() => {
    if (authReady && !user) router.replace(`/account?next=${encodeURIComponent(path)}`);
  }, [authReady, user, router, path]);
  if (!authReady || !user) return <div className="h-64" aria-busy="true" />;
  return <>{children}</>;
}
