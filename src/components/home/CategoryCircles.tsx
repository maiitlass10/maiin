import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const items = [
  { slug: "women", image: "/images/products/w1.webp" },
  { slug: "men", image: "/images/products/m18.webp" },
  { slug: "kids", image: "/images/products/k1.webp" },
  { slug: "dresses", image: "/images/products/w2.webp" },
  { slug: "tops", image: "/images/products/m1.webp" },
  { slug: "outerwear", image: "/images/products/m9.webp" },
  { slug: "bottoms", image: "/images/products/w8.webp" },
  { slug: "shoes", image: "/images/products/a2.webp" },
  { slug: "bags", image: "/images/products/a1.webp" },
] as const;

export function CategoryCircles() {
  const t = useTranslations();
  return (
    <section id="categories" className="gutter scroll-mt-32 py-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-4 text-xl font-black sm:text-2xl">{t("home.shopByCategory")}</h2>
        <ul className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-9 sm:gap-3 sm:px-0">
          {items.map((c) => (
            <li key={c.slug} className="w-[22vw] max-w-24 shrink-0 sm:w-auto sm:max-w-none">
              <Link href={`/c/${c.slug}`} className="group block text-center">
                <span className="relative block aspect-square overflow-hidden rounded-full bg-soft ring-1 ring-line transition group-hover:ring-2 group-hover:ring-fg">
                  <Image src={c.image} alt="" fill sizes="(min-width:640px) 130px, 22vw" className="object-cover" />
                </span>
                <span className="mt-2 block truncate text-[13px] font-semibold sm:text-sm">{t(`categories.${c.slug}`)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
