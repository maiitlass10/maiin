import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import "@fontsource-variable/cairo";
import "@fontsource-variable/inter";
import "@fontsource-variable/playfair-display";
import "@fontsource-variable/el-messiri";
import "../globals.css";
import { localeDirection, routing } from "@/i18n/routing";
import { SettingsProvider } from "@/components/store/SettingsProvider";
import { getSettings } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("title"), template: `%s | MAIIN` },
    description: t("description"),
    applicationName: "MAIIN",
    alternates: { canonical: `/${locale}`, languages: { ar: "/ar", en: "/en" } },
    icons: { icon: "/icon.svg", apple: "/icon.svg" },
    openGraph: { type: "website", siteName: "MAIIN", locale: locale === "ar" ? "ar_SY" : "en_US", title: t("title"), description: t("description") },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const settings = await getSettings();

  return (
    <html lang={locale} dir={localeDirection[locale]}>
      <body className="min-h-dvh">
        <NextIntlClientProvider>
          <SettingsProvider value={settings}>{children}</SettingsProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
