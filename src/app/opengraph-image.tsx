import { ImageResponse } from "next/og";

export const alt = "Veta - Gestión de Proyectos de Diseño Interior";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #5a7d6a 0%, #7a9d7a 100%)",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 72,
          fontWeight: 700,
          color: "white",
          textAlign: "center",
          letterSpacing: "-0.02em",
        }}
      >
        Veta
      </div>
      <div
        style={{
          fontSize: 28,
          color: "rgba(255,255,255,0.9)",
          marginTop: 16,
          textAlign: "center",
          maxWidth: 800,
        }}
      >
        Gestión de proyectos de diseño interior sin complicaciones
      </div>
    </div>,
    { ...size }
  );
}
