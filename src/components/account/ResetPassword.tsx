"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { browserClient } from "@/lib/supabase/browser";
import { Field, inputClass } from "@/components/admin/ui";

/** Landing page of the "reset password" email: exchanges the link's code for a session, then sets a new password. */
export function ResetPassword() {
  const t = useTranslations("account");
  const router = useRouter();
  const code = useSearchParams().get("code");
  const supabase = useMemo(() => browserClient(), []);
  const [ready, setReady] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) return setReady(false);
      }
      const { data } = await supabase.auth.getUser();
      setReady(!!data.user);
    })();
  }, [code, supabase]);

  if (ready === null) return <div className="h-40" aria-busy="true" />;
  if (!ready)
    return (
      <p className="border border-line p-6 text-center">
        {t("resetInvalid")}{" "}
        <Link href="/account" className="font-bold underline">
          {t("backToSignIn")}
        </Link>
      </p>
    );

  return (
    <form
      className="grid max-w-md gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const password = String(new FormData(e.currentTarget).get("password") ?? "");
        if (password.length < 8) return setMsg({ ok: false, text: t("weak") });
        setBusy(true);
        const { error } = await supabase.auth.updateUser({ password });
        setBusy(false);
        if (error) return setMsg({ ok: false, text: t("genericError", { message: error.message }) });
        setMsg({ ok: true, text: t("passwordChanged") });
        setTimeout(() => router.replace("/account"), 1200);
      }}
    >
      <Field label={t("newPassword")} htmlFor="np" hint={t("passwordHint")}>
        <input id="np" name="password" type="password" autoComplete="new-password" dir="ltr" minLength={8} required className={inputClass} />
      </Field>
      {msg && (
        <p role="status" className={`text-sm font-semibold ${msg.ok ? "text-ok" : "text-sale"}`}>
          {msg.text}
        </p>
      )}
      <button type="submit" disabled={busy} className="h-12 bg-fg font-bold text-bg disabled:opacity-60">
        {busy ? t("working") : t("setPassword")}
      </button>
    </form>
  );
}
