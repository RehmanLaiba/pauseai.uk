"use client";

import { useState, type ReactNode } from "react";
import { MAX_PARTNER_LOGOS, PHOTO_TINTS, QR_SIZES } from "@/lib/collateral/design";
import { eventFieldValues, formatPickedDate, formatPickedTime, type CalendarEvent } from "@/lib/collateral/eventText";
import { LIBRARY_PHOTOS, type LibraryPhoto } from "@/lib/collateral/photos";
import { QR_LABEL_MAX, QR_URL_MAX } from "@/lib/collateral/project";
import { MAX_QR_CODES, normaliseUrl, type QrCode } from "@/lib/collateral/qr";
import { drawableToPngDataUrl, fileToDrawable, loadDataUrl, loadImage } from "@/lib/collateral/render";
import { defaultValues, getTemplate } from "@/lib/collateral/templates";
import { getTheme, THEMES } from "@/lib/collateral/themes";
import CharCount from "./CharCount";
import { DESIGN_TEMPLATES, designTemplate, designValues, type DesignState } from "./designState";

interface Props {
  design: DesignState;
  update: (fn: (d: DesignState) => DesignState) => void;
  /** Upcoming events from our calendar, for "fill in from an event". */
  events: CalendarEvent[];
  /** Number of the first section here, since each studio puts its own sections before or after. */
  firstSection: number;
  /** Extra photo controls from the studio, e.g. crop sliders. */
  photoExtras?: ReactNode;
  /** Why QR codes are hidden or trimmed on the current format, when there is one format. */
  qrReason?: string;
  onOpenGallery?: () => void;
  onMessage: (message: string | null) => void;
}

const sameUrl = (a: string, b: string) => normaliseUrl(a).toLowerCase() === normaliseUrl(b).toLowerCase();

