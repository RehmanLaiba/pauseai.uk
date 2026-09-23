"use client";

import { useState } from "react";
import CollateralStudio from "./CollateralStudio";
import GalleryStudio from "./GalleryStudio";

type Mode = "single" | "gallery";

export default function CollateralApp() {
  const [mode, setMode] = useState<Mode>("single");

  return (
    <div>
      <div className="collateral-mode-switch" role="radiogroup" aria-label="Post type">
        <button type="button" role="radio" aria-checked={mode === "single"} onClick={() => setMode("single")}>
          Single image
        </button>
        <button type="button" role="radio" aria-checked={mode === "gallery"} onClick={() => setMode("gallery")}>
          Gallery / carousel
        </button>
      </div>
      {mode === "single" ? <CollateralStudio /> : <GalleryStudio />}
    </div>
  );
}
