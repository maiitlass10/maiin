import { ImageResponse } from "next/og";

export const alt = "MAIIN";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Preview card shown when a page link is shared on WhatsApp, Facebook and the like. */
export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#1e2447", color: "#f7f6f2", padding: 72, fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 132, fontWeight: 800, letterSpacing: 24 }}>MAIIN</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 44, fontWeight: 700 }}>Everyday fashion at prices you&apos;ll love</div>
          <div style={{ display: "flex", gap: 16, fontSize: 28, color: "#b3b7cb" }}>
            <span>Delivery across Syria</span>
            <span style={{ color: "#ff6b1a" }}>•</span>
            <span>Pay on delivery or Sham Cash</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
