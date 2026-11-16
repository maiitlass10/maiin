"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, Heart, LogOut, MapPin, Package, ShoppingBag } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { browserClient } from "@/lib/supabase/browser";
import { useStore } from "@/components/store/StoreProvider";
import { Field, inputClass } from "@/components/admin/ui";
import { AuthForms } from "./AuthForms";

export function AccountView() {
  const t = useTranslations("account");
  const router = useRouter();
  const next = useSearchParams().get("next");
  const { user, authReady, bagCount, wishlist, toast } = useStore();
  const supabase = useMemo(() => browserClient(), []);
  const [profile, setProfile] = useState({ full_name: "", phone: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfile({ full_name: data?.full_name ?? "", phone: data?.phone ?? "" }));
  }, [user, supabase]);

  if (!authReady) return <div className="h-64" aria-busy="true" />;

  if (!user)
    return (
      <AuthForms
        onDone={() => {
          // Only follow same-site relative paths after sign-in.
          if (next && next.startsWith("/") && !next.startsWith("//")) router.replace(next);
          router.refresh();
        }}
      />
    );

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({ user_id: user.id, full_name: profile.full_name.trim().slice(0, 120), phone: profile.phone.trim().slice(0, 30) });
    setSaving(false);
    toast(error ? t("genericError", { message: error.message }) : t("saved"));
  };

  const links = [
    { href: "/account/orders", label: t("orders"), icon: Package },
    { href: "/account/addresses", label: t("addresses"), icon: MapPin },
    { href: "/wishlist", label: t("wishlist"), icon: Heart, count: wishlist.length },
    { href: "/bag", label: t("bag"), icon: ShoppingBag, count: bagCount },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div>
        <p className="text-lg font-black">{t("welcome", { name: profile.full_name || user.email?.split("@")[0] || "" })}</p>
        <p className="text-sm text-muted" dir="ltr">
          {user.email}
        </p>
        <ul className="mt-5 divide-y divide-line border-y border-line">
          {links.map(({ href, label, icon: Icon, count }) => (
            <li key={href}>
              <Link href={href} className="flex h-14 items-center gap-3 font-semibold hover:bg-soft">
                <Icon className="size-5" strokeWidth={1.7} aria-hidden />
                <span className="flex-1">{label}</span>
                {!!count && <span className="grid min-w-6 place-items-center rounded-full bg-fg px-1.5 font-latin text-xs text-bg">{count}</span>}
                <ChevronLeft className="size-4 text-muted ltr:rotate-180" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={async () => {
            await supabase.auth.signOut();
            router.refresh();
          }}
          className="mt-5 flex h-11 items-center gap-2 text-sm font-semibold text-muted hover:text-fg"
        >
          <LogOut className="size-4 flip-rtl" aria-hidden />
          {t("signOut")}
        </button>
      </div>
      <form onSubmit={save} className="grid h-max gap-4 border border-line p-5">
        <h2 className="text-base font-black">{t("profile")}</h2>
        <Field label={t("fullName")} htmlFor="p-name">
          <input id="p-name" value={profile.full_name} onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))} autoComplete="name" className={inputClass} maxLength={120} />
        </Field>
        <Field label={t("phone")} htmlFor="p-phone">
          <input id="p-phone" type="tel" dir="ltr" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} autoComplete="tel" className={inputClass} maxLength={30} />
        </Field>
        <button type="submit" disabled={saving} className="h-12 bg-fg font-bold text-bg disabled:opacity-60">
          {saving ? t("working") : t("save")}
        </button>
      </form>
    </div>
  );
}
