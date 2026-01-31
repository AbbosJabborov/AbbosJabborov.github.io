import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetail from "./pages/ProjectDetail";
import NotesPage from "./pages/NotesPage";
import PostsPage from "./pages/PostsPage";
import Navbar from "./components/Navbar";
import "./styles/navbar.css";
import "./styles/home.css";
import "./styles/projects.css";
import "./styles/shelves.css";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/project/:slug" element={<ProjectDetail />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/posts" element={<PostsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
