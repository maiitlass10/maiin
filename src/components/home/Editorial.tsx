import Image from "next/image";
import { useTranslations } from "next-intl";
import { Banknote, Headphones, RefreshCw, Truck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Arrow, EdHeading } from "./EdHeading";
import { HeroSlides } from "./HeroSlides";

const IMG = "/images/editorial";

const btnDark = "inline-flex h-12 items-center justify-center gap-2 btn-3d rounded-full bg-accent text-accent-fg px-7 text-sm font-semibold transition-colors hover:bg-[#ff7d36]";
const btnLight = "btn-3d-ghost inline-flex h-12 items-center justify-center gap-2 rounded-full border border-fg/70 px-7 text-sm font-medium transition-colors hover:bg-fg hover:text-bg";

/**
 * Hero: models (changing slides) stand in front of a giant MAIIN wordmark on a navy stage
 * with a soft orange glow; the service promises sit in a glass bar at the
 * bottom. The wordmark is decorative, the h1 is the line next to it.
 */
export function EditorialHero() {
  const s = useTranslations("ed.service");
  const services = [
    { icon: Truck, k: "delivery" },
    { icon: Banknote, k: "payment" },
    { icon: RefreshCw, k: "exchange" },
    { icon: Headphones, k: "support" },
  ] as const;
  return (
    <section data-depth-root className="band relative isolate overflow-hidden">
      {/* Stage light: warm glow behind the model and a diagonal beam. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_50%_58%,rgb(255_107_26/0.28),transparent_70%),linear-gradient(180deg,#1e2447_0%,#262d5a_55%,#1a1f3d_100%)]" />
      <div aria-hidden data-depth="-0.6" className="absolute -top-1/4 end-[12%] -z-10 h-[150%] w-40 rotate-[24deg] bg-gradient-to-b from-white/10 via-white/[0.04] to-transparent blur-2xl" />

      <div className="relative mx-auto flex min-h-[680px] max-w-7xl flex-col md:min-h-[720px]">
        {/* Giant wordmark, behind the model. */}
        <div aria-hidden data-depth="0.35" className="pointer-events-none absolute inset-x-0 top-8 md:top-[16%]">
        <p
          dir="ltr"
          className="hero-in select-none text-center font-display text-[25vw] font-medium leading-none tracking-[0.04em] text-fg md:text-[min(20vw,260px)]"
        >
          MA<span className="text-transparent [-webkit-text-stroke:1.5px_var(--fg)]">II</span>N
        </p>
        </div>

        {/* Changing part: model in front of the wordmark, copy and controls. */}
        <HeroSlides btnDark={btnDark} btnLight={btnLight} />

        {/* Glass bar with the service promises. */}
        <ul
          aria-label={s("label")}
          className="hero-in [animation-delay:.45s] relative z-10 mx-4 mb-6 mt-2 grid grid-cols-2 overflow-hidden rounded-3xl border border-white/15 bg-white/[0.07] backdrop-blur-md md:absolute md:inset-x-8 md:bottom-8 md:mx-0 md:mb-0 md:grid-cols-4"
        >
          {services.map(({ icon: Icon, k }, i) => (
            <li key={k} className={`flex items-center gap-3 px-4 py-4 ${i % 2 ? "border-s border-white/10" : ""} ${i > 1 ? "border-t border-white/10 md:border-t-0" : ""} ${i === 2 ? "md:border-s" : ""}`}>
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
                <Icon className="size-[18px]" strokeWidth={1.6} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold leading-5">{s(k)}</span>
                <span className="block text-[11.5px] leading-4 text-muted">{s(`${k}Text`)}</span>
              </span>
            </li>
          ))}
        </ul>
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
            <li key={x.key} data-reveal>
              <Link href={x.href} data-tilt className="group relative block aspect-[4/3] overflow-hidden rounded-3xl bg-soft sm:aspect-[3/4]">
                <Image src={`${IMG}/${x.img}.webp`} alt="" fill sizes="(min-width:640px) 33vw, 100vw" className="object-cover object-[center_30%] transition-transform duration-700 group-hover:scale-[1.04]" />
                <div className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-2xl bg-bg/95 px-4 py-3 shadow-sm">
                  <div>
                    <h3 className="font-display text-xl font-medium">{t(`${x.key}`)}</h3>
                    <p className="text-xs text-muted">{t(`${x.key}Sub`)}</p>
                  </div>
                  <span className="grid size-10 place-items-center rounded-full border border-line transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-accent-fg">
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
          <Link data-reveal data-tilt="4" href="/c/tops" className="group relative block aspect-[4/5] overflow-hidden rounded-3xl bg-soft md:col-span-2 md:row-span-2 md:aspect-auto">
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
          <Link data-reveal data-tilt="5" href="/c/dresses" className="group relative block aspect-[5/4] overflow-hidden rounded-3xl bg-soft md:col-span-2 md:aspect-auto">
            <Image src={`${IMG}/dresses.webp`} alt="" fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
            <div className="absolute bottom-4 start-4 rounded-2xl bg-bg/95 px-4 py-3 shadow-sm">
              <h3 className="font-display text-xl font-medium">{t("dresses")}</h3>
              <p className="text-xs text-muted">{t("dressesSub")}</p>
            </div>
          </Link>
          <Link data-reveal data-tilt href="/c/bottoms" className="group relative block aspect-square overflow-hidden rounded-3xl bg-sand md:aspect-auto">
            <Image src={`${IMG}/cat-jeans.webp`} alt="" fill sizes="(min-width:768px) 25vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
            <div className="absolute bottom-4 start-4 rounded-2xl bg-bg/95 px-4 py-3 shadow-sm">
              <h3 className="font-display text-xl font-medium">{t("denim")}</h3>
            </div>
          </Link>
          <Link data-reveal data-tilt href="/c/sale" className="band group relative flex aspect-square flex-col rounded-3xl justify-end overflow-hidden p-6 md:aspect-auto">
            <Image src={`${IMG}/sale.webp`} alt="" fill sizes="(min-width:768px) 25vw, 100vw" className="object-cover object-[70%_center] opacity-60 transition-transform duration-700 group-hover:scale-[1.03]" />
            <div className="relative">
              <p className="text-xs uppercase tracking-[0.2em] text-accent">{t("saleKicker")}</p>
              <p className="mt-1 font-display text-4xl font-medium">{t("sale")}</p>
              <span className="mt-3 inline-flex items-center gap-2 border-b border-accent pb-0.5 text-sm">
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
            <li key={x.key} data-reveal className="w-[70%] shrink-0 snap-start sm:w-[42%] md:w-auto">
              <Link href={x.href} className="group block">
                <div data-tilt className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-sand">
                  <Image src={`${IMG}/${x.img}.webp`} alt="" fill sizes="(min-width:768px) 25vw, 70vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                  <span className="absolute start-3 top-3 rounded-full bg-bg px-2.5 py-0.5 font-latin text-[11px] font-medium tracking-wider">0{i + 1}</span>
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
      <div className="band relative mx-auto grid max-w-7xl overflow-hidden rounded-3xl md:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto md:min-h-[440px]">
          <Image data-parallax src={`${IMG}/wardrobe.webp`} alt={t("alt")} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div data-reveal className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
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
