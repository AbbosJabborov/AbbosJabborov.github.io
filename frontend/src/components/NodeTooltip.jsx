import React from "react";

export default function NodeTooltip({ hoverInfo }) {
  if (!hoverInfo || !hoverInfo.node || !hoverInfo.isVisible) return null;

  const { node, screenX, screenY } = hoverInfo;

  return (
    <div
      style={{
        position: "fixed",
        left: `${screenX + 16}px`,
        top: `${screenY - 14}px`,
        pointerEvents: "none",
        zIndex: 50,
        transform: "translate3d(0, 0, 0)",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        background: "rgba(5, 8, 16, 0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        borderRadius: "6px",
        padding: "5px 12px",
        color: "#ffffff",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.6)",
        whiteSpace: "nowrap",
        fontSize: "13px",
        fontWeight: "500",
        letterSpacing: "0.02em",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: node.color || "#00f0ff",
          boxShadow: `0 0 8px ${node.color || "#00f0ff"}`,
        }}
      />
      <span style={{ color: "#f8fafc" }}>{node.label}</span>
      <span style={{ color: "#64748b", fontSize: "11px" }}>➔</span>
    </div>
  );
}

