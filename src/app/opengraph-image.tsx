import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Sparkride — Airport Transfers Castleford & West Yorkshire";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 64,
          background: "linear-gradient(135deg, #191c23 0%, #1e2438 50%, #191c23 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: "#82dbdf",
            marginBottom: 16,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Sparkride
        </div>
        <div style={{ fontSize: 56, fontWeight: 400, lineHeight: 1.1, maxWidth: 900 }}>
          Airport Transfers Castleford & West Yorkshire
        </div>
        <div style={{ fontSize: 28, marginTop: 24, color: "#d1d5db", maxWidth: 800, lineHeight: 1.4 }}>
          Fixed-price electric transfers. Leeds Bradford from £45. Book online 24/7.
        </div>
      </div>
    ),
    { ...size }
  );
}
