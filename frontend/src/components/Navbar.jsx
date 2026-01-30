import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../config/api";

export default function Navbar() {
  const [track, setTrack] = useState(null);

  useEffect(() => {
    let timer;

    async function fetchNowPlaying() {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/spotify/currently-playing/`,
        );

        if (!res.ok) return;

        const data = await res.json();
        setTrack(data);
      } catch (e) {
        console.warn("Spotify fetch failed", e);
      }
    }

    fetchNowPlaying();
    timer = setInterval(fetchNowPlaying, 30000);

    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="brand">
          claive
        </Link>
        <Link to="/">Projects</Link>
        <Link to="/notes">Notes</Link>
        <Link to="/posts">Posts</Link>
        <a
          href="https://github.com/AbbosJabborov"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </div>

      <div className="nav-right">
        {track && track.is_playing ? (
          <a
            className="spotify"
            href={track.song_url}
            target="_blank"
            rel="noreferrer"
          >
            🎧 {track.track} – {track.artist}
          </a>
        ) : (
          <span className="spotify idle">🎧 Not playing</span>
        )}
      </div>
    </nav>
  );
}
