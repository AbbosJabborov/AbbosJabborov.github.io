import React, { useEffect, useState } from "react";
import { fetchProjects } from "../api/projects";
import Shelf from "../components/Shelf";
import TypingAnimation from "../components/TypingAnimation";

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

  if (loading) return <div className="loading">Loading…</div>;

  return (
    <div className="home">
      <div className="home-hero">
        <TypingAnimation />
        <div className="hero-subtitle">
          <p>here you can:</p>
          <p>
            *try out my publicly open{" "}
            <span className="highlight">projects</span>
          </p>
          <p>
            *leave <span className="highlight">notes</span>
          </p>
          <p>
            *read my <span className="highlight">posts</span>
          </p>
          <p>*even see what i am listening to on spotify at the moment</p>
        </div>
      </div>

      <div className="projects-section">
        <h2 className="section-title">projects</h2>
        <Shelf items={projects} />
      </div>
    </div>
  );
}
