import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #242230 0%, #14131B 60%, #0E0E13 100%)",
          borderRadius: 40,
          border: "4px solid rgba(212, 175, 55, 0.6)",
        }}
      >
        <svg
          width="136"
          height="136"
          viewBox="0 0 512 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M256 58 C304 128, 400 192, 410 314 C416 378, 362 430, 256 462 C150 430, 96 378, 102 314 C112 192, 208 128, 256 58 Z"
            fill="rgba(212, 175, 55, 0.1)"
            stroke="#D4AF37"
            strokeWidth="18"
            strokeLinejoin="round"
          />
          <path
            d="M256 130 L278 238 L386 260 L278 282 L256 390 L234 282 L126 260 L234 238 Z"
            fill="#F0D06B"
          />
          <path
            d="M176 180 L236 240 M336 180 L276 240 M336 340 L276 280 M176 340 L236 280"
            stroke="#9C6B3B"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <circle cx="256" cy="260" r="34" fill="#14131B" stroke="#F5DC7B" strokeWidth="14" />
          <circle cx="256" cy="260" r="14" fill="#F7E392" />
        </svg>
      </div>
    ),
    size
  );
}
