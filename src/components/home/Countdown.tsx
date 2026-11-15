"use client";

import { useEffect, useState } from "react";

/** Counts down to local midnight, when the day's flash sale resets. */
function remaining() {
  const now = new Date();
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  const s = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60];
}

export function Countdown({ label }: { label: string }) {
  const [parts, setParts] = useState<number[] | null>(null);
  useEffect(() => {
    setParts(remaining());
    const id = setInterval(() => setParts(remaining()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="flex items-center gap-1 font-latin text-sm font-bold" dir="ltr" role="timer" aria-label={label}>
      {(parts ?? [null, null, null]).map((n, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span aria-hidden>:</span>}
          <span className="min-w-8 bg-fg px-1.5 py-0.5 text-center tabular-nums text-bg">{n === null ? "--" : String(n).padStart(2, "0")}</span>
        </span>
      ))}
    </span>
  );
}
