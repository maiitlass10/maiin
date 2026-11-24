/**
 * Fallback catalogue, used only when Supabase is not configured or unreachable.
 * The live catalogue is in Supabase (see supabase/seed.sql). Photos are free-to-use Pexels placeholders (see docs/PHOTOS.md) until the real product photos arrive.
 * Moves to Supabase in Sprint 3, where staff manage products from the admin panel.
 */
export type Localized = { ar: string; en: string };
export const COLORS = {
  black: { hex: "#111111", ar: "أسود", en: "Black" },
  white: { hex: "#FFFFFF", ar: "أبيض", en: "White" },
  beige: { hex: "#E8DCC4", ar: "بيج", en: "Beige" },
  grey: { hex: "#9DA2A8", ar: "رمادي", en: "Grey" },
  red: { hex: "#C8102E", ar: "أحمر", en: "Red" },
  burgundy: { hex: "#6B1F2A", ar: "نبيذي", en: "Burgundy" },
  pink: { hex: "#EBB5BE", ar: "وردي", en: "Pink" },
  orange: { hex: "#F28C28", ar: "برتقالي", en: "Orange" },
  yellow: { hex: "#F2C230", ar: "أصفر", en: "Yellow" },
  brown: { hex: "#7B4A2D", ar: "بني", en: "Brown" },
  camel: { hex: "#B88A55", ar: "جملي", en: "Camel" },
  green: { hex: "#2F4A3A", ar: "أخضر", en: "Green" },
  blue: { hex: "#6E93C2", ar: "أزرق", en: "Blue" },
  navy: { hex: "#1F2A44", ar: "كحلي", en: "Navy" },
  purple: { hex: "#5A1E4A", ar: "بنفسجي", en: "Purple" },
} as const;
export type ColorKey = keyof typeof COLORS;

export type CategorySlug = "women" | "men" | "kids" | "dresses" | "tops" | "outerwear" | "bottoms" | "shoes" | "bags";

export type Product = {
  id: string;
  name: Localized;
  categories: CategorySlug[];
  price: number;
  oldPrice?: number;
  /** First photo; shown on cards. */
  image: string;
  /** All photos, first one included. */
  images?: string[];
  description?: Localized;
  rating: number;
  reviews: number;
  sold: number;
  colors: ColorKey[];
  sizes: string[];
  /** Sizes currently out of stock. */
  soldOut?: string[];
  isNew?: boolean;
  flash?: boolean;
};

export type RackPiece = {
  id: string;
  productId?: string | null;
  name: Localized;
  description: Localized;
  material: Localized;
  color: Localized;
  price: number;
  sizes: string[];
  /** Cut-out photo, transparent background, hanger at the top. */
  cutout: string;
  /** Styling photo shown in the details view. */
  look?: string | null;
};

const TOPS = ["XS", "S", "M", "L", "XL"];
const WAIST = ["28", "30", "32", "34", "36"];
const SHOES = ["40", "41", "42", "43", "44"];
const ONE = ["—"];

