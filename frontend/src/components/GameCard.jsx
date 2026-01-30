import React from "react";
import { useNavigate } from "react-router-dom";

export default function GameCard({ game }) {
  const nav = useNavigate();
  const thumbnail = game.cover;

  function open() {
    nav(`/project/${game.id}`);
  }

  return (
    <div className="game-card" onClick={open}>
      {thumbnail ? (
        <img src={thumbnail} alt={game.title} />
      ) : (
        <div className="no-cover">No Image</div>
      )}
      <div className="game-title">{game.title}</div>
    </div>
  );
}
