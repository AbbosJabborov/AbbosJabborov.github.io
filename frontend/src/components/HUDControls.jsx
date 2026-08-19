import React, { useState } from "react";
import {
  Compass,
  RotateCw,
  Search,
  Layers,
  ExternalLink,
  BookOpen,
  X,
  Sparkles,
  Info,
  Terminal,
  Grid,
} from "lucide-react";
import { CATEGORIES, INITIAL_NODES } from "../config/nodesData";
import { useNavigate } from "react-router-dom";

export default function HUDControls({
  selectedCategory,
  onSelectCategory,
  isAutoRotate,
  onToggleAutoRotate,
  searchQuery,
  onSearchChange,
  nodes = INITIAL_NODES,
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const navigate = useNavigate();

  const filteredNodes = nodes.filter((n) => {
    const matchesCat = selectedCategory === "ALL" || n.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.subtitle && n.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleNodeSelect = (node) => {
    setIsDrawerOpen(false);
    if (node.node_type === "STORY" && node.slug) {
      navigate(`/story/${node.slug}`);
    } else if (node.url) {
      window.open(node.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      {/* Top HUD Bar */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 30,
          pointerEvents: "none",
        }}
      >
        {/* Brand & System Status */}
        <div
          style={{
            pointerEvents: "auto",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            background: "rgba(10, 16, 28, 0.75)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "8px 16px",
            borderRadius: "999px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#00f0ff",
              boxShadow: "0 0 10px #00f0ff",
              animation: "pulse 2s infinite ease-in-out",
            }}
          />
          <div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: "700",
                letterSpacing: "0.08em",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>ABBOS JABBOROV</span>
              <span style={{ color: "#64748b", fontWeight: "400" }}>//</span>
              <span style={{ color: "#38bdf8", fontSize: "11px", fontWeight: "600" }}>
                NEURAL NEXUS
              </span>
            </div>
          </div>
        </div>

        {/* Quick Search & Directory Trigger */}
        <div
          style={{
            pointerEvents: "auto",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <button
            onClick={() => setIsDrawerOpen(true)}
            style={{
              background: "rgba(10, 16, 28, 0.75)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#e2e8f0",
              padding: "8px 14px",
              borderRadius: "999px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#00f0ff")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)")}
          >
            <Search size={14} color="#00f0ff" />
            <span>Search Nodes</span>
            <span
              style={{
                fontSize: "10px",
                background: "rgba(255, 255, 255, 0.1)",
                padding: "2px 6px",
                borderRadius: "4px",
                color: "#94a3b8",
              }}
            >
              {nodes.length}
            </span>
          </button>

          <button
            onClick={() => setIsHelpOpen(!isHelpOpen)}
            title="Navigation Guide"
            style={{
              background: "rgba(10, 16, 28, 0.75)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#94a3b8",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <Info size={16} />
          </button>
        </div>
      </header>

      {/* Category Pills Bar (Top Sub-Header) */}
      <div
        style={{
          position: "fixed",
          top: "76px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          zIndex: 25,
          pointerEvents: "auto",
          maxWidth: "92vw",
          overflowX: "auto",
          padding: "4px 8px",
          scrollbarWidth: "none",
        }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              style={{
                background: isActive ? `${cat.color}25` : "rgba(10, 16, 28, 0.65)",
                backdropFilter: "blur(10px)",
                border: `1px solid ${isActive ? cat.color : "rgba(255, 255, 255, 0.08)"}`,
                color: isActive ? "#ffffff" : "#94a3b8",
                padding: "6px 14px",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: isActive ? "600" : "400",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
                boxShadow: isActive ? `0 0 12px ${cat.color}40` : "none",
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Bottom Floating Control Dock */}
      <footer
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          zIndex: 25,
          pointerEvents: "auto",
        }}
      >
        <div
          style={{
            background: "rgba(10, 16, 28, 0.8)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "999px",
            padding: "6px 12px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
          }}
        >
          {/* Auto rotate toggle */}
          <button
            onClick={onToggleAutoRotate}
            title={isAutoRotate ? "Pause Sphere Drift" : "Resume Sphere Drift"}
            style={{
              background: isAutoRotate ? "rgba(0, 240, 255, 0.15)" : "transparent",
              border: `1px solid ${isAutoRotate ? "#00f0ff55" : "transparent"}`,
              color: isAutoRotate ? "#00f0ff" : "#94a3b8",
              padding: "6px 10px",
              borderRadius: "999px",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <RotateCw
              size={13}
              style={{
                animation: isAutoRotate ? "spin 8s linear infinite" : "none",
              }}
            />
            <span>{isAutoRotate ? "Drift On" : "Drift Off"}</span>
          </button>

          <div style={{ width: "1px", height: "16px", background: "rgba(255, 255, 255, 0.1)" }} />

          {/* Directory Button */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            style={{
              background: "transparent",
              border: "none",
              color: "#cbd5e1",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 8px",
              cursor: "pointer",
            }}
          >
            <Grid size={14} color="#38bdf8" />
            <span>All Nodes</span>
          </button>
        </div>
      </footer>

      {/* Interactive Drag Hint */}
      <div
        style={{
          position: "fixed",
          bottom: "74px",
          left: "50%",
          transform: "translateX(-50%)",
          pointerEvents: "none",
          zIndex: 20,
          background: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          padding: "4px 14px",
          borderRadius: "999px",
          fontSize: "11px",
          color: "#64748b",
          letterSpacing: "0.02em",
        }}
      >
        ✦ Swipe & Drag to rotate 360° • Hover & Click any node
      </div>

      {/* Help Modal */}
      {isHelpOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 60,
            padding: "20px",
          }}
          onClick={() => setIsHelpOpen(false)}
        >
          <div
            style={{
              background: "rgba(13, 20, 36, 0.95)",
              border: "1px solid rgba(0, 240, 255, 0.3)",
              boxShadow: "0 0 35px rgba(0, 240, 255, 0.15)",
              borderRadius: "16px",
              padding: "28px",
              maxWidth: "480px",
              width: "100%",
              color: "#e2e8f0",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Sparkles size={18} color="#00f0ff" />
                Navigating the Neural Sphere
              </h3>
              <button
                onClick={() => setIsHelpOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: "13px", lineHeight: "1.6", color: "#94a3b8" }}>
              <p style={{ marginBottom: "12px" }}>
                You are standing in the **interior focal center** of a 3D neural constellation. Every
                node represents a project, live story, game release, or social gateway.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px 0", display: "grid", gap: "8px" }}>
                <li>🖱️ **Rotate**: Click and drag your mouse (or swipe on touchscreens).</li>
                <li>🎯 **Inspect**: Hover over any glowing node to view its preview card.</li>
                <li>⚡ **Open**: Click any node to instantly launch its external link or enter the Notion-style story reader.</li>
                <li>🏷️ **Filter**: Use the category buttons up top to light up relevant synapses.</li>
              </ul>
            </div>

            <button
              onClick={() => setIsHelpOpen(false)}
              style={{
                width: "100%",
                background: "linear-gradient(90deg, #00f0ff, #38bdf8)",
                color: "#0f172a",
                fontWeight: "700",
                fontSize: "13px",
                padding: "10px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Got it, explore!
            </button>
          </div>
        </div>
      )}

      {/* Nodes Search & Directory Drawer */}
      {isDrawerOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "100%",
            maxWidth: "420px",
            height: "100%",
            background: "rgba(10, 15, 29, 0.95)",
            backdropFilter: "blur(20px)",
            borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "-10px 0 40px rgba(0, 0, 0, 0.5)",
            zIndex: 60,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Drawer Header */}
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#ffffff", margin: 0 }}>
                Node Directory
              </h3>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
                {filteredNodes.length} nodes indexed in graph
              </p>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Search Input */}
          <div style={{ padding: "16px 24px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "10px",
                padding: "8px 14px",
              }}
            >
              <Search size={16} color="#00f0ff" />
              <input
                type="text"
                placeholder="Search nodes, games, stories..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "13px",
                  outline: "none",
                  width: "100%",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#64748b",
                    cursor: "pointer",
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Node List */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "0 24px 24px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {filteredNodes.length === 0 ? (
              <div style={{ textAlign: "center", color: "#64748b", padding: "40px 0" }}>
                No nodes found matching your filter.
              </div>
            ) : (
              filteredNodes.map((node) => (
                <div
                  key={node.id}
                  onClick={() => handleNodeSelect(node)}
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    borderRadius: "12px",
                    padding: "14px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                    e.currentTarget.style.borderColor = node.color || "#00f0ff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: "700",
                        color: node.color || "#00f0ff",
                        textTransform: "uppercase",
                      }}
                    >
                      {node.category}
                    </span>
                    {node.node_type === "STORY" ? (
                      <BookOpen size={13} color="#ec4899" />
                    ) : (
                      <ExternalLink size={13} color="#38bdf8" />
                    )}
                  </div>
                  <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#ffffff", margin: "0 0 4px 0" }}>
                    {node.label}
                  </h4>
                  {node.subtitle && (
                    <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0, lineHeight: "1.4" }}>
                      {node.subtitle}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}