export const products: Product[] = [
  { id: "p01", name: { ar: "فستان سهرة أحمر طويل", en: "Red maxi evening dress" }, categories: ["women", "dresses"], price: 48, oldPrice: 69, image: "/images/products/w3.webp", rating: 4.8, reviews: 214, sold: 1200, colors: ["red", "black"], sizes: TOPS, soldOut: ["XS"], flash: true },
  { id: "p02", name: { ar: "فستان ميدي أحمر بحزام", en: "Belted red midi dress" }, categories: ["women", "dresses"], price: 32, image: "/images/products/w2.webp", rating: 4.6, reviews: 98, sold: 640, colors: ["red"], sizes: TOPS, isNew: true },
  { id: "p03", name: { ar: "فستان مخمل نبيذي", en: "Burgundy corduroy dress" }, categories: ["women", "dresses"], price: 44, oldPrice: 58, image: "/images/products/w4.webp", rating: 4.7, reviews: 133, sold: 870, colors: ["burgundy", "green"], sizes: TOPS, flash: true },
  { id: "p04", name: { ar: "فستان أوف شولدر بنفسجي", en: "Plum off-shoulder dress" }, categories: ["women", "dresses"], price: 39, image: "/images/products/w5.webp", rating: 4.5, reviews: 61, sold: 310, colors: ["purple"], sizes: TOPS, isNew: true },
  { id: "p05", name: { ar: "كنزة برتقالية واسعة", en: "Orange oversized sweater" }, categories: ["women", "tops"], price: 24, oldPrice: 32, image: "/images/products/w6.webp", rating: 4.9, reviews: 402, sold: 2300, colors: ["orange", "beige"], sizes: TOPS, soldOut: ["XL"], flash: true },
  { id: "p06", name: { ar: "بلوزة بيضاء بربطة", en: "White tie-neck blouse" }, categories: ["women", "tops"], price: 22, image: "/images/products/w7.webp", rating: 4.6, reviews: 77, sold: 520, colors: ["white"], sizes: TOPS },
  { id: "p07", name: { ar: "بنطلون جوغر وردي", en: "Pink jogger trousers" }, categories: ["women", "bottoms"], price: 19, oldPrice: 26, image: "/images/products/w8.webp", rating: 4.4, reviews: 150, sold: 980, colors: ["pink", "black"], sizes: TOPS, flash: true },
  { id: "p08", name: { ar: "فستان وردي منفوش", en: "Pink ruffle dress" }, categories: ["women", "dresses"], price: 56, image: "/images/products/w9.webp", rating: 4.8, reviews: 45, sold: 190, colors: ["pink"], sizes: TOPS, isNew: true },
  { id: "p09", name: { ar: "فستان صيفي مورّد", en: "Floral summer dress" }, categories: ["women", "dresses"], price: 29, oldPrice: 38, image: "/images/products/w10.webp", rating: 4.7, reviews: 260, sold: 1500, colors: ["beige"], sizes: TOPS, flash: true },
  { id: "p10", name: { ar: "بنطلون مخطط واسع", en: "Striped wide-leg trousers" }, categories: ["women", "bottoms"], price: 27, image: "/images/products/w11.webp", rating: 4.3, reviews: 39, sold: 210, colors: ["black"], sizes: TOPS },
  { id: "p11", name: { ar: "معطف سماوي طويل", en: "Sky-blue long coat" }, categories: ["women", "outerwear"], price: 65, image: "/images/products/w12.webp", rating: 4.8, reviews: 88, sold: 430, colors: ["blue"], sizes: TOPS, soldOut: ["S", "XL"], isNew: true },
  { id: "p12", name: { ar: "معطف وردي كلاسيك", en: "Classic pink coat" }, categories: ["women", "outerwear"], price: 72, oldPrice: 90, image: "/images/products/w13.webp", rating: 4.7, reviews: 120, sold: 610, colors: ["pink"], sizes: TOPS, flash: true },
  { id: "p13", name: { ar: "تيشيرت مطبوع نسائي", en: "Women's graphic tee" }, categories: ["women", "tops"], price: 14, image: "/images/products/w14.webp", rating: 4.5, reviews: 310, sold: 3100, colors: ["white"], sizes: TOPS },
  { id: "p14", name: { ar: "كارديغان أسود طويل", en: "Long black cardigan" }, categories: ["women", "outerwear"], price: 34, image: "/images/products/w16.webp", rating: 4.6, reviews: 95, sold: 700, colors: ["black"], sizes: TOPS },
  { id: "p15", name: { ar: "طقم رياضي أصفر", en: "Yellow tracksuit set" }, categories: ["women", "tops", "bottoms"], price: 38, image: "/images/products/w1.webp", rating: 4.7, reviews: 178, sold: 1100, colors: ["yellow"], sizes: TOPS, isNew: true },
  { id: "p16", name: { ar: "جاكيت جلد بني رجالي", en: "Men's brown leather jacket" }, categories: ["men", "outerwear"], price: 85, oldPrice: 110, image: "/images/products/m3.webp", rating: 4.9, reviews: 230, sold: 940, colors: ["brown", "black"], sizes: TOPS, soldOut: ["XS"], flash: true },
  { id: "p17", name: { ar: "معطف جملي رجالي", en: "Men's camel overcoat" }, categories: ["men", "outerwear"], price: 95, image: "/images/products/m9.webp", rating: 4.8, reviews: 66, sold: 280, colors: ["camel"], sizes: TOPS },
  { id: "p18", name: { ar: "هودي رمادي ثقيل", en: "Heavy grey hoodie" }, categories: ["men", "tops"], price: 28, image: "/images/products/m11.webp", rating: 4.6, reviews: 340, sold: 2600, colors: ["grey", "black"], sizes: TOPS },
  { id: "p19", name: { ar: "تيشيرت قطن أبيض", en: "White cotton tee" }, categories: ["men", "tops"], price: 9, image: "/images/products/m1.webp", rating: 4.7, reviews: 820, sold: 5200, colors: ["white", "black"], sizes: TOPS, soldOut: ["XL"] },
  { id: "p20", name: { ar: "تيشيرت أسود مطبوع", en: "Black print tee" }, categories: ["men", "tops"], price: 11, oldPrice: 15, image: "/images/products/m2.webp", rating: 4.5, reviews: 260, sold: 1900, colors: ["black"], sizes: TOPS, flash: true },
  { id: "p21", name: { ar: "بنطلون تشينو كاكي", en: "Khaki chinos" }, categories: ["men", "bottoms"], price: 26, image: "/images/products/m12.webp", rating: 4.4, reviews: 72, sold: 450, colors: ["beige"], sizes: WAIST, soldOut: ["36"] },
  { id: "p22", name: { ar: "جاكيت جينز كلاسيك", en: "Classic denim jacket" }, categories: ["men", "outerwear"], price: 42, image: "/images/products/m10.webp", rating: 4.8, reviews: 140, sold: 760, colors: ["blue"], sizes: TOPS, isNew: true },
  { id: "p23", name: { ar: "شنطة جلد حمراء", en: "Red leather handbag" }, categories: ["women", "bags"], price: 45, oldPrice: 60, image: "/images/products/a1.webp", rating: 4.8, reviews: 105, sold: 520, colors: ["red", "black"], sizes: ONE, flash: true },
  { id: "p24", name: { ar: "حذاء جلد بني كلاسيك", en: "Brown leather oxfords" }, categories: ["men", "shoes"], price: 54, image: "/images/products/a2.webp", rating: 4.7, reviews: 58, sold: 300, colors: ["brown"], sizes: SHOES },
  { id: "p25", name: { ar: "طقم أطفال كحلي", en: "Kids' navy outfit" }, categories: ["kids"], price: 22, image: "/images/products/k1.webp", rating: 4.9, reviews: 44, sold: 260, colors: ["navy"], sizes: ["2Y", "4Y", "6Y", "8Y"], isNew: true },
];

