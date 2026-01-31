import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ProjectDetail from "./pages/ProjectDetail";
import NotesPage from "./pages/NotesPage";
import PostsPage from "./pages/PostPage";
import Navbar from "./components/Navbar";
import "./styles/navbar.css";
import "./styles/home.css";
import "./styles/shelves.css";
import "./styles/project.css";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/project/:slug" element={<ProjectDetail />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/posts" element={<PostsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
