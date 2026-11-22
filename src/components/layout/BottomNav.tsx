"use client";

import { useTranslations } from "next-intl";
import { Heart, Home, LayoutGrid, ShoppingBag, User } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { useStore } from "@/components/store/StoreProvider";

export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { bagCount, wishlist } = useStore();
  const items = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/#categories", label: t("categories"), icon: LayoutGrid },
    { href: "/wishlist", label: t("wishlist"), icon: Heart, count: wishlist.length },
    { href: "/bag", label: t("bag"), icon: ShoppingBag, count: bagCount },
    { href: "/account", label: t("account"), icon: User },
  ];

  return (
    <nav aria-label={t("label")} className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon, count }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link href={href} aria-current={active ? "page" : undefined} className={`flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${active ? "text-fg" : "text-muted"}`}>
                <span className="relative">
                  <Icon className="size-[22px]" strokeWidth={active ? 2.2 : 1.7} aria-hidden />
                  {!!count && (
                    <span className="absolute -end-2.5 -top-1.5 grid min-w-4 place-items-center rounded-full bg-accent px-1 font-latin text-[10px] font-bold leading-4 text-accent-fg">{count}</span>
                  )}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
