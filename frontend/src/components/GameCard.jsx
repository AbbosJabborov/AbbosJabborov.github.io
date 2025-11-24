import React from "react";

export default function GameCard({ game, onSelect }) {
  const fallbackThumbnail =
    "https://compote.slate.com/images/22ce4663-4205-4345-8489-bc914da1f272.jpeg?crop=1560%2C1040%2Cx0%2Cy0";

  const thumbnail = game.thumbnail || fallbackThumbnail;

  return (
    <div className="game-card" onClick={() => onSelect(game)}>
      <img src={thumbnail} alt={game.title} />
      <div className="game-title">{game.title}</div>
    </div>
  );
}
