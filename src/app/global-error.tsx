"use client";

import ar from "../../messages/ar.json";
import en from "../../messages/en.json";

/**
 * Last-resort page when the root layout itself fails. It replaces the whole
 * document, so it has its own <html> and plain inline styles, and shows the
 * message in both languages because the locale may be unknown here.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ margin: 0, minHeight: "100dvh", display: "grid", placeItems: "center", background: "#f7f6f2", color: "#1e2447", fontFamily: "system-ui, Tahoma, sans-serif", textAlign: "center", padding: 24 }}>
        <main>
          <h1 style={{ fontSize: 28, margin: 0 }}>{ar.error.title}</h1>
          <p style={{ color: "#5e6278" }}>{ar.error.text}</p>
          <p lang="en" dir="ltr" style={{ color: "#5e6278" }}>
            {en.error.title}. {en.error.text}
          </p>
          <button type="button" onClick={reset} style={{ marginTop: 16, height: 48, padding: "0 32px", borderRadius: 999, border: 0, background: "#ff6b1a", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>
            {ar.error.retry} · {en.error.retry}
          </button>
        </main>
      </body>
    </html>
  );
}
