import { ImageResponse } from "next/og";
import { createServiceClient } from "@/lib/supabase/service-role";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Misi budaya LokaQuest";
export const dynamic = "force-dynamic";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let title = "Misi Budaya";
  let xp = "";
  try {
    const service = createServiceClient();
    const { data } = await service
      .from("missions")
      .select("title, xp_reward")
      .or(`slug.eq.${id},id.eq.${id}`)
      .eq("status", "published")
      .maybeSingle();
    if (data) {
      title = data.title;
      xp = `${data.xp_reward} XP`;
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
          background: "linear-gradient(135deg, #1a2142 0%, #3d4a9e 100%)",
          color: "#f2f0e9",
          fontFamily: "sans-serif",
          padding: 70,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, color: "#9aa0b8" }}>
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
            LokaQuest
          </div>
          {xp ? (
            <div
              style={{
                display: "flex",
                padding: "12px 30px",
                borderRadius: 999,
                background: "#f0b429",
                color: "#10152e",
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              {xp}
            </div>
          ) : null}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 28, color: "#f0b429" }}>
            Misi budaya menantimu
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 16,
              fontSize: 84,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1.1,
            }}
          >
            {title}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#c9cff2" }}>
          Mainkan langsung di browser — tanpa unduhan
        </div>
      </div>
    ),
    size
  );
}
