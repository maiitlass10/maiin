"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { Product } from "@/data/products";
import { browserClient } from "@/lib/supabase/browser";
import { QuickAddDialog } from "./QuickAddDialog";

export type BagLine = { id: string; size: string; qty: number };

type Store = {
  user: User | null;
  authReady: boolean;
  bag: BagLine[];
  bagCount: number;
  wishlist: string[];
  promo: string | null;
  addToBag: (id: string, size: string, qty?: number) => void;
  setQty: (id: string, size: string, qty: number) => void;
  removeFromBag: (id: string, size: string) => void;
  clearBag: () => void;
  toggleWishlist: (id: string) => boolean;
  clearWishlist: () => void;
  isWished: (id: string) => boolean;
  setPromo: (code: string | null) => void;
  openQuickAdd: (product: Product) => void;
  toast: (message: string) => void;
};

const StoreContext = createContext<Store | null>(null);
const KEY = "maiin-store-v1";
const key = (l: { id: string; size: string }) => `${l.id}|${l.size}`;

/** Union of two bags; when the same item and size is in both, keep the larger quantity. */
function mergeBags(a: BagLine[], b: BagLine[]) {
  const map = new Map<string, BagLine>();
  for (const l of [...a, ...b]) {
    const k = key(l);
    const prev = map.get(k);
    map.set(k, prev ? { ...l, qty: Math.min(9, Math.max(prev.qty, l.qty)) } : l);
  }
  return [...map.values()];
}

/**
 * Bag, wishlist and promo code. Kept in the browser for guests; for signed-in
 * customers they are also saved to their account (cart_items, wishlist_items)
 * so they follow the customer to other devices.
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [bag, setBag] = useState<BagLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [promo, setPromo] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [quick, setQuick] = useState<Product | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const loaded = useRef(false);
  const synced = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const supabase = useMemo(() => browserClient(), []);

  // Load from the browser.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "{}");
      if (Array.isArray(saved.bag)) setBag(saved.bag);
      if (Array.isArray(saved.wishlist)) setWishlist(saved.wishlist);
      if (typeof saved.promo === "string") setPromo(saved.promo);
    } catch {}
    loaded.current = true;
  }, []);

  // Track the signed-in customer.
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setAuthReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  // On sign-in, merge the account's saved bag and wishlist with this browser's.
  useEffect(() => {
    if (!user || !loaded.current || synced.current === user.id) return;
    synced.current = user.id;
    (async () => {
      const [{ data: cart }, { data: wish }] = await Promise.all([
        supabase.from("cart_items").select("item_id, size, qty"),
        supabase.from("wishlist_items").select("product_id"),
      ]);
      setBag((local) => mergeBags(local, (cart ?? []).map((r) => ({ id: r.item_id, size: r.size, qty: r.qty }))));
      setWishlist((local) => [...new Set([...local, ...(wish ?? []).map((r) => r.product_id)])]);
    })();
  }, [user, supabase]);
  useEffect(() => {
    if (!user) synced.current = null;
  }, [user]);

  // Save to the browser, and to the account when signed in (debounced).
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ bag, wishlist, promo }));
    } catch {}
    if (!user || synced.current !== user.id) return;
    const id = setTimeout(async () => {
      const uid = user.id;
      await supabase.from("cart_items").delete().eq("user_id", uid);
      if (bag.length) await supabase.from("cart_items").insert(bag.map((l) => ({ user_id: uid, item_id: l.id, size: l.size, qty: l.qty })));
      await supabase.from("wishlist_items").delete().eq("user_id", uid);
      if (wishlist.length) await supabase.from("wishlist_items").insert(wishlist.map((p) => ({ user_id: uid, product_id: p })));
    }, 800);
    return () => clearTimeout(id);
  }, [bag, wishlist, promo, user, supabase]);

  const toast = useCallback((text: string) => {
    setMessage(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 2800);
  }, []);

  const addToBag = useCallback((id: string, size: string, qty = 1) => {
    setBag((b) => {
      const line = b.find((l) => l.id === id && l.size === size);
      if (line) return b.map((l) => (l === line ? { ...l, qty: Math.min(9, l.qty + qty) } : l));
      return [...b, { id, size, qty }];
    });
  }, []);
  const setQty = useCallback((id: string, size: string, qty: number) => {
    setBag((b) => b.map((l) => (l.id === id && l.size === size ? { ...l, qty: Math.max(1, Math.min(9, qty)) } : l)));
  }, []);
  const removeFromBag = useCallback((id: string, size: string) => setBag((b) => b.filter((l) => !(l.id === id && l.size === size))), []);
  const clearBag = useCallback(() => setBag([]), []);

  const wishRef = useRef(wishlist);
  wishRef.current = wishlist;
  const toggleWishlist = useCallback((id: string) => {
    const adding = !wishRef.current.includes(id);
    setWishlist((w) => (adding ? [...w, id] : w.filter((x) => x !== id)));
    return adding;
  }, []);
  const clearWishlist = useCallback(() => setWishlist([]), []);

  const value = useMemo<Store>(
    () => ({
      user,
      authReady,
      bag,
      bagCount: bag.reduce((n, l) => n + l.qty, 0),
      wishlist,
      promo,
      addToBag,
      setQty,
      removeFromBag,
      clearBag,
      toggleWishlist,
      clearWishlist,
      isWished: (id) => wishlist.includes(id),
      setPromo,
      openQuickAdd: setQuick,
      toast,
    }),
    [user, authReady, bag, wishlist, promo, addToBag, setQty, removeFromBag, clearBag, toggleWishlist, clearWishlist, toast],
  );

  return (
    <StoreContext.Provider value={value}>
      {children}
      <QuickAddDialog product={quick} onClose={() => setQuick(null)} />
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex justify-center px-4 transition-all duration-300 md:bottom-8 ${
          message ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
      >
        {message && <span className="max-w-md bg-fg px-5 py-3 text-sm font-semibold text-bg shadow-lg">{message}</span>}
      </div>
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
