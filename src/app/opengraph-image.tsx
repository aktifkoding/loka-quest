import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "LokaQuest — Jelajahi Nusantara, Hidupkan Warisan Budaya";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #10152e 0%, #23305c 60%, #3d4a9e 100%)",
          color: "#f2f0e9",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "14px 34px",
            borderRadius: 999,
            border: "1px solid rgba(242,240,233,0.25)",
            fontSize: 26,
            color: "#c9cff2",
          }}
        >
          Platform belajar budaya Indonesia
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 34,
            fontSize: 88,
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.1,
            letterSpacing: -2,
            maxWidth: 1000,
          }}
        >
          Jelajahi Nusantara, hidupkan warisan budaya
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 36,
            gap: 14,
            fontSize: 28,
            color: "#9aa0b8",
          }}
        >
          <div style={{ display: "flex" }}>Batik</div>
          <div style={{ display: "flex", color: "#f0b429" }}>·</div>
          <div style={{ display: "flex" }}>Gamelan</div>
          <div style={{ display: "flex", color: "#f0b429" }}>·</div>
          <div style={{ display: "flex" }}>Wayang</div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 44,
            alignItems: "center",
            gap: 12,
            background: "#f0b429",
            color: "#10152e",
            fontSize: 30,
            fontWeight: 700,
            padding: "16px 44px",
            borderRadius: 14,
          }}
        >
          LokaQuest
        </div>
      </div>
    ),
    size
  );
}
