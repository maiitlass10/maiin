import { useTranslations } from "next-intl";
import { siteConfig } from "@/lib/config";
import { formatUsd } from "@/lib/format";

export function AnnouncementBar() {
  const t = useTranslations();
  return (
    <div className="gutter bg-fg py-2 text-center text-[13px] font-semibold text-bg">
      {t("announcement", { amount: formatUsd(siteConfig.freeShippingFrom) })}
    </div>
  );
}
