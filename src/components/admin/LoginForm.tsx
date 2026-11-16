"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { browserClient } from "@/lib/supabase/browser";
import { Field, inputClass } from "./ui";

export function LoginForm() {
  const t = useTranslations("admin.login");
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    const supabase = browserClient();
    const { data, error: err } = await supabase.auth.signInWithPassword({ email: String(form.get("email")).trim(), password: String(form.get("password")) });
    if (err) {
      setBusy(false);
      setError(/confirm/i.test(err.message) ? t("unconfirmed") : t("invalid"));
      return;
    }
    const { data: staff } = await supabase.from("staff").select("role").eq("user_id", data.user.id).maybeSingle();
    if (!staff) {
      await supabase.auth.signOut();
      setBusy(false);
      setError(t("notStaff"));
      return;
    }
    router.replace("/admin");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="grid gap-4" noValidate>
      <Field label={t("email")} htmlFor="email">
        <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} dir="ltr" />
      </Field>
      <Field label={t("password")} htmlFor="password">
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClass} dir="ltr" />
      </Field>
      <p className="min-h-5 text-sm font-semibold text-sale" role="alert">
        {error}
      </p>
      <button type="submit" disabled={busy} className="h-12 bg-fg font-bold text-bg transition-opacity hover:opacity-85 disabled:opacity-60">
        {busy ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
