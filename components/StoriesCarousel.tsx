"use client";

import { useRef } from "react";
import type { Story } from "@/lib/data/stories";
import StoryCard from "./StoryCard";

export default function StoriesCarousel({ stories }: { stories: Story[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollByCard(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>(".story-card");
    const amount = card ? card.getBoundingClientRect().width + 24 : track.clientWidth;
    track.scrollBy({ left: amount * direction, behavior: "smooth" });
  }

  return (
    <div className="story-carousel">
      <div className="story-carousel-track" ref={trackRef}>
        {stories.map((story, i) => (
          <StoryCard key={`${story.name}-${i}`} story={story} index={i} truncate />
        ))}
      </div>
      <button
        type="button"
        className="story-carousel-btn story-carousel-btn-prev"
        aria-label="Previous story"
        onClick={() => scrollByCard(-1)}
      >
        ‹
      </button>
      <button
        type="button"
        className="story-carousel-btn story-carousel-btn-next"
        aria-label="Next story"
        onClick={() => scrollByCard(1)}
      >
        ›
      </button>
    </div>
  );
}
