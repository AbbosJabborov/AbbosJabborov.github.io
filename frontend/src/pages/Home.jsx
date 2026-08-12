import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../config/api";

const DEFAULT_CUSTOMIZATION = {
  bgImageUrl: "", // Custom outer background image URL (e.g. Karl Marx artwork background)
  personaName: "♥claive♥",
  alias: "ももね",
  location: "Uzbekistan",
  bio: "♥♥\nFull-Stack Software Engineer & Web Developer.\nBuilding interactive apps, engines, and clean systems.",
  level: 23,
  xp: 317,
  badgeTitle: "Collection Agent",
  badgeCount: 20,
  awardsCount: 1,

  // Editable Tech Tags
  techTags: ["React 19", "Python / Django", "Docker", "Cloudflare"],

  // Favorite Game Showcase
  favoriteGame: {
    title: "Counter-Strike 2",
    bannerUrl: "https://cdn.akamai.steamstatic.com/steam/apps/730/header.jpg",
    hoursPlayed: 986,
    achievementsUnlocked: 1,
    achievementTotal: 1,
    achievementTitle: "Global Sentinel",
    achievementXp: "500 XP",
  },

  // Game Collector Showcase
  collectorStats: {
    gamesOwned: 95,
    dlcOwned: 42,
    reviews: 9,
    wishlisted: 355,
  },

  // 4 Featured Games in Game Collector Showcase (Editable!)
  collectorGames: [
    {
      title: "Cyberpunk 2077",
      coverUrl: "https://cdn.akamai.steamstatic.com/steam/apps/1091500/header.jpg",
      storeUrl: "https://store.steampowered.com/app/1091500/",
    },
    {
      title: "Blasphemous",
      coverUrl: "https://cdn.akamai.steamstatic.com/steam/apps/774361/header.jpg",
      storeUrl: "https://store.steampowered.com/app/774361/",
    },
    {
      title: "Celeste",
      coverUrl: "https://cdn.akamai.steamstatic.com/steam/apps/504230/header.jpg",
      storeUrl: "https://store.steampowered.com/app/504230/",
    },
    {
      title: "Rain World",
      coverUrl: "https://cdn.akamai.steamstatic.com/steam/apps/412830/header.jpg",
      storeUrl: "https://store.steampowered.com/app/412830/",
    },
  ],
};

