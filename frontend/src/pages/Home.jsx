import React, { useEffect, useState } from "react";
import { fetchProjects } from "../api/projects";
import Shelf from "../components/Shelf";

export default function Home() {
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

  function openProject(project) {
    // Later: project detail page or external link
    alert(`Selected project: ${project.title}`);
  }

  if (loading) return <div className="loading">Loading…</div>;

  return (
    <div className="home">
      <h1 className="main-title">Projects</h1>

      <Shelf title="All Projects" items={projects} onSelect={openProject} />
    </div>
  );
}
