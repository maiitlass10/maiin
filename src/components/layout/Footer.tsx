import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/config";
import { Logo } from "./Logo";

const social = [
  {
    key: "instagram",
    label: "Instagram",
    href: siteConfig.social.instagram,
    path: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm5.5-1.5h.01",
  },
  { key: "facebook", label: "Facebook", href: siteConfig.social.facebook, path: "M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v7h4v-7h3l1-4h-4V8z" },
  { key: "tiktok", label: "TikTok", href: siteConfig.social.tiktok, path: "M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.5 3 2.5 5 5.5 5" },
];

export function Footer() {
  const t = useTranslations("footer");
  const c = useTranslations("categories");

  const columns = [
    { title: t("shop"), links: (["women", "men", "kids", "sale"] as const).map((k) => ({ href: `/c/${k}`, label: c(k) })) },
    {
      title: t("help"),
      links: [
        { href: "/track", label: t("trackOrder") },
        { href: "/shipping", label: t("shipping") },
        { href: "/returns", label: t("returns") },
        { href: "/size-guide", label: t("sizeGuide") },
      ],
    },
    {
      title: t("company"),
      links: [
        { href: "/about", label: t("aboutUs") },
        { href: "/contact", label: t("contact") },
        { href: "/privacy", label: t("privacy") },
        { href: "/terms", label: t("terms") },
      ],
    },
  ];

  return (
    <footer className="gutter mt-16 bg-fg text-bg">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 py-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="col-span-2 lg:col-span-1">
          <Logo inverted />
          <p className="mt-4 max-w-xs text-sm text-bg/70">{t("about")}</p>
          <ul className="mt-5 flex gap-2">
            {social.map((s) => (
              <li key={s.key}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="grid size-10 place-items-center border border-bg/25 transition-colors hover:border-bg"
                >
                  <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d={s.path} />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h2 className="mb-3 text-sm font-bold">{col.title}</h2>
            <ul className="grid gap-2 text-sm text-bg/70">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-bg hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-bg/15 py-5 text-[13px] text-bg/70">
        <span>{t("rights", { year: new Date().getFullYear() })}</span>
        <div className="flex items-center gap-2">
          <span>{t("payWith")}:</span>
          <span className="border border-bg/30 px-2 py-0.5 font-semibold text-bg">{t("cod")}</span>
          <span className="border border-bg/30 px-2 py-0.5 font-semibold text-bg">{t("shamcash")}</span>
        </div>
      </div>
    </footer>
  );
}
