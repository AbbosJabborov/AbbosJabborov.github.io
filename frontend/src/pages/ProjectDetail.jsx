import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";

async function fetchProjectBySlug(slug) {
  const res = await fetch(`${API_BASE_URL}/api/projects/${slug}/`);
  if (!res.ok) throw new Error("Failed to load project");
  return res.json();
}

export default function ProjectDetail() {
  const { slug } = useParams();
  const nav = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchProjectBySlug(slug)
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
  }, [slug]);

  if (loading) return <div className="loading">Loading…</div>;
  if (err) return <div className="error">Error: {err}</div>;
  if (!project) return <div className="error">Project not found</div>;

  const { title, cover, desc, is_opensource, embed_html } = project;

  return (
    <div className="project-page">
      <button className="back-btn" onClick={() => nav(-1)}>
        ← back
      </button>

      <div className="project-hero">
        <div className="project-meta">
          <h1 className="project-title">{title}</h1>
          {is_opensource && <span className="badge">open source</span>}
          {desc && <p className="project-desc">{desc}</p>}
        </div>

        {cover && (
          <div className="project-cover">
            <img src={cover} alt={title} />
          </div>
        )}
      </div>

      <div className="project-embed-section">
        {embed_html ? (
          <div
            className="embed-container"
            dangerouslySetInnerHTML={{ __html: embed_html }}
          />
        ) : (
          <div className="no-embed">
            <p>no playable embed available for this project.</p>
          </div>
        )}
      </div>
    </div>
  );
}
