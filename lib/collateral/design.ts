/**
 * How strongly the style's colour covers a photo. Two steps, so a design never ends up faintly tinted. There is
 * deliberately no untinted step: text straight on a photo needed an outline to read, which did not look good.
 */
export type PhotoTint = "strong" | "medium";

export const PHOTO_TINTS: { id: PhotoTint; label: string; visible: number }[] = [
  { id: "strong", label: "Strong", visible: 0.25 },
  { id: "medium", label: "Medium", visible: 0.5 },
];

export const DEFAULT_PHOTO_TINT: PhotoTint = "strong";

/** The PhotoSettings.visible value a tint step draws with. */
export function tintVisible(tint: PhotoTint): number {
  return (PHOTO_TINTS.find((t) => t.id === tint) ?? PHOTO_TINTS[0]).visible;
}

/** The nearest tint step to an older value (the free slider, or the retired None step), so older saves open sensibly. */
export function snapTint(visible: number): PhotoTint {
  let best = PHOTO_TINTS[0];
  for (const t of PHOTO_TINTS) if (Math.abs(t.visible - visible) < Math.abs(best.visible - visible)) best = t;
  return best.id;
}

export function isPhotoTint(v: unknown): v is PhotoTint {
  return PHOTO_TINTS.some((t) => t.id === v);
}

export type TextAlign = "left" | "center";

export function isTextAlign(v: unknown): v is TextAlign {
  return v === "left" || v === "center";
}

/** Preferred QR size. The scannable minimum and each layout's cap still apply. */
export type QrSize = "s" | "m" | "l";

export const QR_SIZES: { id: QrSize; label: string }[] = [
  { id: "s", label: "Small" },
  { id: "m", label: "Medium" },
  { id: "l", label: "Large" },
];

export function isQrSize(v: unknown): v is QrSize {
  return QR_SIZES.some((s) => s.id === v);
}

/** The title size nudge: a multiplier on the automatic size range. 1 is automatic. */
export const HEADLINE_SCALE_MIN = 0.7;
export const HEADLINE_SCALE_MAX = 1.3;
export const HEADLINE_SCALE_STEP = 0.1;

export function clampHeadlineScale(v: unknown): number {
  if (typeof v !== "number" || !Number.isFinite(v)) return 1;
  // Round to the step so repeated nudges land on tidy values.
  const stepped = Math.round(v / HEADLINE_SCALE_STEP) * HEADLINE_SCALE_STEP;
  return Math.min(HEADLINE_SCALE_MAX, Math.max(HEADLINE_SCALE_MIN, Number(stepped.toFixed(2))));
}

/** Partner logos sit to the right of the PauseAI logo. More than two crowds the header. */
export const MAX_PARTNER_LOGOS = 2;
