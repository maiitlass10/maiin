"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X, ChevronLeft } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { categories } from "@/lib/categories";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function MobileMenu() {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={t("header.menu")}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="grid size-11 place-items-center lg:hidden"
      >
        <Menu className="size-6" aria-hidden />
      </button>

      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <aside
        aria-label={t("header.menu")}
        aria-hidden={!open}
        inert={!open}
        className={`fixed inset-y-0 start-0 z-50 flex w-[min(340px,88vw)] flex-col bg-bg pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] transition-transform duration-300 lg:hidden ${
          open ? "translate-x-0" : "ltr:-translate-x-full rtl:translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <span className="font-latin text-xl font-extrabold tracking-[0.18em]">MAIIN</span>
          <button type="button" aria-label={t("header.closeMenu")} onClick={() => setOpen(false)} className="grid size-11 place-items-center">
            <X className="size-6" aria-hidden />
          </button>
        </div>
        <ul className="flex-1 overflow-y-auto">
          {categories.map((c) => (
            <li key={c.slug} className="border-b border-line">
              <Link
                href={`/c/${c.slug}`}
                className={`flex items-center justify-between px-4 py-4 text-[17px] font-semibold ${"highlight" in c ? "text-sale" : ""}`}
              >
                {t(`categories.${c.key}`)}
                <ChevronLeft className="size-5 text-muted ltr:rotate-180" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
        <div className="border-t border-line p-4">
          <LanguageSwitcher />
        </div>
      </aside>
    </>
  );
}
