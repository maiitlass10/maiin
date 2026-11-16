"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { browserClient } from "@/lib/supabase/browser";
import { Field, inputClass } from "@/components/admin/ui";

type Mode = "signIn" | "register" | "forgot";

function errorKey(message: string) {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "invalid";
  if (m.includes("not confirmed")) return "unconfirmed";
  if (m.includes("already registered") || m.includes("already exists")) return "exists";
  if (m.includes("password")) return "weak";
  if (m.includes("rate") || m.includes("security purposes")) return "rateLimit";
  if (m.includes("email") && m.includes("invalid")) return "invalidEmail";
  return null;
}

/** Customer sign in, registration and password reset, all with email and password. */
export function AuthForms({ onDone }: { onDone: () => void }) {
  const t = useTranslations("account");
  const locale = useLocale();
  const [mode, setMode] = useState<Mode>("signIn");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const fail = (message: string) => {
    const k = errorKey(message);
    setError(k ? t(k) : t("genericError", { message }));
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "").trim();
    const password = String(f.get("password") ?? "");
    setError(null);
    setInfo(null);
    if (!email) return setError(t("invalidEmail"));
    if (mode !== "forgot" && password.length < 8) return setError(t("weak"));
    setBusy(true);
    const supabase = browserClient();
    try {
      if (mode === "signIn") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return fail(error.message);
        onDone();
      } else if (mode === "register") {
        const fullName = String(f.get("fullName") ?? "").trim();
        if (!fullName) return setError(t("required"));
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, phone: String(f.get("phone") ?? "").trim() }, emailRedirectTo: `${window.location.origin}/${locale}/account` },
        });
        if (error) return fail(error.message);
        // Supabase returns a user with no identities when the email is already registered.
        if (data.user && data.user.identities?.length === 0) return setError(t("exists"));
        if (data.session) onDone();
        else setInfo(t("checkEmail"));
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/${locale}/account/reset-password` });
        if (error) return fail(error.message);
        setInfo(t("resetSent"));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      {mode !== "forgot" && (
        <div role="tablist" className="mb-6 grid grid-cols-2 border border-line">
          {(["signIn", "register"] as const).map((m) => (
            <button key={m} role="tab" type="button" aria-selected={mode === m} onClick={() => (setMode(m), setError(null), setInfo(null))} className={`h-12 font-bold ${mode === m ? "bg-fg text-bg" : ""}`}>
              {t(m === "signIn" ? "signInTab" : "registerTab")}
            </button>
          ))}
        </div>
      )}
      <form onSubmit={submit} noValidate className="grid gap-4">
        {mode === "register" && (
          <>
            <Field label={t("fullName")} htmlFor="a-name">
              <input id="a-name" name="fullName" autoComplete="name" required className={inputClass} maxLength={120} />
            </Field>
            <Field label={t("phone")} htmlFor="a-phone">
              <input id="a-phone" name="phone" type="tel" autoComplete="tel" dir="ltr" className={inputClass} maxLength={30} placeholder="09xx xxx xxx" />
            </Field>
          </>
        )}
        <Field label={t("email")} htmlFor="a-email">
          <input id="a-email" name="email" type="email" autoComplete="email" dir="ltr" required className={inputClass} />
        </Field>
        {mode !== "forgot" && (
          <Field label={t("password")} htmlFor="a-pass" hint={mode === "register" ? t("passwordHint") : undefined}>
            <input id="a-pass" name="password" type="password" autoComplete={mode === "register" ? "new-password" : "current-password"} dir="ltr" required minLength={8} className={inputClass} />
          </Field>
        )}
        {error && (
          <p className="text-sm font-semibold text-sale" role="alert">
            {error}
          </p>
        )}
        {info && (
          <p className="bg-soft p-3 text-sm font-semibold" role="status">
            {info}
          </p>
        )}
        <button type="submit" disabled={busy} className="h-12 bg-fg font-bold text-bg transition-opacity hover:opacity-85 disabled:opacity-60">
          {busy ? t("working") : mode === "signIn" ? t("signIn") : mode === "register" ? t("register") : t("sendReset")}
        </button>
        {mode === "signIn" && (
          <button type="button" onClick={() => (setMode("forgot"), setError(null), setInfo(null))} className="h-11 text-sm underline underline-offset-2">
            {t("forgot")}
          </button>
        )}
        {mode === "forgot" && (
          <button type="button" onClick={() => (setMode("signIn"), setError(null), setInfo(null))} className="h-11 text-sm underline underline-offset-2">
            {t("backToSignIn")}
          </button>
        )}
      </form>
      <p className="mt-6 text-center text-sm text-muted">{t("why")}</p>
    </div>
  );
}
