export type PlatformId = "instagram" | "linkedin" | "x";

export interface CarouselVariant {
  platform: PlatformId;
  label: string;
  /** Shown on the platform's picker card. */
  note: string;
  /** References an existing Format id in formats.ts. */
  formatId: string;
  maxSlides: number;
  export: "images" | "pdf" | "both";
}

export const CAROUSEL_PLATFORMS: CarouselVariant[] = [
  { platform: "instagram", label: "Instagram / Facebook", note: "Up to 10 slides · image files", formatId: "ig-portrait", maxSlides: 10, export: "images" },
  { platform: "linkedin", label: "LinkedIn", note: "Up to 10 slides · images + one PDF", formatId: "ig-portrait", maxSlides: 10, export: "both" },
  { platform: "x", label: "X", note: "First 4 slides · image files", formatId: "ig-square", maxSlides: 4, export: "images" },
];

export function getCarouselVariant(platform: PlatformId): CarouselVariant {
  return CAROUSEL_PLATFORMS.find((v) => v.platform === platform) ?? CAROUSEL_PLATFORMS[0];
}

export const ALL_PLATFORM_IDS: PlatformId[] = CAROUSEL_PLATFORMS.map((v) => v.platform);
