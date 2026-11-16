import { getTranslations } from "next-intl/server";
import { getSettings } from "@/lib/data";
import { formatUsd } from "@/lib/format";

export async function AnnouncementBar() {
  const t = await getTranslations();
  const { freeShippingFrom } = await getSettings();
  return (
    <div className="gutter bg-fg py-2 text-center text-[13px] font-semibold text-bg">
      {t("announcement", { amount: formatUsd(freeShippingFrom) })}
    </div>
  );
}
