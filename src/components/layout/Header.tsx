import { useLocale, useTranslations } from "next-intl";
import { Heart, Search, ShoppingBag, User } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Logo } from "./Logo";
import { SearchForm } from "./SearchForm";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { CategoryBar } from "./CategoryBar";
import { MobileMenu } from "./MobileMenu";
import { BagCount } from "@/components/store/BagCount";

const MAIN = ["new", "women", "men", "kids", "sale"] as const;

export function Header() {
  const t = useTranslations("header");
  const c = useTranslations("categories");
  const locale = useLocale();

  const icons = [
    { href: "/search", label: t("search"), icon: Search, hideOnMobile: false, desktopOnly: true },
    { href: "/account", label: t("account"), icon: User, hideOnMobile: true },
    { href: "/wishlist", label: t("wishlist"), icon: Heart, hideOnMobile: true },
    { href: "/bag", label: t("bag"), icon: ShoppingBag, count: true },
  ];

  return (
    <header className="gutter sticky top-0 z-40 border-b border-line bg-bg/95 backdrop-blur supports-[backdrop-filter]:bg-bg/85">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-3 py-2.5">
        <div className="flex items-center gap-1">
          <MobileMenu />
          <nav aria-label={t("mainNav")} className="hidden lg:block">
            <ul className="flex items-center gap-6 text-[14px] font-medium">
              {MAIN.map((k) => (
                <li key={k}>
                  <Link
                    href={`/c/${k}`}
                    className={`inline-flex min-h-11 items-center border-b border-transparent transition-colors hover:border-current ${k === "sale" ? "text-sale" : ""}`}
                  >
                    {c(k)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <Logo center />
        <div className="flex items-center justify-end gap-0.5">
          {icons.map(({ href, label, icon: Icon, hideOnMobile, count, desktopOnly }) => (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={`relative size-11 place-items-center transition-colors hover:bg-soft ${desktopOnly ? "hidden md:grid" : hideOnMobile ? "hidden sm:grid" : "grid"}`}
            >
              <Icon className="size-[21px]" strokeWidth={1.5} aria-hidden />
              {count && <BagCount />}
            </Link>
          ))}
          <div className="ms-2 hidden lg:block">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
      <div className="pb-3 md:hidden">
        <SearchForm locale={locale} id="site-search-mobile" />
      </div>
      <div className="hidden md:block lg:hidden">
        <CategoryBar />
      </div>
    </header>
  );
}
