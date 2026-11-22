"use client";

import { useStore } from "./StoreProvider";

export function BagCount({ className = "" }: { className?: string }) {
  const { bagCount } = useStore();
  return (
    <span
      key={bagCount}
      className={`absolute end-1 top-1 grid min-w-[18px] animate-[bump_.4s_ease] place-items-center rounded-full bg-accent px-1 font-latin text-[11px] font-bold leading-[18px] text-accent-fg ${className}`}
    >
      {bagCount}
    </span>
  );
}
