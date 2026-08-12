import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../config/api";

const DEFAULT_CUSTOMIZATION = {
  personaName: "Abbos Jabborov",
  realName: "clevercap",
  location: "Tashkent, Uzbekistan",
  bio: "Full-Stack Software Engineer & Web Developer. Building high-performance web apps, interactive engines, and clean UI/UX systems.",
  level: 42,
  themeBg: "default", // 'default' | 'midnight' | 'cyberpunk' | 'space' | 'sunset'
  showcaseType: "projects", // 'projects' | 'games' | 'custom'
  customShowcaseTitle: "ABOUT ME & HIGHLIGHTS",
  customShowcaseBody: "Welcome to my official Steam profile! I build web applications, explore game development, and code full-stack projects.",
};

export default function Home() {
  const [toastMessage, setToastMessage] = useState(null);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Steam API Profile data & games
  const [steamProfile, setSteamProfile] = useState({
    personaname: "Abbos Jabborov",
    avatar: "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg",
    profileurl: "https://steamcommunity.com/id/clevercap/",
  });
  const [featuredGames, setFeaturedGames] = useState([]);

  // Profile Customization state stored in localStorage
  const [customData, setCustomData] = useState(() => {
    try {
      const saved = localStorage.getItem("steamProfileCustomization");
      return saved ? JSON.parse(saved) : DEFAULT_CUSTOMIZATION;
    } catch {
      return DEFAULT_CUSTOMIZATION;
    }
  });

  // Form edit state for modal
  const [editForm, setEditForm] = useState(customData);

  useEffect(() => {
    async function loadProfileData() {
      try {
        const [profRes, gamesRes, notesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/steam/profile/`),
          fetch(`${API_BASE_URL}/api/games/`),
          fetch(`${API_BASE_URL}/api/notes/`),
        ]);

        if (profRes.ok) {
          const pData = await profRes.json();
          if (pData.personaname && pData.avatar) {
            setSteamProfile(pData);
          }
        }
        if (gamesRes.ok) {
          const gData = await gamesRes.json();
          setFeaturedGames(gData);
        }
        if (notesRes.ok) {
          const nData = await notesRes.json();
          setComments(nData);
        }
      } catch (err) {
        console.warn("Failed to load profile data", err);
      }
    }
    loadProfileData();
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveCustomization = (e) => {
    e.preventDefault();
    setCustomData(editForm);
    try {
      localStorage.setItem("steamProfileCustomization", JSON.stringify(editForm));
    } catch (err) {
      console.warn("Failed to save customization", err);
    }
    setShowEditModal(false);
    triggerToast("Profile customization saved!");
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/notes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newComment,
          sender: authorName || "Steam Visitor",
        }),
      });

      if (res.ok) {
        const note = await res.json();
        setComments([note, ...comments]);
        setNewComment("");
        setAuthorName("");
        triggerToast("Comment posted on profile wall!");
      } else {
        const fallbackNote = {
          id: Date.now(),
          message: newComment,
          sender: authorName || "Steam Visitor",
          created_at: new Date().toISOString(),
        };
        setComments([fallbackNote, ...comments]);
        setNewComment("");
        setAuthorName("");
        triggerToast("Comment posted!");
      }
    } catch (err) {
      console.warn("Comment submit error", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const themeClass = `theme-${customData.themeBg || "default"}`;

  return (
    <div className={`steam-profile-page ${themeClass}`}>
      {/* Toast Notification */}
      {toastMessage && <div className="steam-toast">{toastMessage}</div>}

      {/* Steam Profile Header Banner Container */}
      <div className="steam-profile-header-wrapper">
        <div className="steam-profile-header-content">
          {/* Avatar Container */}
          <div className="steam-avatar-box">
            <div className="steam-avatar-frame-solid">
              <img
                src={steamProfile.avatar || "/steam_avatar.png"}
                alt={customData.personaName}
                className="steam-avatar-large"
                onError={(e) => {
                  e.target.src =
                    "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg";
                }}
              />
            </div>
            <div className="steam-status-badge online">ONLINE</div>
          </div>

          {/* User Headline & Bio */}
          <div className="steam-user-headline">
            <div className="steam-user-title-row">
              <h1 className="steam-persona-name">
                {customData.personaName || steamProfile.personaname}
              </h1>
              <span className="steam-handle">{customData.realName || "clevercap"}</span>
              {customData.location && (
                <span className="steam-location-flag">
                  🇺🇿 {customData.location}
                </span>
              )}
            </div>

            {/* Steam Summary Bio Box */}
            <div className="steam-summary-box">
              <div className="steam-bio-details">
                <p>{customData.bio}</p>
                <div className="steam-tech-badges">
                  <span className="tech-tag">React 19</span>
                  <span className="tech-tag">Python / Django</span>
                  <span className="tech-tag">Docker</span>
                  <span className="tech-tag">Cloudflare</span>
                </div>
              </div>
            </div>
          </div>

          {/* Steam Level & Profile Actions */}
          <div className="steam-profile-right-actions">
            <div className="steam-level-container">
              <span className="level-label">Level</span>
              <div className="level-badge-circle">{customData.level}</div>
            </div>

            <div className="steam-badge-preview-box">
              <span className="badge-icon">🏆</span>
              <div className="badge-info">
                <span className="badge-title">Community Pillar</span>
                <span className="badge-xp">4,200 XP</span>
              </div>
            </div>

            <div className="steam-action-buttons-group">
              <button
                className="steam-btn primary"
                onClick={() => {
                  setEditForm(customData);
                  setShowEditModal(true);
                }}
              >
                ⚙️ Edit Profile
              </button>
              <button
                className="steam-btn secondary"
                onClick={() => triggerToast("Friend Request Sent to Claive!")}
              >
                + Add Friend
              </button>
              <a
                href="https://t.me/AbbosJabborov"
                target="_blank"
                rel="noreferrer"
                className="steam-btn secondary"
              >
                💬 Message
              </a>
              <button
                className="steam-btn award"
                onClick={() => setShowAwardModal(true)}
              >
                🏆 Award
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Body Grid (2 Columns) */}
      <div className="steam-profile-body-container">
        {/* Left Column (Selected Showcase & Comments) */}
        <div className="steam-main-col">
          {/* Custom Showcase Selector */}
          {customData.showcaseType === "projects" && (
            <div className="steam-showcase-box" id="showcase">
              <div className="steam-showcase-header">
                <span className="showcase-title">FEATURED PROJECTS SHOWCASE</span>
                <span className="showcase-count">3 ITEMS</span>
              </div>

              <div className="steam-projects-grid">
                <div className="steam-project-card">
                  <div className="project-banner zakoweb">
                    <span className="project-badge">MULTIPLAYER GAME</span>
                  </div>
                  <div className="project-details">
                    <h3 className="project-name">Zakoweb Online</h3>
                    <p className="project-desc">
                      Real-time multiplayer quiz game platform with live answer
                      masking and room lifecycle management.
                    </p>
                    <div className="project-stats-row">
                      <span>⏱ 140 hrs logged</span>
                    </div>
                    <div className="project-action">
                      <Link to="/projects" className="steam-play-btn-green">
                        <span>▶</span> LAUNCH PROJECT
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="steam-project-card">
                  <div className="project-banner plate">
                    <span className="project-badge">AI ASSISTANT</span>
                  </div>
                  <div className="project-details">
                    <h3 className="project-name">Plate. AI Culinary</h3>
                    <p className="project-desc">
                      AI-powered cooking & grocery assistant with ingredient
                      substitution tailored for local stores in Uzbekistan.
                    </p>
                    <div className="project-stats-row">
                      <span>⏱ 95 hrs logged</span>
                    </div>
                    <div className="project-action">
                      <Link to="/projects" className="steam-play-btn-green">
                        <span>▶</span> LAUNCH PROJECT
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="steam-project-card">
                  <div className="project-banner portfolio">
                    <span className="project-badge">WEB PLATFORM</span>
                  </div>
                  <div className="project-details">
                    <h3 className="project-name">Claive.uz Portfolio</h3>
                    <p className="project-desc">
                      Custom Steam UI portfolio built with React 19, Django REST, and
                      Dockerized backend services.
                    </p>
                    <div className="project-stats-row">
                      <span>⏱ 210 hrs logged</span>
                    </div>
                    <div className="project-action">
                      <Link to="/games" className="steam-play-btn-green">
                        <span>▶</span> OPEN LIBRARY
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {customData.showcaseType === "games" && featuredGames.length > 0 && (
            <div className="steam-showcase-box">
              <div className="steam-showcase-header">
                <span className="showcase-title">GAME COLLECTOR SHOWCASE</span>
                <span className="showcase-count">{featuredGames.length} GAMES OWNED</span>
              </div>

              <div className="steam-game-collector-grid">
                {featuredGames.slice(0, 10).map((game) => (
                  <a
                    key={game.id || game.steam_appid}
                    href={game.store_url || `https://store.steampowered.com/app/${game.steam_appid}/`}
                    target="_blank"
                    rel="noreferrer"
                    className="steam-collector-item"
                    title={`${game.title} - ${game.playtime_hours} hrs played`}
                  >
                    <img
                      src={game.cover_url || game.icon_url}
                      alt={game.title}
                      className="collector-cover"
                      onError={(e) => {
                        e.target.src =
                          game.icon_url ||
                          "https://cdn.akamai.steamstatic.com/steam/apps/440/header.jpg";
                      }}
                    />
                    <div className="collector-overlay">
                      <span className="collector-hours">{game.playtime_hours} hrs</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {customData.showcaseType === "custom" && (
            <div className="steam-showcase-box">
              <div className="steam-showcase-header">
                <span className="showcase-title">{customData.customShowcaseTitle.toUpperCase()}</span>
              </div>
              <div className="custom-showcase-body">
                <p>{customData.customShowcaseBody}</p>
              </div>
            </div>
          )}

          {/* Secondary Showcase: Game Collector (if projects is primary) */}
          {customData.showcaseType === "projects" && featuredGames.length > 0 && (
            <div className="steam-showcase-box">
              <div className="steam-showcase-header">
                <span className="showcase-title">GAME COLLECTOR SHOWCASE</span>
                <span className="showcase-count">{featuredGames.length} GAMES OWNED</span>
              </div>

              <div className="steam-game-collector-grid">
                {featuredGames.slice(0, 10).map((game) => (
                  <a
                    key={game.id || game.steam_appid}
                    href={game.store_url || `https://store.steampowered.com/app/${game.steam_appid}/`}
                    target="_blank"
                    rel="noreferrer"
                    className="steam-collector-item"
                    title={`${game.title} - ${game.playtime_hours} hrs played`}
                  >
                    <img
                      src={game.cover_url || game.icon_url}
                      alt={game.title}
                      className="collector-cover"
                      onError={(e) => {
                        e.target.src =
                          game.icon_url ||
                          "https://cdn.akamai.steamstatic.com/steam/apps/440/header.jpg";
                      }}
                    />
                    <div className="collector-overlay">
                      <span className="collector-hours">{game.playtime_hours} hrs</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Steam Comment Wall */}
          <div className="steam-showcase-box">
            <div className="steam-showcase-header">
              <span className="showcase-title">PROFILE COMMENTS</span>
              <span className="showcase-count">{comments.length} COMMENTS</span>
            </div>

            {/* Leave a Comment Form */}
            <form className="steam-comment-form" onSubmit={handlePostComment}>
              <div className="comment-form-row">
                <input
                  type="text"
                  placeholder="Your Name (Optional)"
                  className="steam-input name"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  maxLength={40}
                />
              </div>
              <div className="comment-form-row">
                <textarea
                  placeholder="Write a comment on Abbos's profile wall..."
                  className="steam-textarea"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  maxLength={500}
                  required
                />
              </div>
              <div className="comment-form-actions">
                <button
                  type="submit"
                  className="steam-btn primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="steam-comments-list">
              {comments.length > 0 ? (
                comments.slice(0, 10).map((c, idx) => (
                  <div key={c.id || idx} className="steam-comment-item">
                    <img
                      src={`https://api.dicebear.com/7.x/identicon/svg?seed=${
                        c.sender || idx
                      }`}
                      alt={c.sender || "Visitor"}
                      className="comment-avatar"
                    />
                    <div className="comment-body">
                      <div className="comment-header">
                        <span className="comment-author">
                          {c.sender || "Steam Visitor"}
                        </span>
                        <span className="comment-date">
                          {c.created_at
                            ? new Date(c.created_at).toLocaleDateString()
                            : "Recently"}
                        </span>
                      </div>
                      <p className="comment-text">{c.message}</p>
                      {c.admin_reply && (
                        <div className="comment-reply">
                          <span className="reply-author">Claive (Owner):</span>
                          <span className="reply-text">{c.admin_reply}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-comments">
                  No comments yet. Leave a note on the profile wall!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar Column */}
        <aside className="steam-sidebar-col">
          <div className="steam-side-card">
            <div className="status-indicator-box online">
              <span className="status-bullet" />
              <div className="status-text">
                <strong>Currently Online</strong>
                <span>In-Game: VS Code</span>
              </div>
            </div>
          </div>

          <div className="steam-side-card">
            <div className="side-card-header">
              <span>BADGES</span>
              <span className="card-count">6</span>
            </div>
            <div className="badges-grid">
              <div className="badge-square" title="5 Years of Service">
                🏅
              </div>
              <div className="badge-square" title="Community Pillar">
                🎖️
              </div>
              <div className="badge-square" title="Game Collector">
                🥇
              </div>
              <div className="badge-square" title="Gemini AI Master">
                💎
              </div>
              <div className="badge-square" title="Docker Architect">
                ⚡
              </div>
              <div className="badge-square" title="Steam UI Specialist">
                🎨
              </div>
            </div>
          </div>

          <div className="steam-side-card">
            <div className="side-card-header">
              <span>STATS</span>
            </div>
            <ul className="steam-stats-list">
              <li>
                <span>Level</span>
                <strong className="stat-val">{customData.level}</strong>
              </li>
              <li>
                <span>Projects</span>
                <strong className="stat-val">12</strong>
              </li>
              <li>
                <span>Games in Library</span>
                <strong className="stat-val">{featuredGames.length}</strong>
              </li>
              <li>
                <span>Profile Comments</span>
                <strong className="stat-val">{comments.length}</strong>
              </li>
            </ul>
          </div>

          <div className="steam-side-card">
            <div className="side-card-header">
              <span>LINKS & CONTACT</span>
            </div>
            <div className="social-links-list">
              <a
                href="https://github.com/AbbosJabborov"
                target="_blank"
                rel="noreferrer"
                className="social-link-item"
              >
                <span>🌐 GitHub Profile</span>
                <span>↗</span>
              </a>
              <a
                href="https://t.me/AbbosJabborov"
                target="_blank"
                rel="noreferrer"
                className="social-link-item"
              >
                <span>✈️ Telegram</span>
                <span>↗</span>
              </a>
              <a
                href="https://open.spotify.com/user/313tv3lpxnwpjfrmclgff7swdzua"
                target="_blank"
                rel="noreferrer"
                className="social-link-item"
              >
                <span>🎧 Spotify Account</span>
                <span>↗</span>
              </a>
              <Link to="/notes" className="social-link-item">
                <span>📝 Leave Note Wall</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          <div className="steam-side-card">
            <div className="side-card-header">
              <span>FRIENDS</span>
              <span className="card-count">6 ONLINE</span>
            </div>
            <div className="friends-avatars-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="friend-avatar-item" title={`Friend #${i}`}>
                  <img
                    src={`https://api.dicebear.com/7.x/bottts/svg?seed=friend_${i}`}
                    alt="Friend"
                  />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Award Modal */}
      {showAwardModal && (
        <div className="steam-modal-overlay" onClick={() => setShowAwardModal(false)}>
          <div className="steam-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Give a Steam Profile Award</h2>
              <button
                className="close-modal-btn"
                onClick={() => setShowAwardModal(false)}
              >
                ×
              </button>
            </div>
            <p className="modal-sub">
              Select an award to give Abbos for his profile!
            </p>

            <div className="awards-grid-selection">
              <div
                className="award-select-item"
                onClick={() => {
                  setShowAwardModal(false);
                  triggerToast("Award Granted: Mind Blown 🤯 (+300 Steam Points)!");
                }}
              >
                <span className="award-emoji">🤯</span>
                <span className="award-name">Mind Blown</span>
                <span className="award-points">300 pts</span>
              </div>

              <div
                className="award-select-item"
                onClick={() => {
                  setShowAwardModal(false);
                  triggerToast("Award Granted: Take My Points 💎 (+600 Steam Points)!");
                }}
              >
                <span className="award-emoji">💎</span>
                <span className="award-name">Take My Points</span>
                <span className="award-points">600 pts</span>
              </div>

              <div
                className="award-select-item"
                onClick={() => {
                  setShowAwardModal(false);
                  triggerToast("Award Granted: Super Developer 🚀 (+1000 Steam Points)!");
                }}
              >
                <span className="award-emoji">🚀</span>
                <span className="award-name">Super Developer</span>
                <span className="award-points">1000 pts</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customize Steam Profile Modal */}
      {showEditModal && (
        <div className="steam-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="steam-modal-card custom-edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚙️ Customize Steam Profile</h2>
              <button
                className="close-modal-btn"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveCustomization} className="modal-form-scroll">
              <div className="modal-body-fields">
                <div className="form-group-row">
                  <div className="form-col">
                    <label>Persona Name</label>
                    <input
                      type="text"
                      className="steam-input"
                      value={editForm.personaName}
                      onChange={(e) =>
                        setEditForm({ ...editForm, personaName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-col">
                    <label>Real Name / Alias</label>
                    <input
                      type="text"
                      className="steam-input"
                      value={editForm.realName}
                      onChange={(e) =>
                        setEditForm({ ...editForm, realName: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-col">
                    <label>Location</label>
                    <input
                      type="text"
                      className="steam-input"
                      value={editForm.location}
                      onChange={(e) =>
                        setEditForm({ ...editForm, location: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-col">
                    <label>Steam Level</label>
                    <input
                      type="number"
                      min="1"
                      max="999"
                      className="steam-input"
                      value={editForm.level}
                      onChange={(e) =>
                        setEditForm({ ...editForm, level: parseInt(e.target.value) || 1 })
                      }
                    />
                  </div>
                </div>

                <div className="form-col">
                  <label>Bio Summary</label>
                  <textarea
                    className="steam-textarea"
                    rows={3}
                    value={editForm.bio}
                    onChange={(e) =>
                      setEditForm({ ...editForm, bio: e.target.value })
                    }
                  />
                </div>

                <div className="form-group-row">
                  <div className="form-col">
                    <label>Profile Background Theme</label>
                    <select
                      className="steam-select"
                      value={editForm.themeBg}
                      onChange={(e) =>
                        setEditForm({ ...editForm, themeBg: e.target.value })
                      }
                    >
                      <option value="default">Default Steam Dark (#1b2838)</option>
                      <option value="midnight">Midnight Slate</option>
                      <option value="cyberpunk">Cyberpunk Purple</option>
                      <option value="space">Cosmic Deep Space</option>
                      <option value="sunset">Amber Sunset</option>
                    </select>
                  </div>

                  <div className="form-col">
                    <label>Main Featured Showcase</label>
                    <select
                      className="steam-select"
                      value={editForm.showcaseType}
                      onChange={(e) =>
                        setEditForm({ ...editForm, showcaseType: e.target.value })
                      }
                    >
                      <option value="projects">Featured Projects Showcase</option>
                      <option value="games">Game Collector Showcase</option>
                      <option value="custom">Custom Text Showcase</option>
                    </select>
                  </div>
                </div>

                {editForm.showcaseType === "custom" && (
                  <div className="custom-showcase-fields">
                    <label>Custom Showcase Title</label>
                    <input
                      type="text"
                      className="steam-input"
                      value={editForm.customShowcaseTitle}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          customShowcaseTitle: e.target.value,
                        })
                      }
                    />
                    <label>Custom Showcase Text</label>
                    <textarea
                      className="steam-textarea"
                      rows={3}
                      value={editForm.customShowcaseBody}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          customShowcaseBody: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer-actions">
                <button
                  type="button"
                  className="steam-btn secondary"
                  onClick={() => setEditForm(DEFAULT_CUSTOMIZATION)}
                >
                  Reset Defaults
                </button>
                <button type="submit" className="steam-btn primary">
                  Save Customization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
