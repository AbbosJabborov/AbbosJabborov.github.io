import React, { useRef, useEffect } from "react";
import GameCard from "./GameCard";

export default function Shelf({ items }) {
  const scroller = useRef(null);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    function handleDown(e) {
      isDown = true;
      startX = e.pageX || e.touches?.[0]?.pageX;
      scrollLeft = el.scrollLeft;
      el.style.cursor = "grabbing";
    }

    function handleUp() {
      if (!isDown) return;
      isDown = false;
      el.style.cursor = "grab";
    }

    function handleMove(e) {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX || e.touches?.[0]?.pageX;
      const walk = (startX - x) * 1.5;
      el.scrollLeft = scrollLeft + walk;
    }

    el.addEventListener("mousedown", handleDown);
    el.addEventListener("touchstart", handleDown, { passive: true });
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchend", handleUp);
    el.addEventListener("mousemove", handleMove);
    el.addEventListener("touchmove", handleMove, { passive: false });
    el.addEventListener("mouseleave", handleUp);

    return () => {
      el.removeEventListener("mousedown", handleDown);
      el.removeEventListener("touchstart", handleDown);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchend", handleUp);
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("touchmove", handleMove);
      el.removeEventListener("mouseleave", handleUp);
    };
  }, []);

  if (!items || items.length === 0) {
    return (
      <div className="shelf-empty">
        <p>no projects yet</p>
      </div>
    );
  }

  return (
    <div className="shelf-scroller" ref={scroller}>
      {items.map((project) => (
        <GameCard key={project.id} game={project} />
      ))}
    </div>
  );
}
