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
          background: "#2b3a85",
          borderRadius: 36,
          color: "#f2f0e9",
          fontSize: 96,
          fontWeight: 700,
        }}
      >
        LQ
      </div>
    ),
    size
  );
}
