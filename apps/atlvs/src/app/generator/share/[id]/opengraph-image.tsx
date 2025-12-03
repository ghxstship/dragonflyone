import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Experience Blueprint - ATLVS";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// =============================================================================
// OG IMAGE GENERATOR
// Generates Open Graph images for shared blueprints
// =============================================================================

export default async function Image({ params }: { params: { id: string } }) {
  const shareId = params.id;

  // Try to fetch the blueprint data
  let blueprintName = "Experience Blueprint";
  let tagline = "Transform any idea into a production blueprint";
  let colorPalette = ["#1A1A2E", "#FF006E", "#00F5D4", "#FEE440", "#9B5DE5"];
  let creativeSeed = "";

  try {
    const baseUrl = process.env.NEXT_PUBLIC_ATLVS_URL || "https://atlvs.ghxstship.com";
    const response = await fetch(`${baseUrl}/api/generator/share?id=${shareId}`);
    if (response.ok) {
      const data = await response.json();
      if (data.blueprint) {
        blueprintName = data.blueprint.concept?.name || blueprintName;
        tagline = data.blueprint.concept?.tagline || tagline;
        colorPalette = data.blueprint.concept?.visualIdentity?.colorPalette || colorPalette;
        creativeSeed = data.blueprint.creativeSeed || "";
      }
    }
  } catch {
    // Use defaults if fetch fails
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#1A1A2E",
          padding: "60px",
          position: "relative",
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Color Palette Strip */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "8px",
          }}
        >
          {colorPalette.map((color, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                backgroundColor: color,
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            zIndex: 1,
          }}
        >
          {/* Creative Seed Badge */}
          {creativeSeed && (
            <div
              style={{
                display: "flex",
                backgroundColor: "rgba(255,255,255,0.1)",
                border: "2px solid rgba(255,255,255,0.2)",
                padding: "8px 24px",
                marginBottom: "24px",
                fontSize: "18px",
                color: "#FF006E",
                fontWeight: 700,
                letterSpacing: "4px",
                textTransform: "uppercase",
              }}
            >
              {creativeSeed}
            </div>
          )}

          {/* Blueprint Name */}
          <div
            style={{
              fontSize: "72px",
              fontWeight: 900,
              color: "white",
              textTransform: "uppercase",
              letterSpacing: "4px",
              lineHeight: 1.1,
              maxWidth: "900px",
              marginBottom: "24px",
            }}
          >
            {blueprintName}
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: "28px",
              color: "rgba(255,255,255,0.7)",
              fontStyle: "italic",
              maxWidth: "700px",
            }}
          >
            &ldquo;{tagline}&rdquo;
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            {/* ATLVS Logo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "48px",
                height: "48px",
                backgroundColor: "#FF006E",
                border: "3px solid white",
              }}
            >
              <span style={{ color: "white", fontSize: "24px", fontWeight: 900 }}>A</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: "white", fontSize: "24px", fontWeight: 700, letterSpacing: "4px" }}>
                ATLVS
              </span>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", letterSpacing: "2px" }}>
                EXPERIENCE GENERATOR
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              backgroundColor: "#FF006E",
              padding: "12px 32px",
              border: "3px solid white",
              color: "white",
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            View Blueprint
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
