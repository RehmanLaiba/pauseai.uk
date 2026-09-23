"use client";

import { useRef, useState } from "react";
import CollateralStudio from "./CollateralStudio";
import GalleryStudio from "./GalleryStudio";

type Mode = "single" | "gallery";

export default function CollateralApp() {
  const [mode, setMode] = useState<Mode>("single");
  const switchRef = useRef<HTMLDivElement>(null);

  // Used by links inside a studio, which sit far below the switch, so bring the new mode into view.
  function openGallery() {
    setMode("gallery");
    switchRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div>
      <div ref={switchRef} className="collateral-mode-switch" role="radiogroup" aria-label="Post type">
        <button type="button" role="radio" aria-checked={mode === "single"} onClick={() => setMode("single")}>
          Single image
        </button>
        <button type="button" role="radio" aria-checked={mode === "gallery"} onClick={() => setMode("gallery")}>
          Gallery / carousel
        </button>
      </div>
      {mode === "single" ? <CollateralStudio onOpenGallery={openGallery} /> : <GalleryStudio />}
    </div>
  );
}
