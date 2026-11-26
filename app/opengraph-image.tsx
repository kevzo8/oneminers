import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";

export const alt = `${BRAND.name}: ${BRAND.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: 80,
          background: "#05070a",
          color: "#e8eef5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 18, height: 18, borderRadius: 999, background: "#b9ff66" }} />
          <div style={{ fontSize: 28, letterSpacing: 8, color: "#93a1ad" }}>ASIC MINING DATA</div>
        </div>
        <div style={{ marginTop: 28, fontSize: 104, lineHeight: 1, fontWeight: 800, letterSpacing: -6 }}>NOWMINING</div>
        <div style={{ marginTop: 26, fontSize: 34, color: "#b9ff66" }}>{BRAND.tagline}</div>
        <div style={{ marginTop: 12, fontSize: 24, color: "#93a1ad" }}>Live profit · seller prices · hosting rates</div>
      </div>
    ),
    size
  );
}