export const rackPieces: RackPiece[] = [
  { id: "r01", name: { ar: "تيشيرت أسود أساسي", en: "Essential black tee" }, description: { ar: "قطن ثقيل بقصّة مستقيمة، بيحافظ على شكلو بعد الغسيل.", en: "Heavyweight cotton in a straight cut that keeps its shape wash after wash." }, material: { ar: "١٠٠٪ قطن", en: "100% cotton" }, color: { ar: "أسود", en: "Black" }, price: 12, sizes: TOPS, cutout: "/images/rack/blacktee.webp", look: "/images/products/m2.webp" },
  { id: "r02", name: { ar: "تيشيرت سماوي ملانج", en: "Sky marl tee" }, description: { ar: "قماش ملانج ناعم وخفيف، للّبس اليومي بالصيف.", en: "Soft, light marl jersey for everyday summer wear." }, material: { ar: "قطن وبوليستر", en: "Cotton and polyester" }, color: { ar: "سماوي", en: "Sky blue" }, price: 10, sizes: TOPS, cutout: "/images/rack/bluetee.webp", look: "/images/products/m1.webp" },
  { id: "r03", name: { ar: "قميص شامبري منقّط", en: "Dotted chambray shirt" }, description: { ar: "قميص شامبري بنقشة نقاط صغيرة، بينلبس مسكّر أو مفتوح فوق تيشيرت.", en: "Chambray with a fine dot print, worn buttoned or open over a tee." }, material: { ar: "١٠٠٪ قطن شامبري", en: "100% cotton chambray" }, color: { ar: "أزرق", en: "Blue" }, price: 24, sizes: TOPS, cutout: "/images/rack/denimshirt.webp", look: "/images/products/m18.webp" },
  { id: "r04", name: { ar: "كنزة صوف محبوكة", en: "Chunky knit sweater" }, description: { ar: "حبكة عريضة ودافية بقصّة قصيرة وأكمام واسعة.", en: "A warm, chunky knit with a cropped body and wide sleeves." }, material: { ar: "صوف وأكريليك", en: "Wool and acrylic" }, color: { ar: "بني فاتح", en: "Taupe" }, price: 29, sizes: TOPS, cutout: "/images/rack/knit.webp", look: "/images/products/w6.webp" },
  { id: "r05", name: { ar: "بونشو كروشيه", en: "Crochet poncho" }, description: { ar: "كروشيه يدوي بأطراف شراشيب، فوق فستان أو جينز.", en: "Hand-crocheted with a fringed hem, over a dress or jeans." }, material: { ar: "١٠٠٪ قطن", en: "100% cotton" }, color: { ar: "عاجي", en: "Ivory" }, price: 26, sizes: ["S/M", "L/XL"], cutout: "/images/rack/poncho.webp", look: "/images/products/w10.webp" },
  { id: "r06", name: { ar: "تيشيرت مطبوع أوريجينال", en: "Original print tee" }, description: { ar: "طباعة أمامية كبيرة على قطن مريح بقصّة واسعة.", en: "A large front print on comfortable cotton in a relaxed cut." }, material: { ar: "١٠٠٪ قطن", en: "100% cotton" }, color: { ar: "بيج", en: "Beige" }, price: 15, sizes: TOPS, cutout: "/images/rack/printtee.webp", look: "/images/products/w14.webp" },
  { id: "r07", name: { ar: "سويتشيرت أبيض", en: "White sweatshirt" }, description: { ar: "سويتشيرت ناعم من جوّا، بياقة وأساور مضلّعة.", en: "Brushed on the inside, with a ribbed collar and cuffs." }, material: { ar: "قطن وبوليستر", en: "Cotton and polyester" }, color: { ar: "أبيض", en: "White" }, price: 22, sizes: TOPS, cutout: "/images/rack/sweatshirt.webp", look: "/images/products/w16.webp" },
];

export const flashProducts = products.filter((p) => p.flash);

export function discountPercent(p: { price: number; oldPrice?: number }) {
  return p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
}
