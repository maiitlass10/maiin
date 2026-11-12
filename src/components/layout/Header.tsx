import { useLocale, useTranslations } from "next-intl";
import { Heart, ShoppingBag, User } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Logo } from "./Logo";
import { SearchForm } from "./SearchForm";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { CategoryBar } from "./CategoryBar";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const t = useTranslations("header");
  const locale = useLocale();

  const icons = [
    { href: "/account", label: t("account"), icon: User, hideOnMobile: true },
    { href: "/wishlist", label: t("wishlist"), icon: Heart, hideOnMobile: true },
    { href: "/bag", label: t("bag"), icon: ShoppingBag, count: 0 },
  ];

  return (
    <header className="gutter sticky top-0 z-40 border-b border-line bg-bg">
      <div className="mx-auto flex max-w-7xl items-center gap-3 py-3 lg:gap-8">
        <MobileMenu />
        <Logo />
        <SearchForm locale={locale} className="mx-auto hidden w-full max-w-xl md:flex" />
        <div className="ms-auto flex items-center gap-1 md:ms-0">
          {icons.map(({ href, label, icon: Icon, hideOnMobile, count }) => (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={`relative size-11 place-items-center transition-colors hover:bg-soft ${hideOnMobile ? "hidden sm:grid" : "grid"}`}
            >
              <Icon className="size-[22px]" strokeWidth={1.8} aria-hidden />
              {count !== undefined && (
                <span className="absolute end-1 top-1 grid min-w-[18px] place-items-center rounded-full bg-sale px-1 font-latin text-[11px] font-bold leading-[18px] text-white">
                  {count}
                </span>
              )}
            </Link>
          ))}
          <div className="ms-2 hidden lg:block">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
      <div className="pb-3 md:hidden">
        <SearchForm locale={locale} />
      </div>
      <div className="hidden md:block">
        <CategoryBar />
      </div>
    </header>
  );
}
