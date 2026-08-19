import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Tag, Share2, Check, ExternalLink, Sparkles, Edit3 } from "lucide-react";
import { INITIAL_STORIES } from "../config/nodesData";

export default function ArticlePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check if story is available in initial seed data or fetch from backend API
    const found = INITIAL_STORIES.find((s) => s.slug === slug || s.id === slug);
    if (found) {
      setStory(found);
      setLoading(false);
    } else {
      // Attempt backend API fetch
      fetch(`/api/stories/${slug}/`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Not found");
        })
        .then((data) => {
          setStory(data);
          setLoading(false);
        })
        .catch(() => {
          setStory(null);
          setLoading(false);
        });
    }

    window.scrollTo(0, 0);
  }, [slug]);

  // Track reading scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Minimalist Markdown to JSX renderer
  const renderContent = (contentStr) => {
    if (!contentStr) return null;

    const lines = contentStr.split("\n");
    const elements = [];
    let inCodeBlock = false;
    let codeContent = [];

    lines.forEach((line, idx) => {
      // Code Blocks
      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          elements.push(
            <pre
              key={`code-${idx}`}
              style={{
                background: "#0d131f",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "10px",
                padding: "16px 20px",
                overflowX: "auto",
                fontSize: "13px",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                color: "#7dd3fc",
                margin: "24px 0",
                lineHeight: "1.6",
              }}
            >
              <code>{codeContent.join("\n")}</code>
            </pre>
          );
          codeContent = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        return;
      }

      // Headers
      if (line.startsWith("# ")) {
        elements.push(
          <h1
            key={idx}
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: "800",
              color: "#ffffff",
              letterSpacing: "-0.02em",
              margin: "32px 0 16px 0",
              lineHeight: "1.2",
            }}
          >
            {line.replace("# ", "")}
          </h1>
        );
      } else if (line.startsWith("## ")) {
        elements.push(
          <h2
            key={idx}
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#f8fafc",
              letterSpacing: "-0.01em",
              margin: "36px 0 14px 0",
              lineHeight: "1.3",
            }}
          >
            {line.replace("## ", "")}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        elements.push(
          <h3
            key={idx}
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#e2e8f0",
              margin: "24px 0 10px 0",
            }}
          >
            {line.replace("### ", "")}
          </h3>
        );
      }
      // Blockquotes
      else if (line.startsWith("> ")) {
        elements.push(
          <blockquote
            key={idx}
            style={{
              borderLeft: "3px solid #ec4899",
              background: "rgba(236, 72, 153, 0.08)",
              padding: "14px 20px",
              borderRadius: "0 8px 8px 0",
              margin: "24px 0",
              fontStyle: "italic",
              color: "#f1f5f9",
              fontSize: "16px",
              lineHeight: "1.6",
            }}
          >
            {line.replace("> ", "").replace(/"/g, "")}
          </blockquote>
        );
      }
      // Images & GIFs: ![alt](url)
      else if (line.match(/^!\[(.*?)\]\((.*?)\)/)) {
        const match = line.match(/^!\[(.*?)\]\((.*?)\)/);
        const alt = match[1];
        const src = match[2];
        elements.push(
          <figure key={idx} style={{ margin: "32px 0" }}>
            <img
              src={src}
              alt={alt}
              style={{
                width: "100%",
                maxHeight: "520px",
                objectFit: "cover",
                borderRadius: "14px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 12px 35px rgba(0, 0, 0, 0.4)",
              }}
            />
            {alt && (
              <figcaption
                style={{
                  textAlign: "center",
                  fontSize: "12px",
                  color: "#94a3b8",
                  marginTop: "8px",
                  fontStyle: "italic",
                }}
              >
                {alt}
              </figcaption>
            )}
          </figure>
        );
      }
      // Horizontal Rule
      else if (line.trim() === "---") {
        elements.push(
          <hr
            key={idx}
            style={{
              border: "none",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              margin: "36px 0",
            }}
          />
        );
      }
      // Bullet items
      else if (line.trim().startsWith("- ") || line.trim().startsWith("1. ") || line.trim().startsWith("2. ") || line.trim().startsWith("3. ")) {
        elements.push(
          <li
            key={idx}
            style={{
              fontSize: "16px",
              lineHeight: "1.8",
              color: "#cbd5e1",
              marginLeft: "24px",
              marginBottom: "6px",
            }}
          >
            {line.replace(/^-\s|^\d+\.\s/, "")}
          </li>
        );
      }
      // Paragraphs
      else if (line.trim().length > 0) {
        elements.push(
          <p
            key={idx}
            style={{
              fontSize: "16px",
              lineHeight: "1.8",
              color: "#cbd5e1",
              margin: "0 0 18px 0",
              fontWeight: "400",
            }}
          >
            {line}
          </p>
        );
      }
    });

    return elements;
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#080c16",
          color: "#00f0ff",
          fontSize: "16px",
          gap: "12px",
        }}
      >
        <Sparkles className="animate-spin" />
        <span>Loading Story from Nexus...</span>
      </div>
    );
  }

  if (!story) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#080c16",
          color: "#e2e8f0",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <h2 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>Story Node Not Found</h2>
        <p style={{ color: "#64748b", marginBottom: "24px" }}>
          The requested memory node is either unindexed or has been relocated.
        </p>
        <button
          onClick={() => navigate("/")}
          style={{
            background: "#00f0ff",
            color: "#080c16",
            padding: "10px 20px",
            borderRadius: "999px",
            fontWeight: "600",
            border: "none",
            cursor: "pointer",
          }}
        >
          Return to Neural Sphere
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080c16",
        color: "#e2e8f0",
        position: "relative",
      }}
    >
      {/* Top Reading Progress Bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "3px",
          width: `${scrollProgress}%`,
          background: "linear-gradient(90deg, #ec4899, #00f0ff)",
          zIndex: 100,
          transition: "width 0.1s ease-out",
        }}
      />

      {/* Top Floating Navigation */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "rgba(8, 12, 22, 0.85)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#cbd5e1",
            padding: "6px 14px",
            borderRadius: "999px",
            fontSize: "13px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#00f0ff";
            e.currentTarget.style.color = "#00f0ff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
            e.currentTarget.style.color = "#cbd5e1";
          }}
        >
          <ArrowLeft size={15} />
          <span>Neural Sphere</span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={handleCopyLink}
            title="Share story link"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "transparent",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#94a3b8",
              padding: "6px 12px",
              borderRadius: "999px",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            {copied ? <Check size={13} color="#22c55e" /> : <Share2 size={13} />}
            <span>{copied ? "Link Copied" : "Share"}</span>
          </button>

          {/* Admin Editor Shortcut */}
          <a
            href="/admin/games/story/"
            target="_blank"
            rel="noopener noreferrer"
            title="Open Story in Django Admin Editor"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              background: "rgba(236, 72, 153, 0.15)",
              border: "1px solid rgba(236, 72, 153, 0.35)",
              color: "#f472b6",
              padding: "6px 12px",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            <Edit3 size={13} />
            <span>Admin Edit</span>
          </a>
        </div>
      </header>

      {/* Main Article Container */}
      <main
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "40px 20px 100px 20px",
        }}
      >
        {/* Cover Header */}
        {story.cover_url && (
          <div
            style={{
              marginBottom: "36px",
              borderRadius: "16px",
              overflow: "hidden",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              maxHeight: "420px",
            }}
          >
            <img
              src={story.cover_url}
              alt={story.title}
              style={{
                width: "100%",
                height: "100%",
                maxHeight: "420px",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
        )}

        {/* Metadata Badges */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "12px",
            fontSize: "12px",
            color: "#94a3b8",
            marginBottom: "16px",
          }}
        >
          {story.published_at && (
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Calendar size={13} />
              {story.published_at}
            </span>
          )}

          {story.reading_time && (
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Clock size={13} />
              {story.reading_time}
            </span>
          )}

          {story.author && (
            <span
              style={{
                background: "rgba(0, 240, 255, 0.1)",
                color: "#00f0ff",
                padding: "2px 8px",
                borderRadius: "4px",
                fontWeight: "500",
              }}
            >
              By {story.author}
            </span>
          )}
        </div>

        {/* Story Title & Subtitle */}
        <h1
          style={{
            fontSize: "clamp(32px, 5vw, 48px)",
            fontWeight: "800",
            color: "#ffffff",
            letterSpacing: "-0.03em",
            lineHeight: "1.15",
            margin: "0 0 16px 0",
          }}
        >
          {story.title}
        </h1>

        {story.subtitle && (
          <p
            style={{
              fontSize: "18px",
              lineHeight: "1.5",
              color: "#94a3b8",
              marginBottom: "32px",
              fontWeight: "400",
            }}
          >
            {story.subtitle}
          </p>
        )}

        <hr
          style={{
            border: "none",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            marginBottom: "36px",
          }}
        />

        {/* Story Body Content */}
        <article style={{ fontSize: "16px", color: "#cbd5e1" }}>
          {renderContent(story.content)}
        </article>

        {/* Story Tags */}
        {story.tags && (
          <div
            style={{
              marginTop: "48px",
              paddingTop: "24px",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            {(Array.isArray(story.tags) ? story.tags : String(story.tags).split(",")).map((t, idx) => (
              <span
                key={idx}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "11px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  color: "#94a3b8",
                }}
              >
                <Tag size={11} />
                {String(t).trim()}
              </span>
            ))}
          </div>
        )}

        {/* Return to Nexus Footer Action */}
        <div
          style={{
            marginTop: "60px",
            textAlign: "center",
            padding: "32px",
            background: "rgba(13, 19, 33, 0.6)",
            border: "1px solid rgba(0, 240, 255, 0.2)",
            borderRadius: "16px",
          }}
        >
          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#ffffff", marginBottom: "8px" }}>
            Ready to explore other constellation nodes?
          </h3>
          <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
            Return to the 3D neural nexus to explore games, tools, and social links.
          </p>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "linear-gradient(90deg, #00f0ff, #38bdf8)",
              color: "#080c16",
              fontWeight: "700",
              fontSize: "14px",
              padding: "10px 24px",
              borderRadius: "999px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 0 20px rgba(0, 240, 255, 0.4)",
            }}
          >
            Return to 3D Neural Nexus ➔
          </button>
        </div>
      </main>
    </div>
  );
}
