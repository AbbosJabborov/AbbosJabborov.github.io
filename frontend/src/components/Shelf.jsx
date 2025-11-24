import React, { useRef, useEffect } from "react";
import GameCard from "./GameCard";

export default function Shelf({ title, items, onSelect }) {
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
    }

    function handleUp() {
      if (!isDown) return;
      isDown = false;
      snapToNearestCard();
    }

    function handleMove(e) {
      if (!isDown) return;
      const x = e.pageX || e.touches?.[0]?.pageX;
      const walk = startX - x;
      el.scrollLeft = scrollLeft + walk;
    }

    function snapToNearestCard() {
      const card = el.children[0];
      if (!card) return;
      const cardWidth = card.offsetWidth + 20;
      const index = Math.round(el.scrollLeft / cardWidth);
      const target = index * cardWidth;

      el.scrollTo({
        left: target,
        behavior: "smooth",
      });
    }

    el.addEventListener("mousedown", handleDown);
    el.addEventListener("touchstart", handleDown, { passive: true });

    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchend", handleUp);

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("touchmove", handleMove, { passive: true });

    el.addEventListener("wheel", (e) => {
      el.scrollLeft += e.deltaY + e.deltaX;
    });

    return () => {
      el.removeEventListener("mousedown", handleDown);
      el.removeEventListener("touchstart", handleDown);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchend", handleUp);
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("touchmove", handleMove);
    };
  }, []);

  return (
    <section className="shelf-section">
      <div className="shelf-title">{title}</div>
      <div className="shelf-scroller" ref={scroller}>
        {items.map((project) => (
          <GameCard key={project.id} game={project} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}
