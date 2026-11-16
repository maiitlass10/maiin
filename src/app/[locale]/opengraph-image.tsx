import { ImageResponse } from "next/og";

export const alt = "MAIIN";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Preview card shown when a page link is shared on WhatsApp, Facebook and the like. */
export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#111111", color: "#ffffff", padding: 72, fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 132, fontWeight: 800, letterSpacing: 24 }}>MAIIN</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 44, fontWeight: 700 }}>Everyday fashion at prices you&apos;ll love</div>
          <div style={{ display: "flex", gap: 16, fontSize: 28, color: "#bbbbbb" }}>
            <span>Delivery across Syria</span>
            <span style={{ color: "#d7191f" }}>•</span>
            <span>Pay on delivery or Sham Cash</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
