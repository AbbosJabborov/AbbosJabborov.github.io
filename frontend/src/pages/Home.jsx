import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import TypingAnimation from "../components/TypingAnimation";
import API_BASE_URL from "../config/api";

export default function Home() {
  const [toastMessage, setToastMessage] = useState(null);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [steamProfile, setSteamProfile] = useState({
    personaname: "Abbos Jabborov",
    avatar: "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg",
    profileurl: "https://steamcommunity.com/id/clevercap/",
  });
  const [featuredGames, setFeaturedGames] = useState([]);

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
        // Fallback local update
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

  return (
    <div className="steam-profile-page">
      {/* Toast Notification */}
      {toastMessage && <div className="steam-toast">{toastMessage}</div>}

      {/* Steam Profile Header Banner Container */}
      <div className="steam-profile-header-wrapper">
        <div
          className="steam-profile-bg"
          style={{ backgroundImage: `url('/steam_bg.png')` }}
        />
        <div className="steam-profile-header-content">
          {/* Avatar Container */}
          <div className="steam-avatar-box">
            <div className="steam-avatar-frame-glow">
              <img
                src={steamProfile.avatar || "/steam_avatar.png"}
                alt={steamProfile.personaname || "Abbos Jabborov"}
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
              <h1 className="steam-persona-name">{steamProfile.personaname || "Abbos Jabborov"}</h1>
              <span className="steam-handle">clevercap</span>
              <span className="steam-location-flag" title="Tashkent, Uzbekistan">
                🇺🇿 Uzbekistan
              </span>
            </div>


            {/* Steam Summary Bio Box */}
            <div className="steam-summary-box">
              <div className="steam-typing-wrapper">
                <TypingAnimation />
              </div>
              <div className="steam-bio-details">
                <p>
                  👋 <strong>Full-Stack Software Engineer & Web Developer.</strong>
                </p>
                <p>
                  Building high-performance web apps, interactive engines, and
                  clean UI/UX systems.
                </p>
                <div className="steam-tech-badges">
                  <span className="tech-tag">React 19</span>
                  <span className="tech-tag">JavaScript</span>
                  <span className="tech-tag">Python</span>
                  <span className="tech-tag">Django REST</span>
                  <span className="tech-tag">Docker</span>
                  <span className="tech-tag">Cloudflare Workers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Steam Level & Profile Actions */}
          <div className="steam-profile-right-actions">
            <div className="steam-level-container" title="Level 42 Leader">
              <span className="level-label">Level</span>
              <div className="level-badge-circle">42</div>
            </div>

            <div className="steam-badge-preview-box">
              <span className="badge-icon">🏆</span>
              <div className="badge-info">
                <span className="badge-title">Community Leader</span>
                <span className="badge-xp">4,200 XP</span>
              </div>
            </div>

            <div className="steam-action-buttons-group">
              <button
                className="steam-btn primary"
                onClick={() => setShowEditModal(true)}
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
        {/* Left Column (Showcases & Comments) */}
        <div className="steam-main-col">
          {/* Showcase 1: Featured Projects */}
          <div className="steam-showcase-box" id="showcase">
            <div className="steam-showcase-header">
              <span className="showcase-title">FEATURED PROJECTS SHOWCASE</span>
              <span className="showcase-count">3 ITEMS</span>
            </div>

            <div className="steam-projects-grid">
              {/* Project 1 */}
              <div className="steam-project-card">
                <div className="project-banner zakoweb">
                  <span className="project-badge">MULTIPLAYER GAME</span>
                  <div className="project-overlay-glow" />
                </div>
                <div className="project-details">
                  <h3 className="project-name">Zakoweb Online</h3>
                  <p className="project-desc">
                    Real-time multiplayer quiz game platform with live answer
                    masking, room lifecycle management, and WebSocket feeds.
                  </p>
                  <div className="project-stats-row">
                    <span>⏱ 140 hrs logged</span>
                    <span>🏆 100% Achievements</span>
                  </div>
                  <div className="project-action">
                    <Link to="/projects" className="steam-play-btn-green">
                      <span>▶</span> LAUNCH PROJECT
                    </Link>
                  </div>
                </div>
              </div>

              {/* Project 2 */}
              <div className="steam-project-card">
                <div className="project-banner plate">
                  <span className="project-badge">AI ASSISTANT</span>
                  <div className="project-overlay-glow" />
                </div>
                <div className="project-details">
                  <h3 className="project-name">Plate. AI Culinary</h3>
                  <p className="project-desc">
                    AI-powered cooking & grocery assistant with ingredient
                    substitution tailored for local stores in Uzbekistan.
                  </p>
                  <div className="project-stats-row">
                    <span>⏱ 95 hrs logged</span>
                    <span>🏆 90% Achievements</span>
                  </div>
                  <div className="project-action">
                    <Link to="/projects" className="steam-play-btn-green">
                      <span>▶</span> LAUNCH PROJECT
                    </Link>
                  </div>
                </div>
              </div>

              {/* Project 3 */}
              <div className="steam-project-card">
                <div className="project-banner portfolio">
                  <span className="project-badge">WEB PLATFORM</span>
                  <div className="project-overlay-glow" />
                </div>
                <div className="project-details">
                  <h3 className="project-name">Claive.uz Portfolio</h3>
                  <p className="project-desc">
                    Custom Steam UI replica built with React 19, Django REST, and
                    Dockerized backend services.
                  </p>
                  <div className="project-stats-row">
                    <span>⏱ 210 hrs logged</span>
                    <span>🏆 100% Achievements</span>
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

          {/* Showcase 2: Game Collector Showcase */}
          {featuredGames.length > 0 && (
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
                        e.target.src = game.icon_url || "https://cdn.akamai.steamstatic.com/steam/apps/440/header.jpg";
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

          {/* Showcase 3: Rarest Achievements */}

          <div className="steam-showcase-box">
            <div className="steam-showcase-header">
              <span className="showcase-title">RAREST ACHIEVEMENTS UNLOCKED</span>
              <span className="showcase-count">6 OF 15</span>
            </div>

            <div className="steam-achievements-grid">
              <div className="achievement-item" title="Written 100,000+ lines of code">
                <div className="achievement-icon gold">🧙‍♂️</div>
                <div className="achievement-info">
                  <span className="achieve-title">Code Wizard</span>
                  <span className="achieve-desc">Written 100k+ lines of clean code</span>
                  <span className="achieve-unlocked">Unlocked Aug 12</span>
                </div>
              </div>

              <div className="achievement-item" title="Deployed production servers">
                <div className="achievement-icon diamond">🚀</div>
                <div className="achievement-info">
                  <span className="achieve-title">Deploy Master</span>
                  <span className="achieve-desc">VPS & Cloudflare deployment</span>
                  <span className="achieve-unlocked">Unlocked Aug 2</span>
                </div>
              </div>

              <div className="achievement-item" title="Steam UI Pixel Perfect">
                <div className="achievement-icon cyan">🎨</div>
                <div className="achievement-info">
                  <span className="achieve-title">Steam Artisan</span>
                  <span className="achieve-desc">Pixel-perfect Steam UI replication</span>
                  <span className="achieve-unlocked">Unlocked Today</span>
                </div>
              </div>

              <div className="achievement-item" title="Solved 500+ bugs">
                <div className="achievement-icon green">⚡</div>
                <div className="achievement-info">
                  <span className="achieve-title">Bug Terminator</span>
                  <span className="achieve-desc">Resolved 500+ complex issues</span>
                  <span className="achieve-unlocked">Unlocked Jul 31</span>
                </div>
              </div>

              <div className="achievement-item" title="Listened to 1,000+ hrs of synthwave">
                <div className="achievement-icon purple">🎧</div>
                <div className="achievement-info">
                  <span className="achieve-title">Synthwave Coder</span>
                  <span className="achieve-desc">1,000+ Spotify coding hours</span>
                  <span className="achieve-unlocked">Unlocked Jul 29</span>
                </div>
              </div>

              <div className="achievement-item" title="Built real-time engines">
                <div className="achievement-icon red">🌐</div>
                <div className="achievement-info">
                  <span className="achieve-title">Network Architect</span>
                  <span className="achieve-desc">Built real-time WebSocket feeds</span>
                  <span className="achieve-unlocked">Unlocked Apr 27</span>
                </div>
              </div>
            </div>
          </div>

          {/* Showcase 3: Recent Activity Feed */}
          <div className="steam-showcase-box">
            <div className="steam-showcase-header">
              <span className="showcase-title">RECENT ACTIVITY</span>
              <span className="showcase-count">34.5 hrs past 2 weeks</span>
            </div>

            <div className="steam-activity-list">
              <div className="activity-item">
                <span className="activity-icon">🎮</span>
                <div className="activity-details">
                  <span className="activity-title">
                    In-Game: VS Code & React Architecture
                  </span>
                  <span className="activity-meta">34.5 hrs on record • Last played today</span>
                </div>
              </div>

              <div className="activity-item">
                <span className="activity-icon">📝</span>
                <div className="activity-details">
                  <span className="activity-title">
                    Posted a new note on the Community Wall
                  </span>
                  <span className="activity-meta">
                    "Rebuilding website with authentic Steam UI/UX"
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Showcase 4: Steam Comment Wall */}
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
                  placeholder="Your Steam Name (Optional)"
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
                  No comments yet. Be the first to leave a message on the profile wall!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar Column */}
        <aside className="steam-sidebar-col">
          {/* Status Box */}
          <div className="steam-side-card">
            <div className="status-indicator-box online">
              <span className="status-bullet" />
              <div className="status-text">
                <strong>Currently Online</strong>
                <span>In-Game: VS Code</span>
              </div>
            </div>
          </div>

          {/* Steam Badges Box */}
          <div className="steam-side-card">
            <div className="side-card-header">
              <span>BADGES</span>
              <span className="card-count">8</span>
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
              <div className="badge-square" title="WebSocket Architect">
                ⚡
              </div>
              <div className="badge-square" title="Steam UI Specialist">
                🎨
              </div>
            </div>
          </div>

          {/* Profile Stats Summary */}
          <div className="steam-side-card">
            <div className="side-card-header">
              <span>STATS</span>
            </div>
            <ul className="steam-stats-list">
              <li>
                <span>Level</span>
                <strong className="stat-val">42</strong>
              </li>
              <li>
                <span>Featured Projects</span>
                <strong className="stat-val">12</strong>
              </li>
              <li>
                <span>Games in Library</span>
                <strong className="stat-val">18</strong>
              </li>
              <li>
                <span>Profile Comments</span>
                <strong className="stat-val">{comments.length}</strong>
              </li>
              <li>
                <span>Code Commits</span>
                <strong className="stat-val">1,420+</strong>
              </li>
            </ul>
          </div>

          {/* Social Links Box */}
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

          {/* Steam Friends Showcase */}
          <div className="steam-side-card">
            <div className="side-card-header">
              <span>FRIENDS</span>
              <span className="card-count">12 ONLINE</span>
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
              Select an award to give Abbos for his Steam UI profile!
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

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="steam-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="steam-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Steam Profile</h2>
              <button
                className="close-modal-btn"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            <p className="modal-sub">Customizing persona and background artwork.</p>
            <div className="modal-body-fields">
              <label>Persona Name</label>
              <input
                type="text"
                className="steam-input"
                defaultValue="Abbos Jabborov"
              />

              <label>Custom Title</label>
              <input
                type="text"
                className="steam-input"
                defaultValue="Full-Stack Developer"
              />

              <label>Location</label>
              <input
                type="text"
                className="steam-input"
                defaultValue="Tashkent, Uzbekistan"
              />
            </div>
            <div className="modal-footer-actions">
              <button
                className="steam-btn primary"
                onClick={() => {
                  setShowEditModal(false);
                  triggerToast("Profile settings saved successfully!");
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

