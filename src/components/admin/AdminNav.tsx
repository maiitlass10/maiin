"use client";

import { useTranslations } from "next-intl";
import { LayoutDashboard, Package, Receipt, Settings, Shirt, Tag } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { useIsOwner } from "./StaffRole";

export function AdminNav() {
  const t = useTranslations("admin.nav");
  const path = usePathname();
  const isOwner = useIsOwner();
  const items = [
    { href: "/admin", label: t("dashboard"), icon: LayoutDashboard, exact: true },
    { href: "/admin/orders", label: t("orders"), icon: Receipt },
    { href: "/admin/products", label: t("products"), icon: Package },
    { href: "/admin/rack", label: t("rack"), icon: Shirt },
    { href: "/admin/promos", label: t("promos"), icon: Tag, ownerOnly: true },
    { href: "/admin/settings", label: t("settings"), icon: Settings, ownerOnly: true },
  ].filter((item) => isOwner || !item.ownerOnly);
  return (
    <nav aria-label={t("dashboard")} className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-col">
      {items.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? path === href : path.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex h-11 shrink-0 items-center gap-3 px-3 text-sm font-semibold transition-colors ${active ? "bg-fg text-bg" : "hover:bg-soft"}`}>
            <Icon className="size-5" strokeWidth={1.8} aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
