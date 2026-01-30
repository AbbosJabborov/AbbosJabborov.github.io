import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Simple fetch helper - adjust base if you configured Vite proxy
async function fetchProject(id) {
  const res = await fetch(`/api/projects/${id}/`);
  if (!res.ok) throw new Error("Failed to load project");
  return res.json();
}

export default function ProjectDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchProject(id)
      .then((data) => {
        if (!mounted) return;
        setProject(data);
      })
      .catch((e) => {
        console.error(e);
        if (!mounted) return;
        setErr(e.message || "Load failed");
      })
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, [id]);

  if (loading) return <div className="loading">Loading…</div>;
  if (err) return <div className="error">Error: {err}</div>;
  if (!project) return <div className="error">Project not found</div>;

  const {
    title,
    cover,
    desc,
    is_opensource,
    web_url,
    pc_url,
    mobile_url,
    embed_html,
  } = project;

  // Choose best playable or link
  function play() {
    if (embed_html) {
      // embedded on page — nothing to do
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (web_url) {
      window.open(web_url, "_blank");
    } else if (pc_url) {
      window.open(pc_url, "_blank");
    } else if (mobile_url) {
      window.open(mobile_url, "_blank");
    } else {
      alert("No playable build or link available for this project.");
    }
  }

  return (
    <div className="project-page">
      <div className="project-hero">
        <button className="back-btn" onClick={() => nav(-1)}>
          ← Back
        </button>

        <div className="project-meta">
          <h1 className="project-title">{title}</h1>
          {is_opensource && <span className="badge">Open Source</span>}
          <p className="project-desc">{desc}</p>

          <div className="project-actions">
            <button className="btn primary" onClick={play}>
              Play / Open
            </button>

            {pc_url && (
              <a className="btn" href={pc_url} target="_blank" rel="noreferrer">
                Download (PC)
              </a>
            )}

            {web_url && (
              <a
                className="btn"
                href={web_url}
                target="_blank"
                rel="noreferrer"
              >
                Open Web Version
              </a>
            )}

            {mobile_url && (
              <a
                className="btn"
                href={mobile_url}
                target="_blank"
                rel="noreferrer"
              >
                Mobile / Store
              </a>
            )}
          </div>
        </div>

        <div className="project-cover">
          {cover ? (
            <img src={cover} alt={title} />
          ) : (
            <div className="no-cover">No cover</div>
          )}
        </div>
      </div>

      <div className="project-embed-section">
        {embed_html ? (
          <div
            className="embed-container"
            // embed_html intentionally comes from trusted admin input
            dangerouslySetInnerHTML={{ __html: embed_html }}
          />
        ) : (
          <div className="no-embed">
            No playable embed available for this project.
          </div>
        )}
      </div>

      {/* Future extras: reviews, tags, related projects */}
    </div>
  );
}
