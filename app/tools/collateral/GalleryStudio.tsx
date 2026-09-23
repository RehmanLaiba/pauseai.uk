"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import {
  canvasToPngBlob,
  downloadCanvasesPdf,
  downloadCanvasesPdfDigital,
  downloadCanvasesPngZip,
  downloadPlatformBundleZip,
  downloadText,
  exportFilename,
  pdfBytesDigital,
  pdfBytesForPrint,
  type PlatformExportGroup,
} from "@/lib/collateral/export";
import { BLEED_MM, DEFAULT_FORMAT_ID, FORMAT_GROUPS, FORMATS, formatDimensionLabel, getFormat, type Format } from "@/lib/collateral/formats";
import { CAPTION_MAX, DEFAULT_SLIDE_PHOTO_SETTINGS, MAX_SLIDES, MIN_SLIDES, newSlide, newSlideId, type Slide, type SlidePhoto } from "@/lib/collateral/gallery";
import {
  parseGalleryProject,
  serializeGalleryProject,
  type GalleryProject,
  type GallerySlideData,
} from "@/lib/collateral/galleryProject";
import { LIBRARY_PHOTOS, type LibraryPhoto } from "@/lib/collateral/photos";
import { MAX_ZOOM, panPhoto, zoomPhoto } from "@/lib/collateral/photoTransform";
import { ALL_PLATFORM_IDS, CAROUSEL_PLATFORMS, type PlatformId } from "@/lib/collateral/platforms";
import type { ProjectPhoto } from "@/lib/collateral/project";
import { drawableToJpegDataUrl, fileToDrawable, loadDataUrl, loadFonts, loadImage, renderCollateral } from "@/lib/collateral/render";
import { getTemplate, type Drawable } from "@/lib/collateral/templates";
import { DEFAULT_THEME_ID, getTheme, THEMES } from "@/lib/collateral/themes";
import Slider from "./Slider";

const CAPTION_TEMPLATE = getTemplate("caption");
const STORAGE_KEY = "pauseai-collateral-gallery-v1";
const PREVIEW_MAX_SIDE = 1400;
const MAX_PROJECT_FILE_BYTES = 12_000_000 * MAX_SLIDES;

