import Image from "next/image";
import { useTranslations } from "next-intl";
import { Banknote, Headphones, RefreshCw, Truck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Arrow, EdHeading } from "./EdHeading";

const IMG = "/images/editorial";

const btnDark = "inline-flex h-12 items-center justify-center gap-2 bg-fg px-7 text-sm font-medium text-bg transition-opacity hover:opacity-85";
const btnLight = "inline-flex h-12 items-center justify-center gap-2 border border-fg/70 px-7 text-sm font-medium transition-colors hover:bg-fg hover:text-bg";

export function EditorialHero() {
  const t = useTranslations("ed.hero");
  return (
    <section className="relative bg-[#e3b89d]">
      <div className="mx-auto flex max-w-7xl flex-col md:block md:min-h-[600px]">
        <div className="gutter order-2 flex flex-col justify-center py-10 md:min-h-[600px] md:w-1/2 md:py-16 md:ps-10 lg:ps-16">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.25em] text-fg/70">{t("kicker")}</p>
          <h1 className="font-display text-[40px] font-medium leading-[1.15] sm:text-[54px] lg:text-[64px]">
            {t("title1")}
            <br />
            <span className="font-normal text-fg/80 ltr:italic">{t("title2")}</span>
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-7 text-fg/75">{t("text")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/c/new" className={btnDark}>
              {t("cta")}
              <Arrow />
            </Link>
            <Link href="/c/women" className={btnLight}>
              {t("cta2")}
            </Link>
          </div>
          <dl className="mt-10 flex gap-8 border-t border-fg/15 pt-5 text-sm">
            {(["s1", "s2", "s3"] as const).map((k) => (
              <div key={k}>
                <dt className="font-display text-2xl font-medium">{t(`${k}n`)}</dt>
                <dd className="text-xs text-fg/70">{t(`${k}t`)}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative order-1 aspect-[4/5] md:absolute md:inset-y-0 md:end-0 md:aspect-auto md:w-1/2">
          <Image src={`${IMG}/hero.webp`} alt={t("alt")} fill priority sizes="(min-width:768px) 50vw, 100vw" className="object-cover object-top" />
        </div>
      </div>
    </section>
  );
}

export function ShopTiles() {
  const t = useTranslations("ed.tiles");
  const tiles = [
    { key: "women", href: "/c/women", img: "women" },
    { key: "men", href: "/c/men", img: "men" },
    { key: "acc", href: "/c/bags", img: "accessories" },
  ] as const;
  return (
    <section className="gutter py-12 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <EdHeading kicker={t("kicker")} title={t("title")} />
        <ul className="grid gap-4 sm:grid-cols-3">
          {tiles.map((x) => (
            <li key={x.key}>
              <Link href={x.href} className="group relative block aspect-[4/3] overflow-hidden bg-soft sm:aspect-[3/4]">
                <Image src={`${IMG}/${x.img}.webp`} alt="" fill sizes="(min-width:640px) 33vw, 100vw" className="object-cover object-[center_30%] transition-transform duration-700 group-hover:scale-[1.04]" />
                <div className="absolute inset-x-3 bottom-3 flex items-center justify-between bg-bg/95 px-4 py-3">
                  <div>
                    <h3 className="font-display text-xl font-medium">{t(`${x.key}`)}</h3>
                    <p className="text-xs text-muted">{t(`${x.key}Sub`)}</p>
                  </div>
                  <span className="grid size-10 place-items-center border border-line transition-colors group-hover:border-fg group-hover:bg-fg group-hover:text-bg">
                    <Arrow />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function LookBento() {
  const t = useTranslations("ed.bento");
  return (
    <section className="gutter py-12 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <EdHeading kicker={t("kicker")} title={t("title")} />
        <div className="grid gap-4 md:grid-cols-4 md:grid-rows-2 md:[height:640px]">
          <Link href="/c/tops" className="group relative block aspect-[4/5] overflow-hidden bg-soft md:col-span-2 md:row-span-2 md:aspect-auto">
            <Image src={`${IMG}/knit.webp`} alt="" fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" aria-hidden />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-white/80">{t("knitKicker")}</p>
              <h3 className="mt-1 font-display text-3xl font-medium sm:text-4xl">{t("knit")}</h3>
              <span className="mt-4 inline-flex items-center gap-2 border-b border-white/60 pb-0.5 text-sm">
                {t("shop")}
                <Arrow />
              </span>
            </div>
          </Link>
          <Link href="/c/dresses" className="group relative block aspect-[5/4] overflow-hidden bg-soft md:col-span-2 md:aspect-auto">
            <Image src={`${IMG}/dresses.webp`} alt="" fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
            <div className="absolute bottom-4 start-4 bg-bg/95 px-4 py-3">
              <h3 className="font-display text-xl font-medium">{t("dresses")}</h3>
              <p className="text-xs text-muted">{t("dressesSub")}</p>
            </div>
          </Link>
          <Link href="/c/bottoms" className="group relative block aspect-square overflow-hidden bg-sand md:aspect-auto">
            <Image src={`${IMG}/cat-jeans.webp`} alt="" fill sizes="(min-width:768px) 25vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
            <div className="absolute bottom-4 start-4 bg-bg/95 px-4 py-3">
              <h3 className="font-display text-xl font-medium">{t("denim")}</h3>
            </div>
          </Link>
          <Link href="/c/sale" className="group relative flex aspect-square flex-col justify-end overflow-hidden bg-fg p-6 text-bg md:aspect-auto">
            <Image src={`${IMG}/sale.webp`} alt="" fill sizes="(min-width:768px) 25vw, 100vw" className="object-cover object-[70%_center] opacity-60 transition-transform duration-700 group-hover:scale-[1.03]" />
            <div className="relative">
              <p className="text-xs uppercase tracking-[0.2em] text-bg/80">{t("saleKicker")}</p>
              <p className="mt-1 font-display text-4xl font-medium">{t("sale")}</p>
              <span className="mt-3 inline-flex items-center gap-2 border-b border-bg/60 pb-0.5 text-sm">
                {t("shop")}
                <Arrow />
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Essentials() {
  const t = useTranslations("ed.essentials");
  const items = [
    { key: "shirts", href: "/c/tops", img: "cap-shirts" },
    { key: "denim", href: "/c/bottoms", img: "cap-denim" },
    { key: "jackets", href: "/c/outerwear", img: "cap-jackets" },
    { key: "basics", href: "/c/men", img: "cap-basics" },
  ] as const;
  return (
    <section className="gutter bg-soft py-12 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <EdHeading kicker={t("kicker")} title={t("title")} href="/c/new" linkLabel={t("all")} />
        <ul tabIndex={0} aria-label={t("title")} className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-4 md:px-0">
          {items.map((x, i) => (
            <li key={x.key} className="w-[70%] shrink-0 snap-start sm:w-[42%] md:w-auto">
              <Link href={x.href} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden bg-sand">
                  <Image src={`${IMG}/${x.img}.webp`} alt="" fill sizes="(min-width:768px) 25vw, 70vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                  <span className="absolute start-3 top-3 bg-bg px-2 py-0.5 font-latin text-[11px] font-medium tracking-wider">0{i + 1}</span>
                </div>
                <div className="flex items-center justify-between pt-3">
                  <h3 className="font-display text-lg font-medium">{t(x.key)}</h3>
                  <Arrow />
                </div>
                <p className="text-xs text-muted">{t(`${x.key}Sub`)}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function WardrobeBanner() {
  const t = useTranslations("ed.wardrobe");
  return (
    <section className="gutter py-12 sm:py-16">
      <div className="relative mx-auto grid max-w-7xl overflow-hidden bg-sand md:grid-cols-2">
        <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[440px]">
          <Image src={`${IMG}/wardrobe.webp`} alt={t("alt")} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-fg/75">{t("kicker")}</p>
          <h2 className="font-display text-[32px] font-medium leading-tight sm:text-[42px]">{t("title")}</h2>
          <p className="mt-4 max-w-md text-[15px] leading-7 text-fg/75">{t("text")}</p>
          <div className="mt-7">
            <Link href="/c/new" className={btnDark}>
              {t("cta")}
              <Arrow />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ServiceStrip() {
  const t = useTranslations("ed.service");
  const items = [
    { icon: Truck, k: "delivery" },
    { icon: Banknote, k: "payment" },
    { icon: RefreshCw, k: "exchange" },
    { icon: Headphones, k: "support" },
  ] as const;
  return (
    <section className="gutter border-y border-line">
      <ul aria-label={t("label")} className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, k }, i) => (
          <li key={k} className={`flex flex-col items-center gap-2 px-3 py-8 text-center ${i % 2 ? "border-s border-line" : ""} ${i > 1 ? "border-t border-line lg:border-t-0" : ""} ${i === 2 ? "lg:border-s" : ""}`}>
            <Icon className="size-7" strokeWidth={1.2} aria-hidden />
            <p className="font-display text-base font-medium">{t(k)}</p>
            <p className="text-xs text-muted">{t(`${k}Text`)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
