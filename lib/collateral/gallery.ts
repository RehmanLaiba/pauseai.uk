import type { Drawable, PhotoSettings } from "./templates";

export const MIN_SLIDES = 2;
export const MAX_SLIDES = 10;
export const CAPTION_MAX = 200;

/** Gallery slides are photo-forward: no theme tint over the image, unlike the single-image templates. */
export const DEFAULT_SLIDE_PHOTO_SETTINGS: PhotoSettings = { zoom: 1, focalX: 0.5, focalY: 0.5, visible: 1 };

export interface SlidePhoto {
  drawable: Drawable;
  name: string;
  source: { kind: "library"; id: string } | { kind: "upload" };
}

export interface Slide {
  id: string;
  photo: SlidePhoto | null;
  photoSettings: PhotoSettings;
  caption: string;
}

let idCounter = 0;

export function newSlideId(): string {
  idCounter += 1;
  return `slide-${Date.now()}-${idCounter}`;
}

export function newSlide(): Slide {
  return { id: newSlideId(), photo: null, photoSettings: { ...DEFAULT_SLIDE_PHOTO_SETTINGS }, caption: "" };
}
