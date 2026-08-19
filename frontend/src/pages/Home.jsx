import React, { useState } from "react";
import NeuralSphere from "../components/NeuralSphere";
import NodeTooltip from "../components/NodeTooltip";

export default function Home() {
  const [hoverInfo, setHoverInfo] = useState(null);

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#060913",
      }}
    >
      {/* 3D Minimalist Spider-Web Sphere Canvas */}
      <NeuralSphere onHoverNode={setHoverInfo} />

      {/* Sleek Floating Node Label on Hover */}
      <NodeTooltip hoverInfo={hoverInfo} />
    </div>
  );
}

