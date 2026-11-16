import { getTranslations, setRequestLocale } from "next-intl/server";
import { ExternalLink, LogOut } from "lucide-react";
import { Link, redirect } from "@/i18n/navigation";
import { currentStaff } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/AdminNav";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { signOut } from "../actions";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const staff = await currentStaff();
  if (!staff) redirect({ href: "/admin/login", locale });
  const t = await getTranslations("admin");

  async function doSignOut() {
    "use server";
    await signOut();
    redirect({ href: "/admin/login", locale });
  }

  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="sticky top-0 z-30 border-b border-line bg-bg lg:h-dvh lg:border-b-0 lg:border-e">
        <div className="gutter flex items-center justify-between gap-3 py-3 lg:block lg:px-4 lg:py-5">
          <div>
            <p className="font-latin text-xl font-extrabold tracking-[0.18em]">MAIIN</p>
            <p className="text-xs text-muted">{t("title")}</p>
          </div>
          <div className="flex items-center gap-1 lg:hidden">
            <LanguageSwitcher />
          </div>
        </div>
        <div className="gutter pb-2 lg:px-3">
          <AdminNav />
        </div>
        <div className="hidden gap-1 border-t border-line p-3 lg:absolute lg:inset-x-0 lg:bottom-0 lg:grid">
          <p className="truncate px-3 pb-1 text-xs text-muted" dir="ltr">
            {staff!.user.email}
          </p>
          <Link href="/" className="flex h-10 items-center gap-2 px-3 text-sm hover:bg-soft">
            <ExternalLink className="size-4" aria-hidden />
            {t("store")}
          </Link>
          <form action={doSignOut}>
            <button className="flex h-10 w-full items-center gap-2 px-3 text-sm hover:bg-soft">
              <LogOut className="size-4 flip-rtl" aria-hidden />
              {t("signOut")}
            </button>
          </form>
          <div className="px-3 pt-1">
            <LanguageSwitcher />
          </div>
        </div>
      </aside>
      <main className="gutter min-w-0 py-6 lg:px-8">
        {children}
        <form action={doSignOut} className="mt-10 flex justify-center lg:hidden">
          <button className="flex h-11 items-center gap-2 border border-line bg-bg px-5 text-sm">
            <LogOut className="size-4 flip-rtl" aria-hidden />
            {t("signOut")}
          </button>
        </form>
      </main>
    </div>
  );
}
