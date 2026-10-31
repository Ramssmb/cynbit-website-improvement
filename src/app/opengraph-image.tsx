import { ImageResponse } from "next/og";

export const alt = "Project Blueprint Builder — plan your project in two minutes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PHASES = [
  ["Discovery & audit", 10],
  ["Strategy & blueprinting", 10],
  ["High-fidelity design", 15],
  ["Technical implementation", 45],
  ["Quality & integrity check", 12],
  ["Deployment & evolution", 8],
] as const;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f7fafa", padding: 64, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 620 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#006067", letterSpacing: 4 }}>CYNBIT · PROTOTYPE</div>
          <div style={{ fontSize: 72, fontWeight: 800, color: "#181c1d", lineHeight: 1.05, marginTop: 20 }}>
            Plan your project in two minutes.
          </div>
          <div style={{ fontSize: 28, color: "#5b6667", marginTop: 24 }}>
            Instant phases, timeline, stack and budget fit — then one click to send.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginLeft: 48,
            flex: 1,
            background: "#fff",
            borderRadius: 32,
            border: "2px solid #dfe7e7",
            padding: 36,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, color: "#006067", letterSpacing: 3 }}>INDICATIVE BLUEPRINT</div>
          <div style={{ fontSize: 56, fontWeight: 800, color: "#181c1d", marginTop: 8 }}>9–14 weeks</div>
          {PHASES.map(([name, share]) => (
            <div key={name} style={{ display: "flex", flexDirection: "column", marginTop: 14 }}>
              <div style={{ fontSize: 18, color: "#181c1d" }}>{name}</div>
              <div style={{ display: "flex", height: 10, background: "#dfe7e7", borderRadius: 5, marginTop: 6 }}>
                <div style={{ width: `${(share / 45) * 100}%`, background: "#006067", borderRadius: 5 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
