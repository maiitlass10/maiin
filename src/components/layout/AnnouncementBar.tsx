import { getTranslations } from "next-intl/server";
import { getSettings } from "@/lib/data";
import { formatUsd } from "@/lib/format";

export async function AnnouncementBar() {
  const t = await getTranslations();
  const { freeShippingFrom } = await getSettings();
  return (
    <aside aria-label={t("header.announcementLabel")} className="gutter bg-fg py-2 text-center text-[12.5px] font-medium tracking-wide text-bg">
      {t("announcement", { amount: formatUsd(freeShippingFrom) })}
    </aside>
  );
}
