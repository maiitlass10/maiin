import type { Localized, Product, RackPiece } from "@/data/products";

/** What the bag needs to show any item, whether it's a product or a rack piece. */
export type BagItem = { id: string; name: Localized; image: string; price: number; oldPrice?: number; soldOut: string[]; href: string | null };

export function bagItemsFrom(products: Product[], rack: RackPiece[]): Record<string, BagItem> {
  const map: Record<string, BagItem> = {};
  for (const p of products) map[p.id] = { id: p.id, name: p.name, image: p.image, price: p.price, oldPrice: p.oldPrice, soldOut: p.soldOut ?? [], href: `/p/${p.id}` };
  for (const r of rack) map[r.id] = { id: r.id, name: r.name, image: r.cutout, price: r.price, soldOut: [], href: r.productId ? `/p/${r.productId}` : null };
  return map;
}
