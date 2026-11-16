"use client";

import { createContext, useContext } from "react";
import type { Settings } from "@/lib/data";

const SettingsContext = createContext<Settings | null>(null);

export function SettingsProvider({ value, children }: { value: Settings; children: React.ReactNode }) {
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const s = useContext(SettingsContext);
  if (!s) throw new Error("useSettings must be used inside SettingsProvider");
  return s;
}