export default function GalleryStudio() {
  const [formatId, setFormatId] = useState(DEFAULT_FORMAT_ID);
  const [themeId, setThemeId] = useState<string>(DEFAULT_THEME_ID);
  const [platforms, setPlatforms] = useState<Set<PlatformId>>(() => new Set(ALL_PLATFORM_IDS));
  const [customFormat, setCustomFormat] = useState(false);
  const [slides, setSlides] = useState<Slide[]>(() => [newSlide(), newSlide()]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [logo, setLogo] = useState<Drawable | null>(null);
  const [fontsReady, setFontsReady] = useState(false);
  const [restored, setRestored] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const openInputRef = useRef<HTMLInputElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; zoom: number } | null>(null);

  const format = getFormat(formatId);
  const theme = getTheme(themeId);
  const firstSelectedVariant = CAROUSEL_PLATFORMS.find((v) => platforms.has(v.platform));
  const effectiveFormat = customFormat ? format : getFormat(firstSelectedVariant?.formatId ?? DEFAULT_FORMAT_ID);
  const activeSlide = slides[Math.min(activeIndex, slides.length - 1)] ?? slides[0];
  const photo = activeSlide.photo;
  const photoSettings = activeSlide.photoSettings;

  const updateSlide = useCallback((id: string, patch: Partial<Slide> | ((s: Slide) => Partial<Slide>)) => {
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, ...(typeof patch === "function" ? patch(s) : patch) } : s)));
  }, []);

  const projectPhoto = (p: SlidePhoto | null, embed: boolean): ProjectPhoto | null => {
    if (!p) return null;
    if (p.source.kind === "library") return { kind: "library", id: p.source.id };
    return embed ? { kind: "upload", name: p.name, dataUrl: drawableToJpegDataUrl(p.drawable) } : null;
  };

  const currentProject = useCallback(
    (embed: boolean): GalleryProject => ({
      formatId,
      themeId,
      slides: slides.map((s): GallerySlideData => ({ photo: projectPhoto(s.photo, embed), photoSettings: s.photoSettings, caption: s.caption })),
      platforms: Array.from(platforms),
      customFormat,
    }),
    [formatId, themeId, slides, platforms, customFormat],
  );

  // Puts a saved or restored gallery on screen. Returns false if any photo could not be loaded.
  const applyProject = useCallback(async (project: GalleryProject): Promise<boolean> => {
    setFormatId(project.formatId);
    setThemeId(project.themeId);
    setPlatforms(new Set(project.platforms));
    setCustomFormat(project.customFormat);
    let allOk = true;
    const loaded = await Promise.all(
      project.slides.map(async (s): Promise<Slide> => {
        const ref = s.photo;
        if (!ref) return { id: newSlideId(), photo: null, photoSettings: s.photoSettings, caption: s.caption };
        try {
          let drawable, name: string, source: SlidePhoto["source"];
          if (ref.kind === "library") {
            const item = LIBRARY_PHOTOS.find((p) => p.id === ref.id);
            if (!item) throw new Error("Unknown library photo");
            drawable = await loadImage(item.src);
            name = item.label;
            source = { kind: "library", id: ref.id };
          } else {
            drawable = await loadDataUrl(ref.dataUrl);
            name = ref.name;
            source = { kind: "upload" };
          }
          return { id: newSlideId(), photo: { drawable, name, source }, photoSettings: s.photoSettings, caption: s.caption };
        } catch {
          allOk = false;
          return { id: newSlideId(), photo: null, photoSettings: s.photoSettings, caption: s.caption };
        }
      }),
    );
    setSlides(loaded.length >= MIN_SLIDES ? loaded : [...loaded, newSlide()]);
    setActiveIndex(0);
    return allOk;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const result = raw ? parseGalleryProject(raw) : null;
        if (result?.ok) await applyProject(result.project);
      } catch {
        // Storage can be blocked (private windows etc). The tool works without it.
      }
      if (!cancelled) setRestored(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [applyProject]);

  // Autosave. Uploaded photos are not kept (too big for browser storage), library photos are.
  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(STORAGE_KEY, serializeGalleryProject(currentProject(false)));
    } catch {
      // Ignore, see above.
    }
  }, [restored, currentProject]);

  useEffect(() => {
    let cancelled = false;
    loadFonts()
      .catch(() => undefined)
      .then(() => {
        if (!cancelled) setFontsReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadImage(theme.logoSrc)
      .then((img) => {
        if (!cancelled) setLogo(img);
      })
      .catch(() => {
        if (!cancelled) setMessage("Could not load the logo.");
      });
    return () => {
      cancelled = true;
    };
  }, [theme.logoSrc]);

  // Live preview of the active slide, redrawn on every change.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !logo || !fontsReady) return;
    renderCollateral(canvas, {
      format: effectiveFormat,
      template: CAPTION_TEMPLATE,
      theme,
      values: { caption: activeSlide.caption },
      logo,
      photo: photo?.drawable ?? null,
      photoSettings,
      qrCodes: [],
      trackQr: false,
      maxSide: PREVIEW_MAX_SIDE,
    });
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !photo) return;
    const img = { w: photo.drawable.width, h: photo.drawable.height };
    const slideId = activeSlide.id;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const k = canvas.width / rect.width;
      const anchor = { x: (e.clientX - rect.left) * k, y: (e.clientY - rect.top) * k };
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      const factor = Math.exp(-dy * (e.ctrlKey ? 0.01 : 0.0015));
      updateSlide(slideId, (s) => ({
        photoSettings: { ...s.photoSettings, ...zoomPhoto(img, { w: canvas.width, h: canvas.height }, s.photoSettings, s.photoSettings.zoom * factor, anchor) },
      }));
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [photo, activeSlide.id, updateSlide]);

  function canvasScale(): number {
    const canvas = canvasRef.current;
    if (!canvas) return 1;
    return canvas.width / canvas.getBoundingClientRect().width;
  }

  function onPointerDown(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (!photo) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, zoom: photoSettings.zoom };
    }
  }

  function onPointerMove(e: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const prev = pointers.current.get(e.pointerId);
    if (!photo || !canvas || !prev) return;
    const next = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, next);
    const img = { w: photo.drawable.width, h: photo.drawable.height };
    const box = { w: canvas.width, h: canvas.height };
    const k = canvasScale();
    const slideId = activeSlide.id;
    if (pointers.current.size === 1) {
      updateSlide(slideId, (s) => ({ photoSettings: { ...s.photoSettings, ...panPhoto(img, box, s.photoSettings, (next.x - prev.x) * k, (next.y - prev.y) * k) } }));
    } else if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const rect = canvas.getBoundingClientRect();
      const mid = { x: ((a.x + b.x) / 2 - rect.left) * k, y: ((a.y + b.y) / 2 - rect.top) * k };
      const zoom = (pinch.current.zoom * Math.hypot(a.x - b.x, a.y - b.y)) / pinch.current.dist;
      updateSlide(slideId, (s) => ({ photoSettings: { ...s.photoSettings, ...zoomPhoto(img, box, s.photoSettings, zoom, mid) } }));
    }
  }

  function onPointerEnd(e: ReactPointerEvent<HTMLCanvasElement>) {
    pointers.current.delete(e.pointerId);
    pinch.current = null;
  }

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    setMessage(null);
    try {
      const drawable = await fileToDrawable(file);
      updateSlide(activeSlide.id, { photo: { drawable, name: file.name, source: { kind: "upload" } }, photoSettings: { ...DEFAULT_SLIDE_PHOTO_SETTINGS } });
    } catch {
      setMessage("Could not read that image. Try a JPG or PNG.");
    }
  }

  async function onLibraryPhoto(item: LibraryPhoto) {
    setMessage(null);
    try {
      const drawable = await loadImage(item.src);
      updateSlide(activeSlide.id, {
        photo: { drawable, name: item.label, source: { kind: "library", id: item.id } },
        photoSettings: { ...DEFAULT_SLIDE_PHOTO_SETTINGS },
      });
    } catch {
      setMessage("Could not load that photo.");
    }
  }

  function addSlide() {
    if (slides.length >= MAX_SLIDES) return;
    setSlides((prev) => [...prev, newSlide()]);
    setActiveIndex(slides.length);
  }

  function removeSlide(index: number) {
    if (slides.length <= MIN_SLIDES) return;
    setSlides((prev) => prev.filter((_, i) => i !== index));
    setActiveIndex((i) => Math.min(i, slides.length - 2));
  }

  function moveSlide(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= slides.length) return;
    setSlides((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setActiveIndex(target);
  }

  async function renderSlideCanvas(slide: Slide, fmt: Format, bleed: boolean): Promise<HTMLCanvasElement> {
    const canvas = document.createElement("canvas");
    renderCollateral(canvas, {
      format: fmt,
      template: CAPTION_TEMPLATE,
      theme,
      values: { caption: slide.caption },
      logo: logo!,
      photo: slide.photo?.drawable ?? null,
      photoSettings: slide.photoSettings,
      qrCodes: [],
      trackQr: false,
      bleed,
    });
    return canvas;
  }

  async function onDownloadImages() {
    if (!logo) return;
    setBusy(true);
    setMessage(null);
    try {
      const canvases = await Promise.all(slides.map((s) => renderSlideCanvas(s, format, false)));
      await downloadCanvasesPngZip(
        canvases,
        (i) => `${i + 1}-${exportFilename([theme.id], "png")}`,
        exportFilename(["gallery", format.id, theme.id], "zip"),
      );
    } catch {
      setMessage("Could not create the images. Try a smaller format.");
    } finally {
      setBusy(false);
    }
  }

  async function onDownloadPdf() {
    if (!logo) return;
    setBusy(true);
    setMessage(null);
    try {
      const bleed = format.kind === "print";
      const canvases = await Promise.all(slides.map((s) => renderSlideCanvas(s, format, bleed)));
      const filename = exportFilename(["gallery", format.id, theme.id], "pdf");
      if (format.kind === "print") await downloadCanvasesPdf(canvases, format, BLEED_MM, filename);
      else await downloadCanvasesPdfDigital(canvases, filename);
    } catch {
      setMessage("Could not create the PDF. Try again, or download the images instead.");
    } finally {
      setBusy(false);
    }
  }

  function togglePlatform(id: PlatformId) {
    setPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function onDownloadForPlatforms() {
    if (!logo || platforms.size === 0) return;
    setBusy(true);
    setMessage(null);
    try {
      const groups: PlatformExportGroup[] = [];
      for (const variant of CAROUSEL_PLATFORMS) {
        if (!platforms.has(variant.platform)) continue;
        const fmt = getFormat(variant.formatId);
        const used = slides.slice(0, variant.maxSlides);
        const canvases = await Promise.all(used.map((s) => renderSlideCanvas(s, fmt, false)));
        if (variant.export === "images" || variant.export === "both") {
          const blobs = await Promise.all(canvases.map(canvasToPngBlob));
          groups.push({ folder: variant.platform, kind: "images", pngBlobs: blobs });
        }
        if (variant.export === "pdf" || variant.export === "both") {
          const bytes = fmt.kind === "print" ? await pdfBytesForPrint(canvases, fmt, BLEED_MM) : await pdfBytesDigital(canvases);
          groups.push({ folder: variant.platform, kind: "pdf", pdfBytes: bytes, pdfName: exportFilename([variant.platform, "carousel"], "pdf") });
        }
      }
      await downloadPlatformBundleZip(groups, exportFilename(["gallery", "platforms"], "zip"));
    } catch {
      setMessage("Could not create the export. Try again, or use a custom format instead.");
    } finally {
      setBusy(false);
    }
  }

  function onSaveProject() {
    setMessage(null);
    try {
      downloadText(serializeGalleryProject(currentProject(true)), exportFilename(["gallery", format.id, "project"], "json"), "application/json");
      setMessage("Project saved. Use “Open project” to carry on editing later.");
    } catch {
      setMessage("Could not save the project.");
    }
  }

  async function onOpenProject(file: File | undefined) {
    if (openInputRef.current) openInputRef.current.value = "";
    if (!file) return;
    setMessage(null);
    if (file.size > MAX_PROJECT_FILE_BYTES) {
      setMessage("That file is too big to be a saved gallery.");
      return;
    }
    const result = parseGalleryProject(await file.text());
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    const ok = await applyProject(result.project);
    setMessage(ok ? `Opened ${file.name}.` : `Opened ${file.name}, but some photos could not be loaded.`);
  }

  function onReset() {
    setSlides([newSlide(), newSlide()]);
    setActiveIndex(0);
    setPlatforms(new Set(ALL_PLATFORM_IDS));
    setCustomFormat(false);
  }

  return (
    <div className="collateral-studio">
      <div className="collateral-preview">
        <div className="collateral-preview-frame">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={`Preview of slide ${activeIndex + 1} of ${slides.length}`}
            hidden={!logo || !fontsReady}
            className={photo ? "is-draggable" : undefined}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerEnd}
            onPointerCancel={onPointerEnd}
          />
          {(!logo || !fontsReady) && <p className="collateral-loading">Loading…</p>}
        </div>
        <p className="collateral-preview-meta">
          Slide {activeIndex + 1} of {slides.length} · {effectiveFormat.label} · {formatDimensionLabel(effectiveFormat)}
        </p>
        {photo && <p className="collateral-preview-meta">Drag the photo to move it. Scroll or pinch to zoom.</p>}
      </div>

      <div className="collateral-controls">
        <section>
          <h2>1. Platforms</h2>
          <p className="collateral-hint">Pick where this is going. One export gives you every platform&apos;s file(s), cropped to its own format.</p>
          <div className="collateral-choice-grid" role="group" aria-label="Platforms">
            {CAROUSEL_PLATFORMS.map((v) => {
              const checked = platforms.has(v.platform);
              const trimmed = slides.length > v.maxSlides;
              return (
                <label key={v.platform} className={`collateral-choice collateral-choice-checkbox${checked ? " is-checked" : ""}`}>
                  <span className="collateral-choice-head">
                    <input type="checkbox" checked={checked} onChange={() => togglePlatform(v.platform)} disabled={customFormat} />
                    <strong>{v.label}</strong>
                  </span>
                  <span>
                    {v.note}
                    {trimmed && ` — only the first ${v.maxSlides} will be included`}
                  </span>
                </label>
              );
            })}
          </div>
          {!customFormat && platforms.size === 0 && <p className="collateral-hint">Pick at least one platform.</p>}

          <label className="collateral-toggle collateral-custom-format-toggle" htmlFor="gallery-custom-format">
            <input
              id="gallery-custom-format"
              type="checkbox"
              checked={customFormat}
              onChange={(e) => setCustomFormat(e.target.checked)}
            />
            Use a specific format instead (Luma cover, print flyer, Zoom background…)
          </label>

          {customFormat && (
            <>
              <label className="collateral-label" htmlFor="gallery-format">
                Where will it be used?
              </label>
              <select id="gallery-format" value={format.id} onChange={(e) => setFormatId(e.target.value)}>
                {FORMAT_GROUPS.map((group) => (
                  <optgroup key={group} label={group}>
                    {FORMATS.filter((f) => f.group === group).map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label} ({formatDimensionLabel(f)})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </>
          )}
        </section>

        <section>
          <h2>2. Style</h2>
          <div className="collateral-swatches" role="radiogroup" aria-label="Style">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={t.id === theme.id}
                className="collateral-swatch"
                onClick={() => setThemeId(t.id)}
              >
                <span className="collateral-swatch-chip" style={{ background: t.bg, color: t.text }} aria-hidden="true">
                  <i style={{ background: t.accent }} />
                </span>
                {t.label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2>3. Slides</h2>
          <div className="collateral-slide-list">
            {slides.map((s, i) => (
              <div key={s.id} className="collateral-slide-row">
                <button
                  type="button"
                  className="collateral-slide-select"
                  aria-current={i === activeIndex}
                  onClick={() => setActiveIndex(i)}
                >
                  <strong>Slide {i + 1}</strong>
                  <span>{s.caption.trim() || (s.photo ? s.photo.name : "Empty")}</span>
                </button>
                <div className="collateral-slide-move">
                  <button type="button" aria-label={`Move slide ${i + 1} left`} disabled={i === 0} onClick={() => moveSlide(i, -1)}>
                    ‹
                  </button>
                  <button type="button" aria-label={`Move slide ${i + 1} right`} disabled={i === slides.length - 1} onClick={() => moveSlide(i, 1)}>
                    ›
                  </button>
                </div>
                <button
                  type="button"
                  className="collateral-qr-remove"
                  aria-label={`Remove slide ${i + 1}`}
                  disabled={slides.length <= MIN_SLIDES}
                  onClick={() => removeSlide(i)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="btn ghost small" disabled={slides.length >= MAX_SLIDES} onClick={addSlide}>
            {`Add a slide (${slides.length} of ${MAX_SLIDES})`}
          </button>
        </section>

        <section>
          <h2>4. Caption</h2>
          <label className="collateral-label" htmlFor="gallery-caption">
            Slide {activeIndex + 1}
          </label>
          <textarea
            id="gallery-caption"
            rows={3}
            maxLength={CAPTION_MAX}
            value={activeSlide.caption}
            onChange={(e) => updateSlide(activeSlide.id, { caption: e.target.value })}
          />
        </section>

        <section>
          <h2>5. Photo</h2>
          <p className="collateral-hint">Pick one of ours:</p>
          <div className="collateral-photo-grid">
            {LIBRARY_PHOTOS.map((item) => (
              <button
                key={item.id}
                type="button"
                className="collateral-photo-thumb"
                aria-label={item.label}
                aria-pressed={photo?.source.kind === "library" && photo.source.id === item.id}
                title={item.label}
                onClick={() => onLibraryPhoto(item)}
                style={{ backgroundImage: `url(${item.thumb})` }}
              />
            ))}
          </div>
          <p className="collateral-hint">…or upload your own:</p>
          <input type="file" accept="image/*" aria-label="Upload a photo" onChange={(e) => onPhoto(e.target.files?.[0])} />
          {photo && (
            <div className="collateral-photo-controls">
              <p className="collateral-hint">
                {photo.name} · stays in your browser
                <button type="button" className="collateral-link" onClick={() => updateSlide(activeSlide.id, { photo: null })}>
                  Remove
                </button>
              </p>
              <Slider
                label="Zoom"
                min={1}
                max={MAX_ZOOM}
                step={0.05}
                value={photoSettings.zoom}
                onChange={(zoom) => updateSlide(activeSlide.id, (s) => ({ photoSettings: { ...s.photoSettings, zoom } }))}
              />
              <Slider
                label="Left / right"
                min={0}
                max={1}
                step={0.01}
                value={photoSettings.focalX}
                onChange={(focalX) => updateSlide(activeSlide.id, (s) => ({ photoSettings: { ...s.photoSettings, focalX } }))}
              />
              <Slider
                label="Up / down"
                min={0}
                max={1}
                step={0.01}
                value={photoSettings.focalY}
                onChange={(focalY) => updateSlide(activeSlide.id, (s) => ({ photoSettings: { ...s.photoSettings, focalY } }))}
              />
            </div>
          )}
        </section>

        <section className="collateral-actions">
          {customFormat ? (
            <>
              <button type="button" className="btn primary large" onClick={onDownloadImages} disabled={busy || !logo || !fontsReady}>
                {busy ? "Preparing…" : `Download ${slides.length} images (.zip)`}
              </button>
              <button type="button" className="btn primary large" onClick={onDownloadPdf} disabled={busy || !logo || !fontsReady}>
                {busy ? "Preparing…" : "Download PDF"}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn primary large"
              onClick={onDownloadForPlatforms}
              disabled={busy || !logo || !fontsReady || platforms.size === 0}
            >
              {busy ? "Preparing…" : "Download for selected platforms"}
            </button>
          )}
          <button type="button" className="btn ghost large" onClick={onReset}>
            Reset
          </button>
          {message && (
            <p className="collateral-message" role="status">
              {message}
            </p>
          )}
        </section>

        <section>
          <h2>Save your work</h2>
          <p className="collateral-hint">
            Save a project file to edit later or send to another volunteer. It holds your captions, style, and photos. It is not
            uploaded anywhere.
          </p>
          <div className="collateral-actions">
            <button type="button" className="btn ghost" onClick={onSaveProject} disabled={!restored}>
              Save project
            </button>
            <button type="button" className="btn ghost" onClick={() => openInputRef.current?.click()}>
              Open project
            </button>
            <input
              ref={openInputRef}
              type="file"
              accept=".json,application/json"
              hidden
              aria-label="Open a saved gallery"
              onChange={(e) => onOpenProject(e.target.files?.[0])}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
