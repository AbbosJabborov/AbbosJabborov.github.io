import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import API_BASE_URL from "../config/api";

export default function Navbar() {
  const location = useLocation();
  const [track, setTrack] = useState(null);
  const [lastTrack, setLastTrack] = useState(null);
  const [eyePosition, setEyePosition] = useState({
    left: { x: 0, y: 0 },
    right: { x: 0, y: 0 },
  });
  const leftEyeRef = useRef(null);
  const rightEyeRef = useRef(null);

  const [steamProfile, setSteamProfile] = useState({
    personaname: "clevercap",
    avatar: "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg",
    profileurl: "https://steamcommunity.com/id/clevercap/",
  });

  useEffect(() => {
    async function loadSteamProfile() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/steam/profile/`);
        if (res.ok) {
          const data = await res.json();
          if (data.personaname && data.avatar) {
            setSteamProfile(data);
          }
        }
      } catch (e) {
        console.warn("Failed to fetch steam profile", e);
      }
    }
    loadSteamProfile();
  }, []);

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
          `${API_BASE_URL}/api/spotify/currently-playing/`
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
          e.clientX - eyeCenterX
        );
        const distance = Math.min(
          6,
          Math.hypot(e.clientX - eyeCenterX, e.clientY - eyeCenterY) / 35
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

  const getSubNavItems = () => {
    const path = location.pathname;
    if (path === "/") {
      return [
        { label: "PROFILE", path: "/", active: true },
        { label: "SHOWCASE", path: "/#showcase" },
        { label: "ACTIVITIES", path: "/posts" },
        { label: "NOTES WALL", path: "/notes" },
        { label: "GAMES", path: "/games" },
      ];
    } else if (path === "/projects") {
      return [
        { label: "STORE HOME", path: "/projects", active: true },
        { label: "FEATURED SHOWCASE", path: "/" },
        { label: "GAMES", path: "/games" },
      ];
    } else if (path === "/games") {
      return [
        { label: "MY LIBRARY", path: "/games", active: true },
        { label: "FAVORITES", path: "/games" },
        { label: "STEAM PROFILE", path: "/" },
      ];
    } else if (path === "/notes") {
      return [
        { label: "COMMUNITY WALL", path: "/notes", active: true },
        { label: "LEAVE A NOTE", path: "/notes" },
        { label: "PROFILE", path: "/" },
      ];
    } else if (path === "/posts") {
      return [
        { label: "NEWS & POSTS", path: "/posts", active: true },
        { label: "PROFILE", path: "/" },
      ];
    }
    return [
      { label: "PROFILE", path: "/" },
      { label: "PROJECTS", path: "/projects" },
    ];
  };

  return (
    <header className="steam-header-wrapper">
      {/* Top Steam Main Bar */}
      <nav className="steam-main-navbar">
        <div className="steam-nav-left">
          <Link to="/" className="steam-logo-brand">
            <svg
              className="steam-icon-svg"
              viewBox="0 0 24 24"
              width="28"
              height="28"
              fill="currentColor"
            >
              <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.029 4.524 4.524s-2.03 4.524-4.524 4.524c-.21 0-.414-.02-.616-.048l-4.04 2.871c.004.053.01.106.01.16 0 1.977-1.608 3.585-3.585 3.585-1.72 0-3.155-1.217-3.498-2.837L.31 15.11C1.651 20.306 6.368 24 11.979 24c6.627 0 12-5.373 12-12s-5.373-12-12-12zm-4.113 18.061c-.139 0-.276-.017-.408-.048l1.868.772c.866.358 1.859-.05 2.217-.916.358-.866-.05-1.859-.916-2.217l-1.921-.794c.328-.184.707-.291 1.11-.291.95 0 1.764.593 2.091 1.434l-.001.002c.404.975-.059 2.094-1.034 2.499a2.158 2.158 0 0 1-1.006.223zm10.091-6.858a2.264 2.264 0 1 1 0-4.528 2.264 2.264 0 0 1 0 4.528z" />
            </svg>
            <div className="steam-brand-text">
              <span className="brand-primary">STEAM</span>
              <span className="brand-secondary">// CLAIVE</span>
            </div>
          </Link>

          <div className="steam-nav-links">
            <Link
              to="/"
              className={`steam-nav-tab ${
                location.pathname === "/" ? "active" : ""
              }`}
            >
              PROFILE
            </Link>
            <Link
              to="/projects"
              className={`steam-nav-tab ${
                location.pathname === "/projects" ? "active" : ""
              }`}
            >
              STORE / PROJECTS
            </Link>
            <Link
              to="/games"
              className={`steam-nav-tab ${
                location.pathname === "/games" ? "active" : ""
              }`}
            >
              LIBRARY / GAMES
            </Link>
            <Link
              to="/notes"
              className={`steam-nav-tab ${
                location.pathname === "/notes" ? "active" : ""
              }`}
            >
              NOTES WALL
            </Link>
            <Link
              to="/posts"
              className={`steam-nav-tab ${
                location.pathname === "/posts" ? "active" : ""
              }`}
            >
              POSTS
            </Link>
            <a
              href="https://github.com/AbbosJabborov"
              target="_blank"
              rel="noreferrer"
              className="steam-nav-tab external"
            >
              GITHUB ↗
            </a>
          </div>
        </div>

        {/* Center Steam HUD Eyes */}
        <div className="steam-eyes-hud" title="Tracking Cursor">
          <div className="eye-socket" ref={leftEyeRef}>
            <div
              className="eye-pupil"
              style={{
                transform: `translate(${eyePosition.left.x}px, ${eyePosition.left.y}px)`,
              }}
            />
          </div>
          <div className="eye-socket" ref={rightEyeRef}>
            <div
              className="eye-pupil"
              style={{
                transform: `translate(${eyePosition.right.x}px, ${eyePosition.right.y}px)`,
              }}
            />
          </div>
        </div>

        {/* Right User & Spotify Widget */}
        <div className="steam-nav-right">
          {displayTrack ? (
            <a
              className={`steam-spotify-widget ${
                isPlaying ? "in-game" : "idle"
              }`}
              href={displayTrack.song_url}
              target="_blank"
              rel="noreferrer"
            >
              <div className="spotify-status-indicator">
                <span className="status-dot" />
                <span className="status-label">
                  {isPlaying ? "IN-GAME" : "LAST PLAYED"}
                </span>
              </div>
              <div className="spotify-track-info">
                <span className="spotify-song">{displayTrack.track}</span>
                <span className="spotify-artist">– {displayTrack.artist}</span>
              </div>
            </a>
          ) : (
            <div className="steam-spotify-widget idle">
              <span className="status-dot" />
              <span className="spotify-song">ONLINE</span>
            </div>
          )}

          <a
            href={steamProfile.profileurl || "https://steamcommunity.com/id/clevercap/"}
            target="_blank"
            rel="noreferrer"
            className="steam-user-profile-badge"
            title="Open Steam Profile"
          >
            <div className="user-avatar-frame">
              <img
                src={steamProfile.avatar || "/steam_avatar.png"}
                alt={steamProfile.personaname || "clevercap"}
                className="user-avatar-img"
                onError={(e) => {
                  e.target.src =
                    "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg";
                }}
              />
            </div>
            <div className="user-details">
              <span className="user-name">{steamProfile.personaname || "clevercap"}</span>
              <span className="user-level">Lvl 42</span>
            </div>
          </a>

        </div>
      </nav>

      {/* Sub Header Navigation Bar */}
      <div className="steam-sub-navbar">
        <div className="steam-subnav-container">
          {getSubNavItems().map((item, idx) => (
            <Link
              key={idx}
              to={item.path}
              className={`steam-subnav-item ${item.active ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}

