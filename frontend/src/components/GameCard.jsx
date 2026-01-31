import React from "react";
import { useNavigate } from "react-router-dom";

export default function GameCard({ game }) {
  const nav = useNavigate();
  const thumbnail = game.cover;

  function open() {
    nav(`/project/${game.slug}`);
  }

  return (
    <div className="game-card" onClick={open}>
      {thumbnail ? (
        <img src={thumbnail} alt={game.title} loading="lazy" />
      ) : (
        <div className="no-cover">
          <span>no image</span>
        </div>
      )}
      <div className="game-info">
        <div className="game-title">{game.title}</div>
        {game.is_opensource && (
          <span className="opensource-badge">open source</span>
        )}
      </div>
    </div>
  );
}
