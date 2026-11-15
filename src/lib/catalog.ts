import { COLORS, products, type ColorKey, type Localized, type Product } from "@/data/products";

export const listingSlugs = ["new", "sale", "women", "men", "kids", "dresses", "tops", "outerwear", "bottoms", "shoes", "bags"] as const;
export type ListingSlug = (typeof listingSlugs)[number];

export function isListingSlug(s: string): s is ListingSlug {
  return (listingSlugs as readonly string[]).includes(s);
}

export function productsFor(slug: ListingSlug): Product[] {
  if (slug === "new") return products.filter((p) => p.isNew);
  if (slug === "sale") return products.filter((p) => p.oldPrice);
  return products.filter((p) => p.categories.includes(slug));
}

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

/** Same main category first, then anything sharing a category, best sellers first. */
export function relatedProducts(p: Product, limit = 10): Product[] {
  const score = (o: Product) => o.categories.filter((c) => p.categories.includes(c)).length;
  return products
    .filter((o) => o.id !== p.id && score(o) > 0)
    .sort((a, b) => score(b) - score(a) || b.sold - a.sold)
    .slice(0, limit);
}

/** Folds Arabic letter variants and diacritics so "اسود", "أسود" and "أسوَد" all match. */
export function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[أإآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const categoryWords: Record<string, Localized> = {
  women: { ar: "نسائي نساء بنات", en: "women womens ladies" },
  men: { ar: "رجالي رجال شباب", en: "men mens" },
  kids: { ar: "أطفال ولادي", en: "kids children" },
  dresses: { ar: "فستان فساتين", en: "dress dresses" },
  tops: { ar: "بلوزة تيشيرت كنزة", en: "top tee shirt sweater" },
  outerwear: { ar: "جاكيت معطف كارديغان", en: "jacket coat cardigan" },
  bottoms: { ar: "بنطلون تنورة جينز", en: "trousers pants skirt jeans" },
  shoes: { ar: "حذاء أحذية صباط", en: "shoes shoe" },
  bags: { ar: "شنطة شنط حقيبة", en: "bag bags handbag" },
};

export function searchProducts(query: string): Product[] {
  const terms = normalize(query).split(" ").filter(Boolean);
  if (!terms.length) return [];
  return products
    .map((p) => {
      const hay = normalize(
        [p.name.ar, p.name.en, ...p.categories.map((c) => `${categoryWords[c].ar} ${categoryWords[c].en}`), ...p.colors.map((c) => `${COLORS[c].ar} ${COLORS[c].en}`)].join(" "),
      );
      const hits = terms.filter((t) => hay.includes(t)).length;
      return { p, hits };
    })
    .filter((r) => r.hits === terms.length)
    .sort((a, b) => b.p.sold - a.p.sold)
    .map((r) => r.p);
}

export const priceBuckets = [
  { key: "u20", min: 0, max: 20 },
  { key: "20-40", min: 20, max: 40 },
  { key: "40-60", min: 40, max: 60 },
  { key: "60+", min: 60, max: Infinity },
] as const;

export function colorsIn(list: Product[]): ColorKey[] {
  const order = Object.keys(COLORS) as ColorKey[];
  const set = new Set(list.flatMap((p) => p.colors));
  return order.filter((c) => set.has(c));
}

export function sizesIn(list: Product[]): string[] {
  const order = ["XS", "S", "M", "L", "XL", "S/M", "L/XL", "28", "30", "32", "34", "36", "40", "41", "42", "43", "44", "2Y", "4Y", "6Y", "8Y"];
  const set = new Set(list.flatMap((p) => p.sizes).filter((s) => s !== "—"));
  return [...order.filter((s) => set.has(s)), ...[...set].filter((s) => !order.includes(s))];
}

const descriptions: Record<string, Localized> = {
  dresses: { ar: "فستان بقصّة مريحة وخامة ناعمة، بينلبس بالطلعات والمناسبات. نسّقيه مع حذاء بكعب أو صندل حسب المناسبة.", en: "A comfortable cut in a soft fabric, for days out and occasions alike. Pair it with heels or sandals." },
  tops: { ar: "قطعة أساسية لخزانتك، قماش مريح بيتنفّس وما بيفقد شكلو بعد الغسيل.", en: "A wardrobe essential in a breathable fabric that keeps its shape after washing." },
  outerwear: { ar: "طبقة خارجية دافية بقصّة عصرية، بتكمّل أي إطلالة بالأيام الباردة.", en: "A warm outer layer in a modern cut that finishes any look on cooler days." },
  bottoms: { ar: "قصّة مريحة بتعطي حرية حركة، وبتنسّق مع البلايز والتيشيرتات بسهولة.", en: "An easy fit with room to move that pairs with tops and tees." },
  shoes: { ar: "جلد ناعم ونعل مريح للمشي الطويل، بيمشي مع اللبس الرسمي والكاجوال.", en: "Soft leather with a cushioned sole for long days, smart or casual." },
  bags: { ar: "شنطة عملية بمساحة كافية لأغراضك اليومية، بحزام قابل للتعديل.", en: "A practical bag with room for everyday essentials and an adjustable strap." },
  kids: { ar: "قماش ناعم على بشرة الأطفال، وسهل اللبس والغسيل.", en: "Soft on children's skin, easy to put on and to wash." },
};

export function descriptionFor(p: Product): Localized {
  const key = p.categories.find((c) => descriptions[c]) ?? "tops";
  return descriptions[key];
}

export const careFor: Localized = {
  ar: "غسيل بالغسالة على ٣٠ درجة · بدون مبيّض · كوي على حرارة خفيفة · نشر بالظل",
  en: "Machine wash at 30°C · Do not bleach · Iron on low heat · Dry in the shade",
};

/** Size charts in centimetres, keyed by the product's size system. */
export function sizeChartFor(p: Product): { headers: Localized[]; rows: string[][] } | null {
  const s = p.sizes;
  if (s.includes("M"))
    return {
      headers: [{ ar: "المقاس", en: "Size" }, { ar: "الصدر", en: "Chest" }, { ar: "الخصر", en: "Waist" }, { ar: "الطول", en: "Length" }],
      rows: [["XS", "82-86", "64-68", "62"], ["S", "86-90", "68-72", "64"], ["M", "90-96", "72-78", "66"], ["L", "96-102", "78-84", "68"], ["XL", "102-108", "84-90", "70"]],
    };
  if (s.includes("32"))
    return {
      headers: [{ ar: "المقاس", en: "Size" }, { ar: "الخصر", en: "Waist" }, { ar: "الورك", en: "Hip" }, { ar: "طول الساق", en: "Inseam" }],
      rows: [["28", "71", "88", "78"], ["30", "76", "93", "79"], ["32", "81", "98", "80"], ["34", "86", "103", "81"], ["36", "91", "108", "82"]],
    };
  if (s.includes("42"))
    return { headers: [{ ar: "المقاس", en: "Size (EU)" }, { ar: "طول القدم", en: "Foot length" }], rows: [["40", "25.5"], ["41", "26.0"], ["42", "26.5"], ["43", "27.5"], ["44", "28.0"]] };
  if (s.includes("4Y"))
    return { headers: [{ ar: "العمر", en: "Age" }, { ar: "الطول", en: "Height" }], rows: [["2Y", "86-92"], ["4Y", "98-104"], ["6Y", "110-116"], ["8Y", "122-128"]] };
  return null;
}

/** Example reviews until real ones arrive with customer accounts (Sprint 4). */
export const sampleReviews: { name: string; city: Localized; stars: number; size: string; text: Localized }[] = [
  { name: "لمى", city: { ar: "دمشق", en: "Damascus" }, stars: 5, size: "M", text: { ar: "الخامة حلوة والمقاس مظبوط متل الجدول. وصل بيومين.", en: "Lovely fabric and the size matches the chart. Arrived in two days." } },
  { name: "Karim", city: { ar: "حلب", en: "Aleppo" }, stars: 4, size: "L", text: { ar: "منيح كتير بالنسبة لسعرو، بس اللون أغمق شوي من الصورة.", en: "Great for the price, though the colour is a little darker than the photo." } },
  { name: "سارة", city: { ar: "حمص", en: "Homs" }, stars: 5, size: "S", text: { ar: "بدّلت المقاس بدون أي تعقيد، وخدمة الزبائن ردّوا بسرعة.", en: "Exchanged the size with no hassle, and customer care replied quickly." } },
];