export default function Home() {
  const [toastMessage, setToastMessage] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState("");

  // Steam API Profile data & games
  const [steamProfile, setSteamProfile] = useState({
    personaname: "♥claive♥",
    avatar: "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg",
    profileurl: "https://steamcommunity.com/id/clevercap/",
  });

  // Profile Customization state stored in localStorage
  const [customData, setCustomData] = useState(() => {
    try {
      const saved = localStorage.getItem("steamProfileCustomizationV2");
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
        const [profRes, notesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/steam/profile/`),
          fetch(`${API_BASE_URL}/api/notes/`),
        ]);

        if (profRes.ok) {
          const pData = await profRes.json();
          if (pData.personaname && pData.avatar) {
            setSteamProfile(pData);
          }
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
      localStorage.setItem("steamProfileCustomizationV2", JSON.stringify(editForm));
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

  const updateCollectorGame = (index, field, value) => {
    const updatedGames = [...editForm.collectorGames];
    updatedGames[index] = { ...updatedGames[index], [field]: value };
    setEditForm({ ...editForm, collectorGames: updatedGames });
  };

  const pageBgStyle = customData.bgImageUrl
    ? { backgroundImage: `url('${customData.bgImageUrl}')` }
    : {};

  return (
    <div className="steam-profile-outer-wrapper" style={pageBgStyle}>
      <div className="steam-profile-page">
        {/* Toast Notification */}
        {toastMessage && <div className="steam-toast">{toastMessage}</div>}

        {/* Steam Profile Header Banner Container */}
        <div className="steam-profile-header-wrapper">
          <div className="steam-profile-header-content">
            {/* Avatar Container */}
            <div className="steam-avatar-box">
              <div className="steam-avatar-frame-square">
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
            </div>

            {/* User Headline & Bio */}
            <div className="steam-user-headline">
              <div className="steam-user-title-row">
                <h1 className="steam-persona-name">
                  {customData.personaName || steamProfile.personaname}
                </h1>
              </div>

              <div className="steam-user-subrow">
                {customData.alias && <span className="steam-alias">{customData.alias}</span>}
                {customData.location && (
                  <span className="steam-location">
                    🇺🇿 {customData.location}
                  </span>
                )}
              </div>

              {/* Steam Summary Bio Box */}
              <div className="steam-summary-box">
                <div className="steam-bio-details">
                  {customData.bio.split("\n").map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                  {customData.techTags && customData.techTags.length > 0 && (
                    <div className="steam-tech-badges">
                      {customData.techTags.map((tag, idx) => (
                        <span key={idx} className="tech-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Steam Level & Edit Action */}
            <div className="steam-profile-right-actions">
              <div className="steam-level-container">
                <span className="level-label">Level</span>
                <div className="level-badge-circle">{customData.level}</div>
              </div>

              <div className="steam-badge-preview-box">
                <div className="badge-icon-square">50+</div>
                <div className="badge-info">
                  <span className="badge-title">{customData.badgeTitle || "Collection Agent"}</span>
                  <span className="badge-xp">{customData.xp} XP</span>
                </div>
              </div>

              <div className="steam-action-buttons-group">
                <button
                  className="steam-btn edit"
                  onClick={() => {
                    setEditForm(customData);
                    setTagInput((customData.techTags || []).join(", "));
                    setShowEditModal(true);
                  }}
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Profile Body Grid (2 Columns) */}
        <div className="steam-profile-body-container">
          {/* Left Column (Showcases & Comments) */}
          <div className="steam-main-col">
            {/* 1. Favorite Game Showcase */}
            <div className="steam-showcase-box">
              <div className="steam-showcase-header">
                <span className="showcase-title">Favorite Game</span>
              </div>

              <div className="steam-favorite-game-card">
                <img
                  src={customData.favoriteGame.bannerUrl}
                  alt={customData.favoriteGame.title}
                  className="fav-game-banner"
                  onError={(e) => {
                    e.target.src =
                      "https://cdn.akamai.steamstatic.com/steam/apps/730/header.jpg";
                  }}
                />
                <div className="fav-game-details">
                  <h2 className="fav-game-title">{customData.favoriteGame.title}</h2>
                  <div className="fav-game-stats">
                    <div className="fav-stat-item">
                      <span className="stat-num">{customData.favoriteGame.hoursPlayed}</span>
                      <span className="stat-lbl">Hours played</span>
                    </div>
                    <div className="fav-stat-item">
                      <span className="stat-num">{customData.favoriteGame.achievementsUnlocked}</span>
                      <span className="stat-lbl">Achievements</span>
                    </div>
                  </div>

                  <div className="fav-achievement-box">
                    <div className="achieve-badge-icon">CS</div>
                    <div className="achieve-badge-info">
                      <span className="achieve-badge-title">
                        {customData.favoriteGame.achievementTitle}
                      </span>
                      <span className="achieve-badge-xp">
                        {customData.favoriteGame.achievementXp}
                      </span>
                    </div>
                    <div className="achieve-progress-bar">
                      <span className="progress-label">
                        Achievement Progress ({customData.favoriteGame.achievementsUnlocked} of{" "}
                        {customData.favoriteGame.achievementTotal})
                      </span>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: "100%" }} />
                      </div>
                    </div>
                  </div>

                  <div className="fav-sublinks">
                    <span className="fav-link">Video 1</span>
                    <span className="fav-link">Review 1</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Game Collector Showcase */}
            <div className="steam-showcase-box">
              <div className="steam-showcase-header">
                <span className="showcase-title">Game Collector</span>
              </div>

              <div className="steam-collector-body">
                <div className="collector-stats-row">
                  <div className="collector-stat">
                    <span className="stat-val">{customData.collectorStats.gamesOwned}</span>
                    <span className="stat-name">Games Owned</span>
                  </div>
                  <div className="collector-stat">
                    <span className="stat-val">{customData.collectorStats.dlcOwned}</span>
                    <span className="stat-name">DLC Owned</span>
                  </div>
                  <div className="collector-stat">
                    <span className="stat-val">{customData.collectorStats.reviews}</span>
                    <span className="stat-name">Reviews</span>
                  </div>
                  <div className="collector-stat">
                    <span className="stat-val">{customData.collectorStats.wishlisted}</span>
                    <span className="stat-name">Wishlisted</span>
                  </div>
                </div>

                <div className="collector-featured-title">Featured Games</div>
                <div className="steam-collector-games-row">
                  {customData.collectorGames.map((game, idx) => (
                    <a
                      key={idx}
                      href={game.storeUrl || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="collector-game-item"
                      title={game.title}
                    >
                      <img
                        src={game.coverUrl}
                        alt={game.title}
                        className="collector-game-img"
                        onError={(e) => {
                          e.target.src =
                            "https://cdn.akamai.steamstatic.com/steam/apps/1091500/header.jpg";
                        }}
                      />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Recent Activity */}
            <div className="steam-showcase-box">
              <div className="steam-showcase-header">
                <span className="showcase-title">Recent Activity</span>
                <span className="showcase-count">12.3 hours past 2 weeks</span>
              </div>

              <div className="steam-activity-list">
                <div className="activity-row">
                  <img
                    src="https://cdn.akamai.steamstatic.com/steam/apps/730/header.jpg"
                    alt="Counter-Strike 2"
                    className="activity-banner-small"
                  />
                  <div className="activity-info">
                    <span className="activity-game-title">Counter-Strike 2</span>
                    <span className="activity-hours">
                      986 hrs on record • last played on 9 Aug
                    </span>
                  </div>
                </div>

                <div className="activity-row">
                  <img
                    src="https://cdn.akamai.steamstatic.com/steam/apps/10/header.jpg"
                    alt="Counter-Strike"
                    className="activity-banner-small"
                  />
                  <div className="activity-info">
                    <span className="activity-game-title">Counter-Strike</span>
                    <span className="activity-hours">
                      54 hrs on record • last played on 30 Jul
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Steam Comment Wall */}
            <div className="steam-showcase-box">
              <div className="steam-showcase-header">
                <span className="showcase-title">Comments</span>
                <div className="comments-header-right">
                  <label className="subscribe-lbl">
                    <input type="checkbox" defaultChecked /> Subscribe to thread
                  </label>
                  <span className="comment-pager">1 2 &gt;</span>
                </div>
              </div>

              {/* Leave a Comment Form */}
              <form className="steam-comment-form" onSubmit={handlePostComment}>
                <div className="comment-form-row">
                  <input
                    type="text"
                    placeholder="Add a comment"
                    className="steam-input"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="steam-btn primary"
                    disabled={isSubmitting}
                  >
                    Post
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
                            <span className="reply-author">Claive:</span>
                            <span className="reply-text">{c.admin_reply}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-comments">No comments yet.</div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar Column */}
          <aside className="steam-sidebar-col">
            <div className="steam-side-card">
              <div className="status-text-block">
                <strong className="status-offline-title">Currently Offline</strong>
                <span className="status-sub">Last Online 3 days ago</span>
              </div>
            </div>

            <div className="steam-side-card">
              <div className="side-card-header">
                <span>Profile Awards</span>
                <span className="card-count">{customData.awardsCount || 1}</span>
              </div>
            </div>

            <div className="steam-side-card">
              <div className="side-card-header">
                <span>Badges</span>
                <span className="card-count">{customData.badgeCount || 20}</span>
              </div>
              <div className="badges-square-row">
                <div className="badge-block">50+</div>
                <div className="badge-block alt1">6</div>
                <div className="badge-block alt2">CS</div>
                <div className="badge-block alt3">10</div>
              </div>
            </div>

            <div className="steam-side-card">
              <ul className="steam-stats-links-list">
                <li>
                  <Link to="/games">
                    <span>Games</span>
                    <strong className="stat-val">{customData.collectorStats.gamesOwned}</strong>
                  </Link>
                </li>
                <li>
                  <span>Inventory</span>
                </li>
                <li>
                  <span>Screenshots</span>
                  <strong className="stat-val">1</strong>
                </li>
                <li>
                  <span>Videos</span>
                  <strong className="stat-val">2</strong>
                </li>
                <li>
                  <span>Workshop Items</span>
                </li>
                <li>
                  <span>Reviews</span>
                  <strong className="stat-val">{customData.collectorStats.reviews}</strong>
                </li>
                <li>
                  <span>Guides</span>
                </li>
                <li>
                  <Link to="/projects">
                    <span>Artwork</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div className="steam-side-card">
              <div className="side-card-header">
                <span>Groups</span>
                <span className="card-count">11</span>
              </div>
              <div className="groups-list">
                <div className="group-item">
                  <div className="group-avatar">CS</div>
                  <div className="group-info">
                    <span className="group-name">CS:GO Uzbekistan</span>
                    <span className="group-members">1,114 Members</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="steam-side-card">
              <div className="side-card-header">
                <span>Friends</span>
                <span className="card-count">144</span>
              </div>
              <div className="friends-list-column">
                {[
                  { name: "M0nster", last: "330 days ago", lvl: 91 },
                  { name: "VSL3", last: "4 days ago", lvl: 88 },
                  { name: "Isil", last: "25 hrs ago", lvl: 62 },
                  { name: "tripl3_dr", last: "6 days ago", lvl: 54 },
                  { name: "hayys", last: "48 days ago", lvl: 48 },
                  { name: "Special Force", last: "14 hrs ago", lvl: 41 },
                ].map((friend, idx) => (
                  <div key={idx} className="friend-row-item">
                    <img
                      src={`https://api.dicebear.com/7.x/bottts/svg?seed=friend_${idx}`}
                      alt={friend.name}
                      className="friend-avatar-img"
                    />
                    <div className="friend-info">
                      <span className="friend-name">{friend.name}</span>
                      <span className="friend-last">{friend.last}</span>
                    </div>
                    <div className="friend-lvl-badge">{friend.lvl}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Customize Steam Profile Modal */}
        {showEditModal && (
          <div className="steam-modal-overlay" onClick={() => setShowEditModal(false)}>
            <div
              className="steam-modal-card custom-edit-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Edit Steam Profile</h2>
                <button
                  className="close-modal-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSaveCustomization} className="modal-form-scroll">
                <div className="modal-body-fields">
                  <div className="form-col">
                    <label>Outer Background Image URL (Karl Marx / Wallpaper)</label>
                    <input
                      type="text"
                      className="steam-input"
                      placeholder="https://example.com/background.jpg"
                      value={editForm.bgImageUrl || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, bgImageUrl: e.target.value })
                      }
                    />
                  </div>

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
                      <label>Subtext / Alias (e.g. ももね)</label>
                      <input
                        type="text"
                        className="steam-input"
                        value={editForm.alias}
                        onChange={(e) =>
                          setEditForm({ ...editForm, alias: e.target.value })
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
                          setEditForm({
                            ...editForm,
                            level: parseInt(e.target.value) || 1,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-col">
                    <label>Bio Lines (multi-line supported)</label>
                    <textarea
                      className="steam-textarea"
                      rows={3}
                      value={editForm.bio}
                      onChange={(e) =>
                        setEditForm({ ...editForm, bio: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-col">
                    <label>Tech / Bio Tags (comma-separated)</label>
                    <input
                      type="text"
                      className="steam-input"
                      value={tagInput}
                      onChange={(e) => {
                        setTagInput(e.target.value);
                        const tags = e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean);
                        setEditForm({ ...editForm, techTags: tags });
                      }}
                    />
                  </div>

                  <h3 className="section-modal-title">Game Collector Showcase</h3>
                  <div className="form-group-row">
                    <div className="form-col">
                      <label>Games Owned</label>
                      <input
                        type="number"
                        className="steam-input"
                        value={editForm.collectorStats.gamesOwned}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            collectorStats: {
                              ...editForm.collectorStats,
                              gamesOwned: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="form-col">
                      <label>DLC Owned</label>
                      <input
                        type="number"
                        className="steam-input"
                        value={editForm.collectorStats.dlcOwned}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            collectorStats: {
                              ...editForm.collectorStats,
                              dlcOwned: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="collector-games-edit-list">
                    <label>Featured Showcase Games (4 Banners)</label>
                    {editForm.collectorGames.map((game, idx) => (
                      <div key={idx} className="collector-game-edit-box">
                        <span className="game-idx">Game #{idx + 1}</span>
                        <input
                          type="text"
                          placeholder="Title (e.g. Cyberpunk 2077)"
                          className="steam-input"
                          value={game.title}
                          onChange={(e) =>
                            updateCollectorGame(idx, "title", e.target.value)
                          }
                        />
                        <input
                          type="text"
                          placeholder="Cover Image URL"
                          className="steam-input"
                          value={game.coverUrl}
                          onChange={(e) =>
                            updateCollectorGame(idx, "coverUrl", e.target.value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="modal-footer-actions">
                  <button
                    type="button"
                    className="steam-btn secondary"
                    onClick={() => {
                      setEditForm(DEFAULT_CUSTOMIZATION);
                      setTagInput(DEFAULT_CUSTOMIZATION.techTags.join(", "));
                    }}
                  >
                    Reset Defaults
                  </button>
                  <button type="submit" className="steam-btn primary">
                    Save Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
