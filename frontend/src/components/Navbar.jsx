import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../config/api";

export default function Navbar() {
  const [track, setTrack] = useState(null);
  const [lastTrack, setLastTrack] = useState(null);
  const [eyePosition, setEyePosition] = useState({
    left: { x: 0, y: 0 },
    right: { x: 0, y: 0 },
  });
  const leftEyeRef = useRef(null);
  const rightEyeRef = useRef(null);

  useEffect(() => {
    // Load last track from localStorage on mount
    const stored = localStorage.getItem("lastSpotifyTrack");
    if (stored) {
      try {
        setLastTrack(JSON.parse(stored));
      } catch (e) {
        console.warn("Failed to parse stored track");
      }
    }

    let timer;
    async function fetchNowPlaying() {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/spotify/currently-playing/`,
        );
        if (!res.ok) return;
        const data = await res.json();
        setTrack(data);

        // Store the track if it's playing
        if (data.is_playing) {
          localStorage.setItem("lastSpotifyTrack", JSON.stringify(data));
          setLastTrack(data);
        }
      } catch (e) {
        console.warn("Spotify fetch failed", e);
      }
    }

    fetchNowPlaying();
    timer = setInterval(fetchNowPlaying, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function handleMouseMove(e) {
      if (!leftEyeRef.current || !rightEyeRef.current) return;

      const moveEye = (eyeRef) => {
        const eye = eyeRef.current;
        const rect = eye.getBoundingClientRect();
        const eyeCenterX = rect.left + rect.width / 2;
        const eyeCenterY = rect.top + rect.height / 2;

        const angle = Math.atan2(
          e.clientY - eyeCenterY,
          e.clientX - eyeCenterX,
        );
        const distance = Math.min(
          8,
          Math.hypot(e.clientX - eyeCenterX, e.clientY - eyeCenterY) / 30,
        );

        return {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
        };
      };

      setEyePosition({
        left: moveEye(leftEyeRef),
        right: moveEye(rightEyeRef),
      });
    }

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const displayTrack = track?.is_playing ? track : lastTrack;
  const isPlaying = track?.is_playing;

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="brand">
          claive
        </Link>
        <Link to="/projects">projects</Link>
        <Link to="/games">games</Link>
        <Link to="/notes">notes</Link>

        <Link to="/posts">posts</Link>
        <a
          href="https://github.com/AbbosJabborov"
          target="_blank"
          rel="noreferrer"
        >
          github
        </a>
      </div>

      <div className="nav-eyes">
        <div className="eye" ref={leftEyeRef}>
          <div
            className="pupil"
            style={{
              transform: `translate(${eyePosition.left.x}px, ${eyePosition.left.y}px)`,
            }}
          />
        </div>
        <div className="eye" ref={rightEyeRef}>
          <div
            className="pupil"
            style={{
              transform: `translate(${eyePosition.right.x}px, ${eyePosition.right.y}px)`,
            }}
          />
        </div>
      </div>

      <div className="nav-right">
        {displayTrack ? (
          <a
            className={`spotify ${isPlaying ? "playing" : "idle"}`}
            href={displayTrack.song_url}
            target="_blank"
            rel="noreferrer"
          >
            <span className="spotify-icon">{isPlaying ? "🎧" : "⏸"}</span>
            <span className="spotify-text">
              {displayTrack.track} – {displayTrack.artist}
            </span>
          </a>
        ) : (
          <span className="spotify no-track">🎧 nothing yet</span>
        )}
      </div>
    </nav>
  );
}
