"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { updateOrder } from "@/app/[locale]/admin/actions";

const STATUSES = ["new", "confirmed", "preparing", "shipped", "delivered"] as const;

export function OrderActions({ id, status, paymentStatus, paymentMethod }: { id: string; status: string; paymentStatus: string; paymentMethod: string }) {
  const t = useTranslations("admin.orders");
  const to = useTranslations("orders");
  const tf = useTranslations("admin.form");
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const run = (patch: { status?: string; payment_status?: string }) =>
    start(async () => {
      const r = await updateOrder(id, patch);
      setMsg(r.ok ? { ok: true, text: t("updated") } : { ok: false, text: tf("error", { message: r.error }) });
      setConfirmCancel(false);
      router.refresh();
    });

  return (
    <div className="grid gap-4">
      {paymentStatus !== "paid" ? (
        <button type="button" disabled={pending || status === "cancelled"} onClick={() => run({ payment_status: "paid" })} className="h-12 bg-ok font-bold text-white disabled:opacity-50">
          {t("confirmPayment")}
        </button>
      ) : (
        <button type="button" disabled={pending} onClick={() => run({ payment_status: paymentMethod === "shamcash" ? "awaiting_confirmation" : "unpaid" })} className="h-11 border border-line text-sm font-semibold">
          {t("markUnpaid")}
        </button>
      )}
      <fieldset disabled={pending || status === "cancelled"}>
        <legend className="mb-2 text-sm font-bold">{t("setStatus")}</legend>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button key={s} type="button" aria-pressed={status === s} onClick={() => run({ status: s })} className={`h-10 border px-3 text-sm font-semibold disabled:opacity-50 ${status === s ? "border-fg bg-fg text-bg" : "border-line bg-bg"}`}>
              {to(`status_${s}`)}
            </button>
          ))}
        </div>
      </fieldset>
      {status !== "cancelled" &&
        (confirmCancel ? (
          <div className="flex items-center gap-2 text-sm">
            {t("confirmCancel")}
            <button type="button" onClick={() => run({ status: "cancelled" })} className="h-10 bg-sale px-3 font-bold text-white">
              {tf("confirmYes")}
            </button>
            <button type="button" onClick={() => setConfirmCancel(false)} className="h-10 border border-line px-3">
              {tf("cancel")}
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmCancel(true)} className="h-11 border border-sale text-sm font-bold text-sale">
            {t("cancel")}
          </button>
        ))}
      {msg && (
        <p role="status" className={`text-sm font-semibold ${msg.ok ? "text-ok" : "text-sale"}`}>
          {msg.text}
        </p>
      )}
    </div>
  );
}
