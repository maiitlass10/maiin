"use client";

import { createContext, useContext } from "react";
import { useTranslations } from "next-intl";
import { Lock } from "lucide-react";
import { Link } from "@/i18n/navigation";

export type StaffRole = "owner" | "editor";

const RoleContext = createContext<StaffRole>("editor");

/** Shares the signed-in staff member's role with the admin screens. */
export function StaffRoleProvider({ role, children }: { role: StaffRole; children: React.ReactNode }) {
  return <RoleContext.Provider value={role}>{children}</RoleContext.Provider>;
}

/** True for the owner. Screens use it to hide owner-only buttons; the database enforces the same rule. */
export function useIsOwner() {
  return useContext(RoleContext) === "owner";
}

/** Shown instead of an owner-only page when a staff member opens it. */
export function OwnerOnlyNotice() {
  const t = useTranslations("admin.ownerOnly");
  const tn = useTranslations("admin.nav");
  return (
    <section className="mx-auto max-w-lg py-16 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-soft">
        <Lock className="size-6" aria-hidden />
      </span>
      <h1 className="mt-5 text-2xl font-bold">{t("title")}</h1>
      <p className="mt-2 text-sm leading-6 text-muted">{t("text")}</p>
      <Link href="/admin" className="mt-6 inline-flex h-11 items-center border border-line bg-bg px-5 font-semibold">
        {tn("dashboard")}
      </Link>
    </section>
  );
}
