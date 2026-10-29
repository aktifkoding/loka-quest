import { ImageResponse } from "next/og";
import { createServiceClient } from "@/lib/supabase/service-role";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Wilayah budaya LokaQuest";
export const dynamic = "force-dynamic";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let name = "Wilayah Budaya";
  let context = "Jelajahi Nusantara bersama LokaQuest";
  try {
    const service = createServiceClient();
    const { data } = await service
      .from("cultural_regions")
      .select("name, geographic_context")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (data) {
      name = data.name;
      context = data.geographic_context ?? context;
    }
  } catch {
    // fallback text already set
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #10152e 0%, #23305c 100%)",
          color: "#f2f0e9",
          fontFamily: "sans-serif",
          padding: 70,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30 }}>
          <div
            style={{
              display: "flex",
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "#f0b429",
              color: "#10152e",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            L
          </div>
          <div style={{ display: "flex", color: "#9aa0b8" }}>LokaQuest</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 92,
              fontWeight: 700,
              letterSpacing: -2,
            }}
          >
            {name}
          </div>
          <div style={{ display: "flex", marginTop: 18, fontSize: 32, color: "#9aa0b8" }}>
            {context}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#c9cff2" }}>
          <div style={{ display: "flex" }}>Wilayah budaya Indonesia</div>
          <div style={{ display: "flex", color: "#f0b429" }}>jelajahi sekarang →</div>
        </div>
      </div>
    ),
    size
  );
}
