import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { currentStaff } from "@/lib/supabase/server";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (await currentStaff()) redirect({ href: "/admin", locale });
  const t = await getTranslations("admin.login");
  return (
    <div className="gutter grid min-h-dvh place-items-center py-10">
      <div className="w-full max-w-sm border border-line bg-bg p-6 sm:p-8">
        <p className="font-latin text-2xl font-extrabold tracking-[0.18em]">MAIIN</p>
        <h1 className="mt-4 text-xl font-black">{t("title")}</h1>
        <p className="mb-6 mt-1 text-sm text-muted">{t("text")}</p>
        <LoginForm />
      </div>
    </div>
  );
}
