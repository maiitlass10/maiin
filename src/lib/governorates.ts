/** Syria's 14 governorates, keys stored on addresses; names live in messages/*.json under "governorates". */
export const GOVERNORATES = ["damascus", "rif-dimashq", "aleppo", "homs", "hama", "latakia", "tartus", "idlib", "daraa", "suwayda", "quneitra", "deir-ez-zor", "raqqa", "hasakah"] as const;
export type Governorate = (typeof GOVERNORATES)[number];

/** Accepts Syrian mobiles like 0944123456, 944123456, +963944123456 or 00963 944 123 456. */
export function isSyrianMobile(raw: string) {
  const d = raw.replace(/[\s-]/g, "").replace(/^(\+|00)963/, "0");
  return /^0?9\d{8}$/.test(d);
}
