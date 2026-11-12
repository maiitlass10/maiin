/**
 * Store-wide settings. Values marked "admin" move to the database in Sprint 3,
 * where the company edits them from the admin panel.
 */
export const siteConfig = {
  name: "MAIIN",
  nameAr: "ماين",
  currency: "USD",
  /** admin: Syrian pounds per US dollar, shown next to every price. */
  sypPerUsd: 13000,
  /** admin: orders at or above this subtotal (USD) ship free. */
  freeShippingFrom: 50,
  /** admin: delivery fee in USD below the free-shipping threshold. */
  shippingFee: 3,
  paymentMethods: ["cod", "shamcash"] as const,
  social: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    tiktok: "https://tiktok.com/",
    whatsapp: "",
  },
};

export type PaymentMethod = (typeof siteConfig.paymentMethods)[number];
