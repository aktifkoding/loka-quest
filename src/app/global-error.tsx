"use client";

// Fallback terakhir saat layout root itu sendiri gagal — membawa html/body
// sendiri karena tidak dirender di dalam layout manapun.
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf7f0",
          color: "#1d2340",
          fontFamily: "system-ui, sans-serif",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <main style={{ maxWidth: 480 }}>
          <h1 style={{ fontSize: 28, fontWeight: 600, margin: "0 0 12px" }}>
            Terjadi gangguan
          </h1>
          <p style={{ color: "#5a5f76", lineHeight: 1.6, margin: "0 0 24px" }}>
            LokaQuest tidak dapat dimuat sekarang. Muat ulang halaman untuk
            mencoba lagi — progres belajarmu tersimpan aman.
          </p>
          <button
            onClick={reset}
            style={{
              background: "#2b3a85",
              color: "#faf7f0",
              border: "none",
              borderRadius: 8,
              padding: "12px 24px",
              fontSize: 15,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Muat ulang
          </button>
        </main>
      </body>
    </html>
  );
}
