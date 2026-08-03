import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../config/api";
import "../styles/steam_library.css";

export default function GamesPage() {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [steamProfile, setSteamProfile] = useState({
    personaname: "CleverCap",
    avatar: "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg",
    profileurl: "https://steamcommunity.com/id/clevercap/",
  });

  useEffect(() => {
    fetchGames();
    fetchSteamProfile();
  }, []);

  async function fetchGames() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/games/`);
      if (!res.ok) throw new Error("Failed to fetch games");
      const data = await res.json();
      setGames(data);
      if (data.length > 0 && !selectedGame) {
        setSelectedGame(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSteamProfile() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/steam/profile/`);
      if (res.ok) {
        const data = await res.json();
        setSteamProfile(data);
      }
    } catch (err) {
      console.warn("Failed to fetch Steam profile", err);
    }
  }

  const filteredGames = games.filter((g) =>
    g.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favoriteGames = filteredGames.filter((g) => g.is_favorite);
  const otherGames = filteredGames.filter((g) => !g.is_favorite);

  // Markdown / Telegra.ph content parser for game reviews
  function renderTelegraphContent(content) {
    if (!content) return <p>No review written yet.</p>;

    const paragraphs = content.split("\n\n");
    return paragraphs.map((block, idx) => {
      const trimmed = block.trim();

      // Heading 3
      if (trimmed.startsWith("### ")) {
        return <h3 key={idx}>{trimmed.replace("### ", "")}</h3>;
      }

      // Image or GIF Markdown: ![caption](url)
      const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imgMatch) {
        const caption = imgMatch[1];
        const src = imgMatch[2];
        return (
          <div key={idx} className="telegraph-media-card">
            <img src={src} alt={caption} />
            {caption && <div className="telegraph-media-caption">{caption}</div>}
          </div>
        );
      }

      return <p key={idx}>{trimmed}</p>;
    });
  }

  return (
    <div className="steam-container">
      {/* Top Steam Header Bar */}
      <div className="steam-topbar">
        <div className="steam-nav-links">
          <Link to="/" className="steam-nav-item">HOME</Link>
          <span className="steam-nav-item active">LIBRARY</span>
        </div>
        <a
          href={steamProfile.profileurl || "https://steamcommunity.com/id/clevercap/"}
          target="_blank"
          rel="noreferrer"
          className="steam-user-profile"
          style={{ textDecoration: "none" }}
        >
          <img
            src={steamProfile.avatar}
            alt={steamProfile.personaname}
            className="steam-avatar"
            onError={(e) => {
              e.target.src = "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg";
            }}
          />
          <span>{steamProfile.personaname?.toUpperCase() || "CLEVERCAP"}</span>
        </a>
      </div>

      <div className="steam-body">
        {/* Left Sidebar */}
        <div className="steam-sidebar">
          <div className="steam-sidebar-header">
            <div className="steam-search-box">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Filter by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="steam-game-list">
            {loading ? (
              <div style={{ padding: "16px", color: "#8f98a0" }}>
                Loading library...
              </div>
            ) : (
              <>
                {favoriteGames.length > 0 && (
                  <div className="steam-category">
                    <div className="steam-category-header">
                      <span>★ FAVORITES ({favoriteGames.length})</span>
                    </div>
                    {favoriteGames.map((game) => (
                      <div
                        key={game.id}
                        className={`steam-game-item ${
                          selectedGame?.id === game.id ? "selected" : ""
                        }`}
                        onClick={() => setSelectedGame(game)}
                      >
                        <img
                          src={
                            game.icon_url ||
                            game.cover_url ||
                            "https://cdn.akamai.steamstatic.com/steam/apps/286070/header.jpg"
                          }
                          alt={game.title}
                          className="steam-game-icon"
                          onError={(e) => {
                            e.target.src = "https://cdn.akamai.steamstatic.com/steam/apps/286070/header.jpg";
                          }}
                        />
                        <span className="steam-game-title">{game.title}</span>
                        {game.platform === "EPIC" && (
                          <span style={{ fontSize: "9px", background: "#333", color: "#fff", padding: "1px 4px", borderRadius: "3px", fontWeight: "700" }}>
                            EPIC
                          </span>
                        )}
                        <span className="steam-fav-star">★</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="steam-category">
                  <div className="steam-category-header">
                    <span>ALL GAMES ({otherGames.length})</span>
                  </div>
                  {otherGames.map((game) => (
                    <div
                      key={game.id}
                      className={`steam-game-item ${
                        selectedGame?.id === game.id ? "selected" : ""
                      }`}
                      onClick={() => setSelectedGame(game)}
                    >
                      <img
                        src={
                          game.icon_url ||
                          game.cover_url ||
                          "https://cdn.akamai.steamstatic.com/steam/apps/286070/header.jpg"
                        }
                        alt={game.title}
                        className="steam-game-icon"
                        onError={(e) => {
                          e.target.src = "https://cdn.akamai.steamstatic.com/steam/apps/286070/header.jpg";
                        }}
                      />
                      <span className="steam-game-title">{game.title}</span>
                      {game.platform === "EPIC" && (
                        <span style={{ fontSize: "9px", background: "#333", color: "#fff", padding: "1px 4px", borderRadius: "3px", fontWeight: "700" }}>
                          EPIC
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Main Content */}
        <div className="steam-content">
          {selectedGame ? (
            <>
              {/* Hero Banner Section */}
              <div
                className="steam-hero"
                style={{
                  backgroundImage: `url(${
                    selectedGame.hero_url ||
                    selectedGame.icon_url ||
                    selectedGame.cover_url ||
                    "https://cdn.akamai.steamstatic.com/steam/apps/286070/library_hero.jpg"
                  })`,
                }}
              >
                <div className="steam-hero-overlay" />
                <div className="steam-hero-details">
                  <h1 className="steam-game-headline-title">
                    {selectedGame.title}
                  </h1>

                  {/* Action / Stats Bar */}
                  <div className="steam-action-bar">
                    <a
                      href={
                        selectedGame.store_url ||
                        (selectedGame.steam_appid
                          ? `https://store.steampowered.com/app/${selectedGame.steam_appid}/`
                          : "#")
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="steam-play-btn"
                      style={{ textDecoration: "none" }}
                    >
                      <span>▶</span> PLAY
                    </a>

                    <div className="steam-stat-box">
                      <span className="steam-stat-label">TIME PLAYED</span>
                      <span className="steam-stat-value">
                        {selectedGame.playtime_hours || 0} hrs
                      </span>
                    </div>
                    <div className="steam-stat-box">
                      <span className="steam-stat-label">PLATFORM</span>
                      <span className="steam-stat-value" style={{ color: "#66c0f4" }}>
                        {selectedGame.platform || "STEAM"}
                      </span>
                    </div>
                    <div className="steam-rating-badge">
                      ★ {selectedGame.rating || 10}/10 OVERWHELMINGLY POSITIVE
                    </div>
                  </div>
                </div>
              </div>

              {/* Telegra.ph Style Review Article */}
              <div className="steam-review-container">
                <article className="telegraph-article">
                  <h2 className="telegraph-title">
                    {selectedGame.review_headline ||
                      `My Thoughts on ${selectedGame.title}`}
                  </h2>
                  <div className="telegraph-meta">
                    <span>By <strong className="telegraph-author">Claive</strong></span>
                    <span>•</span>
                    <span>Rating: {selectedGame.rating || 10}/10</span>
                  </div>

                  <div className="telegraph-body">
                    {renderTelegraphContent(selectedGame.review_content)}
                  </div>
                </article>
              </div>
            </>
          ) : (
            <div style={{ padding: "60px", color: "#8f98a0" }}>
              Select a game from the library to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
