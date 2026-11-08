"use client";

// Fallback terakhir saat layout root itu sendiri gagal — membawa html/body
// sendiri karena tidak dirender di dalam layout manapun (di luar I18nProvider).
import { useEffect, useState } from "react";
import { getClientLang, type Lang } from "@/lib/i18n";
import { shellDict as d } from "@/lib/i18n/dict/shell";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [lang, setLang] = useState<Lang>("id");

  useEffect(() => {
    setLang(getClientLang());
  }, []);

  useEffect(() => {
    console.error(error);
  }, [error]);

  const t = (value: { id: string; en: string }) => value[lang];

  return (
    <html lang={lang} suppressHydrationWarning>
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
            {t(d.globalErrorTitle)}
          </h1>
          <p style={{ color: "#5a5f76", lineHeight: 1.6, margin: "0 0 24px" }}>
            {t(d.globalErrorBody)}
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
            {t(d.globalErrorReload)}
          </button>
        </main>
      </body>
    </html>
  );
}
