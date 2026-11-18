import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSettings } from "@/lib/data";
import { whatsappLink } from "@/lib/contact";
import { Logo } from "./Logo";

const ICONS = {
  instagram: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm5.5-1.5h.01",
  facebook: "M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v7h4v-7h3l1-4h-4V8z",
  tiktok: "M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.5 3 2.5 5 5.5 5",
  whatsapp: "M4 20l1.3-4A8 8 0 1 1 8 18.7z",
};

export async function Footer() {
  const t = await getTranslations("footer");
  const c = await getTranslations("categories");
  const s = await getSettings();
  const social = [
    { key: "whatsapp", label: "WhatsApp", href: s.whatsapp ? whatsappLink(s.whatsapp) : null },
    { key: "instagram", label: "Instagram", href: s.instagram },
    { key: "facebook", label: "Facebook", href: s.facebook },
    { key: "tiktok", label: "TikTok", href: s.tiktok },
  ].filter((x): x is { key: keyof typeof ICONS; label: string; href: string } => !!x.href);

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
    <footer className="gutter border-t border-line bg-soft text-fg">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 py-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="col-span-2 lg:col-span-1">
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted">{t("about")}</p>
          {social.length > 0 && (
          <ul className="mt-5 flex gap-2">
            {social.map((s) => (
              <li key={s.key}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="grid size-10 place-items-center border border-line bg-bg transition-colors hover:border-fg"
                >
                  <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d={ICONS[s.key]} />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
          )}
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h2 className="mb-3 font-display text-base font-medium">{col.title}</h2>
            <ul className="grid text-sm text-muted">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-flex min-h-11 items-center hover:text-fg hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-line py-5 text-[13px] text-muted">
        <span>{t("rights", { year: new Date().getFullYear() })}</span>
        <div className="flex items-center gap-2">
          <span>{t("payWith")}:</span>
          <span className="border border-line bg-bg px-2 py-0.5 font-medium text-fg">{t("cod")}</span>
          <span className="border border-line bg-bg px-2 py-0.5 font-medium text-fg">{t("shamcash")}</span>
        </div>
      </div>
    </footer>
  );
}
