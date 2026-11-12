import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <section className="gutter py-24 text-center">
      <h1 className="text-3xl font-black">{t("title")}</h1>
      <p className="mt-2 text-muted">{t("text")}</p>
      <Link href="/" className="mt-8 inline-flex h-12 items-center bg-fg px-8 font-bold text-bg">
        {t("back")}
      </Link>
    </section>
  );
}
