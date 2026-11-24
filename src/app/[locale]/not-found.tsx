import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <section className="gutter py-24 text-center">
      <h1 className="font-display text-3xl font-medium">{t("title")}</h1>
      <p className="mt-2 text-muted">{t("text")}</p>
      <Link href="/" className="btn-3d mt-8 inline-flex h-12 items-center rounded-full bg-accent px-8 font-bold text-accent-fg">
        {t("back")}
      </Link>
    </section>
  );
}
