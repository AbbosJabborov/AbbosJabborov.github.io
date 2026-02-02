import React, { useEffect, useState } from "react";
import { fetchProjects } from "../api/projects";
import Shelf from "../components/Shelf";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchProjects();
        setProjects(data);
      } catch (err) {
        console.error("Failed to load projects:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="loading">Loading…</div>;

  return (
    <div className="projects-page">
      <h1 className="page-title">
        projects (cannot open for now sry, come back tomorrow)
      </h1>
      <Shelf items={projects} />
    </div>
  );
}
