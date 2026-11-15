"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/data/products";
import { QuickAddDialog } from "./QuickAddDialog";

export type BagLine = { id: string; size: string; qty: number };

type Store = {
  bag: BagLine[];
  bagCount: number;
  wishlist: string[];
  addToBag: (id: string, size: string, qty?: number) => void;
  toggleWishlist: (id: string) => boolean;
  isWished: (id: string) => boolean;
  openQuickAdd: (product: Product) => void;
  toast: (message: string) => void;
};

const StoreContext = createContext<Store | null>(null);
const KEY = "maiin-store-v1";

/**
 * Bag and wishlist kept in the browser for now. Sprint 4 moves them to the
 * customer's account so they follow the customer across devices.
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [bag, setBag] = useState<BagLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [quick, setQuick] = useState<Product | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const loaded = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "{}");
      if (Array.isArray(saved.bag)) setBag(saved.bag);
      if (Array.isArray(saved.wishlist)) setWishlist(saved.wishlist);
    } catch {}
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ bag, wishlist }));
    } catch {}
  }, [bag, wishlist]);

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

  const wishRef = useRef(wishlist);
  wishRef.current = wishlist;
  const toggleWishlist = useCallback((id: string) => {
    const adding = !wishRef.current.includes(id);
    setWishlist((w) => (adding ? [...w, id] : w.filter((x) => x !== id)));
    return adding;
  }, []);

  const value = useMemo<Store>(
    () => ({
      bag,
      bagCount: bag.reduce((n, l) => n + l.qty, 0),
      wishlist,
      addToBag,
      toggleWishlist,
      isWished: (id) => wishlist.includes(id),
      openQuickAdd: setQuick,
      toast,
    }),
    [bag, wishlist, addToBag, toggleWishlist, toast],
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
