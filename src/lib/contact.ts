/** Turns a Syrian number like 0944123456 or +963 944 123 456 into wa.me / tel: forms. */
export function whatsappLink(raw: string, text?: string) {
  const digits = raw.replace(/[^\d+]/g, "").replace(/^(\+|00)?963/, "").replace(/^0/, "");
  return `https://wa.me/963${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function telLink(raw: string) {
  return `tel:${raw.replace(/[^\d+]/g, "")}`;
}