/** Layout, style, text, QR codes, photo and partner logos: everything about a design except its format. */
export default function DesignControls({ design, update, events, firstSection, photoExtras, qrReason, onOpenGallery, onMessage }: Props) {
  const template = designTemplate(design);
  const theme = getTheme(design.themeId);
  const values = designValues(design);
  const n = (i: number) => firstSection + i;
  // What the date and time pickers hold. They only write into the text fields, which stay the source of truth.
  const [picked, setPicked] = useState({ date: "", start: "", end: "" });

  function setValue(key: string, value: string) {
    update((d) => ({ ...d, valuesByTemplate: { ...d.valuesByTemplate, [template.id]: { ...designValues(d), [key]: value } } }));
  }

  function onPick(next: { date: string; start: string; end: string }) {
    setPicked(next);
    const date = formatPickedDate(next.date);
    const start = formatPickedTime(next.start);
    const end = formatPickedTime(next.end);
    update((d) => {
      const current = designValues(d);
      return {
        ...d,
        valuesByTemplate: {
          ...d.valuesByTemplate,
          [template.id]: { ...current, date: date || current.date, time: start ? (end ? `${start} – ${end}` : start) : current.time },
        },
      };
    });
  }

  function importEvent(id: string) {
    const ev = events.find((e) => e.id === id);
    if (!ev) return;
    const filled = eventFieldValues(ev);
    update((d) => {
      const before = { ...defaultValues(getTemplate("event")), ...d.valuesByTemplate.event };
      // A QR code that opened the old web address follows it to the event's page.
      const qrCodes = d.qrCodes.map((c) => (before.url && sameUrl(c.url, before.url) ? { ...c, url: filled.url } : c));
      const event = { ...before, ...filled, group: filled.group || before.group };
      return { ...d, templateId: "event", valuesByTemplate: { ...d.valuesByTemplate, event }, qrCodes };
    });
    onMessage(`Filled in from “${ev.name}”. Check the text before you download.`);
  }

  // The first code opens the design's own web address, since that is almost always where it should go.
  // Later codes start blank, so two codes never quietly point at the same place.
  function newQr(): QrCode {
    if (design.qrCodes.length > 0) return { label: "", url: "" };
    return { label: template.id === "event" ? "Scan to RSVP" : "Scan to join", url: values.url?.trim() || "pauseai.uk" };
  }

  function updateQr(index: number, patch: Partial<QrCode>) {
    update((d) => ({ ...d, qrCodes: d.qrCodes.map((c, i) => (i === index ? { ...c, ...patch } : c)) }));
  }

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    onMessage(null);
    try {
      const drawable = await fileToDrawable(file);
      update((d) => ({ ...d, photo: { drawable, name: file.name, source: { kind: "upload" } } }));
    } catch {
      onMessage("Could not read that image. Try a JPG or PNG.");
    }
  }

  async function onLibraryPhoto(item: LibraryPhoto) {
    onMessage(null);
    try {
      const drawable = await loadImage(item.src);
      update((d) => ({ ...d, photo: { drawable, name: item.label, source: { kind: "library", id: item.id } } }));
    } catch {
      onMessage("Could not load that photo.");
    }
  }

  async function onPartnerLogo(file: File | undefined) {
    if (!file) return;
    onMessage(null);
    try {
      // Downscaled and re-encoded as PNG, so it stays small enough to save with the project and keeps transparency.
      const dataUrl = drawableToPngDataUrl(await fileToDrawable(file));
      const drawable = await loadDataUrl(dataUrl);
      update((d) => ({ ...d, partnerLogos: [...d.partnerLogos, { name: file.name, dataUrl, drawable }].slice(0, MAX_PARTNER_LOGOS) }));
    } catch {
      onMessage("Could not read that logo. Try a PNG with a transparent background.");
    }
  }

  return (
    <>
      <section>
        <h2>{n(0)}. Layout</h2>
        <div className="collateral-choice-grid" role="radiogroup" aria-label="Layout">
          {DESIGN_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={t.id === template.id}
              className="collateral-choice"
              onClick={() => update((d) => ({ ...d, templateId: t.id }))}
            >
              <strong>{t.label}</strong>
              <span>{t.description}</span>
            </button>
          ))}
        </div>
        {onOpenGallery && (
          <p className="collateral-hint">
            Photo with a caption, or a post with several slides?
            <button type="button" className="collateral-link" onClick={onOpenGallery}>
              Use Gallery / carousel
            </button>
          </p>
        )}
      </section>

      <section>
        <h2>{n(1)}. Style</h2>
        <div className="collateral-swatches" role="radiogroup" aria-label="Style">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={t.id === theme.id}
              className="collateral-swatch"
              onClick={() => update((d) => ({ ...d, themeId: t.id }))}
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
        <h2>{n(2)}. Text</h2>
        {events.length > 0 && (
          <div className="collateral-field">
            <label className="collateral-label" htmlFor="collateral-import-event">
              Fill in from one of our events
              <span> · Optional</span>
            </label>
            <select id="collateral-import-event" value="" onChange={(e) => importEvent(e.target.value)}>
              <option value="">Pick an upcoming event…</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {eventFieldValues(ev).date} · {ev.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {template.id === "event" && (
          <div className="collateral-field">
            <span className="collateral-label">
              Pick the date and time<span> · Or type them below</span>
            </span>
            <div className="collateral-date-pickers">
              <input
                type="date"
                aria-label="Event date"
                value={picked.date}
                onChange={(e) => onPick({ ...picked, date: e.target.value })}
              />
              <input
                type="time"
                aria-label="Start time"
                value={picked.start}
                onChange={(e) => onPick({ ...picked, start: e.target.value })}
              />
              <span aria-hidden="true">to</span>
              <input type="time" aria-label="End time" value={picked.end} onChange={(e) => onPick({ ...picked, end: e.target.value })} />
            </div>
          </div>
        )}
        {template.fields.map((field) => {
          const id = `collateral-${template.id}-${field.key}`;
          const value = values[field.key] ?? "";
          if (field.kind === "toggle") {
            return (
              <label key={field.key} className="collateral-toggle" htmlFor={id}>
                <input id={id} type="checkbox" checked={value === "true"} onChange={(e) => setValue(field.key, e.target.checked ? "true" : "false")} />
                {field.label}
              </label>
            );
          }
          return (
            <div key={field.key} className="collateral-field">
              <label className="collateral-label" htmlFor={id}>
                {field.label}
                {field.hint && <span> · {field.hint}</span>}
              </label>
              {field.kind === "textarea" ? (
                <textarea id={id} rows={2} maxLength={field.maxLength} value={value} onChange={(e) => setValue(field.key, e.target.value)} />
              ) : (
                <input id={id} type="text" maxLength={field.maxLength} value={value} onChange={(e) => setValue(field.key, e.target.value)} />
              )}
              <CharCount value={value} max={field.maxLength} />
            </div>
          );
        })}
        <span className="collateral-label">Text alignment</span>
        <div className="collateral-segmented" role="radiogroup" aria-label="Text alignment">
          {(["left", "center"] as const).map((align) => (
            <button key={align} type="button" role="radio" aria-checked={design.align === align} onClick={() => update((d) => ({ ...d, align }))}>
              {align === "left" ? "Left" : "Centre"}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2>{n(3)}. QR codes (optional)</h2>
        {design.qrCodes.map((code, i) => (
          <div key={i} className="collateral-qr-row">
            <div className="collateral-qr-fields">
              <input
                type="text"
                aria-label={`QR code ${i + 1} label`}
                placeholder="Label under the code, e.g. RSVP"
                maxLength={QR_LABEL_MAX}
                value={code.label}
                onChange={(e) => updateQr(i, { label: e.target.value })}
              />
              <input
                type="text"
                aria-label={`QR code ${i + 1} web address`}
                placeholder="Web address, e.g. pauseai.uk/join"
                maxLength={QR_URL_MAX}
                value={code.url}
                onChange={(e) => updateQr(i, { url: e.target.value })}
              />
              <CharCount value={code.url} max={QR_URL_MAX} />
            </div>
            <button
              type="button"
              className="collateral-qr-remove"
              aria-label={`Remove QR code ${i + 1}`}
              onClick={() => update((d) => ({ ...d, qrCodes: d.qrCodes.filter((_, j) => j !== i) }))}
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn ghost small"
          disabled={design.qrCodes.length >= MAX_QR_CODES}
          onClick={() => {
            const code = newQr();
            update((d) => ({ ...d, qrCodes: [...d.qrCodes, code] }));
          }}
        >
          {design.qrCodes.length === 0 ? "Add a QR code" : `Add another (${design.qrCodes.length} of ${MAX_QR_CODES})`}
        </button>
        {design.qrCodes.length > 0 && (
          <>
            <span className="collateral-label collateral-qr-size-label">Size</span>
            <div className="collateral-segmented" role="radiogroup" aria-label="QR code size">
              {QR_SIZES.map((s) => (
                <button key={s.id} type="button" role="radio" aria-checked={design.qrSize === s.id} onClick={() => update((d) => ({ ...d, qrSize: s.id }))}>
                  {s.label}
                </button>
              ))}
            </div>
            <p className="collateral-hint">Codes never go below the size phones can scan, so Small may look the same as Medium.</p>
          </>
        )}
        {/* UTM tagging is switched off until we have a way to read the results. See qrTarget in lib/collateral/qr.ts. */}
        {design.qrCodes.length > 0 && qrReason && <p className="collateral-hint">{qrReason}</p>}
      </section>

      <section>
        <h2>{n(4)}. Photo (optional)</h2>
        <p className="collateral-hint">Pick one of ours:</p>
        <div className="collateral-photo-grid">
          {LIBRARY_PHOTOS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="collateral-photo-thumb"
              aria-label={item.label}
              aria-pressed={design.photo?.source.kind === "library" && design.photo.source.id === item.id}
              title={item.label}
              onClick={() => onLibraryPhoto(item)}
              style={{ backgroundImage: `url(${item.thumb})` }}
            />
          ))}
        </div>
        <p className="collateral-hint">…or upload your own:</p>
        <input type="file" accept="image/*" aria-label="Upload a photo" onChange={(e) => onPhoto(e.target.files?.[0])} />
        {design.photo && (
          <div className="collateral-photo-controls">
            <p className="collateral-hint">
              {design.photo.name} · stays in your browser
              <button type="button" className="collateral-link" onClick={() => update((d) => ({ ...d, photo: null }))}>
                Remove
              </button>
            </p>
            {theme.noPhotoTint ? (
              <p className="collateral-hint">
                Clear keeps your photo untouched and outlines the text so it stands out. If it is still hard to read, try another style.
              </p>
            ) : (
              <>
                <span className="collateral-label collateral-tint-label">Colour over the photo</span>
                <div className="collateral-segmented" role="radiogroup" aria-label="Colour over the photo">
                  {PHOTO_TINTS.map((t) => (
                    <button key={t.id} type="button" role="radio" aria-checked={design.tint === t.id} onClick={() => update((d) => ({ ...d, tint: t.id }))}>
                      {t.label}
                    </button>
                  ))}
                </div>
                {design.tint === "none" && <p className="collateral-hint">With no colour, the text gets an outline so it stands out.</p>}
              </>
            )}
            {photoExtras}
          </div>
        )}
      </section>

      <section>
        <h2>{n(5)}. Partner logos (optional)</h2>
        <p className="collateral-hint">
          For events run with another organisation. Logos sit to the right of ours. A PNG with a transparent background works best.
        </p>
        {design.partnerLogos.map((logo, i) => (
          <p key={`${logo.name}-${i}`} className="collateral-hint">
            {logo.name}
            <button
              type="button"
              className="collateral-link"
              onClick={() => update((d) => ({ ...d, partnerLogos: d.partnerLogos.filter((_, j) => j !== i) }))}
            >
              Remove
            </button>
          </p>
        ))}
        {design.partnerLogos.length < MAX_PARTNER_LOGOS && (
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            aria-label="Upload a partner logo"
            onChange={(e) => {
              void onPartnerLogo(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        )}
      </section>
    </>
  );
}
