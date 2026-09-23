"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { tintVisible } from "@/lib/collateral/design";
import type { CalendarEvent } from "@/lib/collateral/eventText";
import { canvasToPngBlob, downloadFilesZip, downloadText, exportFilename, pdfBytesForPrint } from "@/lib/collateral/export";
import { BLEED_MM, FORMAT_GROUPS, FORMATS, formatDimensionLabel, type Format } from "@/lib/collateral/formats";
import { sameIssues, splitByScope, type LintIssue } from "@/lib/collateral/lint";
import { DEFAULT_PACK_FORMAT_IDS, DEFAULT_PHOTO_VIEW, parsePackProject, serializePackProject, type PackProject } from "@/lib/collateral/packProject";
import type { PhotoView } from "@/lib/collateral/photoTransform";
import { renderCollateral, type RenderOptions } from "@/lib/collateral/render";
import { defaultValues, type Drawable } from "@/lib/collateral/templates";
import { getTheme } from "@/lib/collateral/themes";
import Checks from "./Checks";
import DesignControls from "./DesignControls";
import { designFromData, designTemplate, designToData, designValues, newDesign, type DesignState } from "./designState";
import TitleSizeControl from "./TitleSizeControl";
import { usePhotoGestures } from "./usePhotoGestures";
import { useStudioAssets } from "./useStudioAssets";

const RESET_MESSAGE = "Reset to the example text.";
const STORAGE_KEY = "pauseai-collateral-pack-v1";
const PREVIEW_MAX_SIDE = 1400;
const THUMB_MAX_SIDE = 320;
const MAX_PROJECT_FILE_BYTES = 12_000_000;
const TITLE_ISSUES = ["text-overflow", "title-small"];

/** Photo crops per format, valid only for the photo they were set on, so a new photo starts centred everywhere. */
interface ViewsState {
  photo: Drawable | null;
  views: Record<string, PhotoView>;
}

function PackThumb(props: {
  format: Format;
  options: Omit<RenderOptions, "format">;
  issues: LintIssue[];
  active: boolean;
  onSelect: () => void;
  onIssues: (issues: LintIssue[]) => void;
}) {
  const { format, options, issues, active, onSelect, onIssues } = props;
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    onIssues(renderCollateral(ref.current, { ...options, format, maxSide: THUMB_MAX_SIDE, lint: true }).issues);
  });
  const warnings = issues.filter((i) => i.level === "warn").length;
  return (
    <button type="button" className="collateral-pack-thumb" aria-current={active} onClick={onSelect}>
      <canvas ref={ref} aria-hidden="true" />
      <span className="collateral-pack-thumb-label">{format.label}</span>
      <span className={`collateral-pack-badge${warnings ? " is-warn" : issues.length ? " is-info" : ""}`}>
        {warnings ? `⚠ ${warnings}` : issues.length ? `ℹ ${issues.length}` : "✓"}
      </span>
    </button>
  );
}

/** One brief, many formats: fill the design in once and download every format it needs in one zip. */
export default function PackStudio({ events }: { events: CalendarEvent[] }) {
  const [design, setDesign] = useState<DesignState>(() => newDesign("event"));
  const [selected, setSelected] = useState<string[]>(DEFAULT_PACK_FORMAT_IDS);
  const [activeId, setActiveId] = useState<string>(DEFAULT_PACK_FORMAT_IDS[0]);
  const [headlineScales, setHeadlineScales] = useState<Record<string, number>>({});
  const [viewsState, setViewsState] = useState<ViewsState>({ photo: null, views: {} });
  const [issuesById, setIssuesById] = useState<Record<string, LintIssue[]>>({});
  const [restored, setRestored] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [undoReset, setUndoReset] = useState<(() => void) | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const openInputRef = useRef<HTMLInputElement>(null);
  const { fontsReady, logos, error: assetError } = useStudioAssets();

  const template = designTemplate(design);
  const theme = getTheme(design.themeId);
  const values = designValues(design);
  const logo = logos[theme.logoSrc] ?? null;
  const ready = !busy && Boolean(logo) && fontsReady;
  const formats = FORMATS.filter((f) => selected.includes(f.id));
  const active = formats.find((f) => f.id === activeId) ?? formats[0];

  const currentPhoto = design.photo?.drawable ?? null;
  const viewFor = (id: string) => (viewsState.photo === currentPhoto ? viewsState.views[id] : undefined) ?? DEFAULT_PHOTO_VIEW;
  const activeView = active ? viewFor(active.id) : DEFAULT_PHOTO_VIEW;
  function setActiveView(fn: (v: PhotoView) => PhotoView) {
    if (!active) return;
    const id = active.id;
    setViewsState((s) => {
      const views = s.photo === currentPhoto ? s.views : {};
      return { photo: currentPhoto, views: { ...views, [id]: fn(views[id] ?? DEFAULT_PHOTO_VIEW) } };
    });
  }
  const photoGestures = usePhotoGestures(canvasRef, currentPhoto, activeView, setActiveView);
  const update = useCallback((fn: (d: DesignState) => DesignState) => setDesign(fn), []);

  const currentProject = useCallback(
    (embedUploads: boolean): PackProject => ({
      ...designToData(design, embedUploads),
      outputs: FORMATS.filter((f) => selected.includes(f.id)).map((f) => ({
        formatId: f.id,
        photoView: (viewsState.photo === design.photo?.drawable ? viewsState.views[f.id] : undefined) ?? DEFAULT_PHOTO_VIEW,
        headlineScale: headlineScales[f.id] ?? 1,
      })),
    }),
    [design, selected, viewsState, headlineScales],
  );

  const applyProject = useCallback(async (project: PackProject): Promise<boolean> => {
    const { design: loaded, ok } = await designFromData(project);
    setDesign(loaded);
    setSelected(project.outputs.map((o) => o.formatId));
    setHeadlineScales(Object.fromEntries(project.outputs.map((o) => [o.formatId, o.headlineScale])));
    setViewsState({ photo: loaded.photo?.drawable ?? null, views: Object.fromEntries(project.outputs.map((o) => [o.formatId, o.photoView])) });
    return ok;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const result = raw ? parsePackProject(raw) : null;
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

  // Autosave. Uploaded photos are not kept (too big for browser storage), library photos and partner logos are.
  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(STORAGE_KEY, serializePackProject(currentProject(false)));
    } catch {
      // Ignore, see above.
    }
  }, [restored, currentProject]);

  function optionsFor(formatId: string): Omit<RenderOptions, "format"> {
    return {
      template,
      theme,
      values,
      logo: logo!,
      photo: currentPhoto,
      photoSettings: { ...viewFor(formatId), visible: tintVisible(design.tint) },
      qrCodes: design.qrCodes,
      trackQr: design.trackQr,
      qrSize: design.qrSize,
      align: design.align,
      headlineScale: headlineScales[formatId] ?? 1,
      partnerLogos: design.partnerLogos.map((l) => l.drawable),
    };
  }

  // The large preview of the format being adjusted. Its checks come from the thumbnails.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !logo || !fontsReady || !active) return;
    renderCollateral(canvas, { ...optionsFor(active.id), format: active, maxSide: PREVIEW_MAX_SIDE });
  });

  const onIssues = useCallback((id: string, found: LintIssue[]) => {
    setIssuesById((prev) => (prev[id] && sameIssues(prev[id], found) ? prev : { ...prev, [id]: found }));
  }, []);

  function toggleFormat(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function onDownloadPack() {
    if (!logo || formats.length === 0) return;
    setBusy(true);
    setMessage(null);
    try {
      const files: { name: string; data: Blob | Uint8Array }[] = [];
      // One format at a time, so only one big canvas is in memory.
      for (const f of formats) {
        const canvas = document.createElement("canvas");
        renderCollateral(canvas, { ...optionsFor(f.id), format: f });
        files.push({ name: `${f.id}.png`, data: await canvasToPngBlob(canvas) });
        if (f.kind === "print") {
          renderCollateral(canvas, { ...optionsFor(f.id), format: f, bleed: true });
          files.push({ name: `${f.id}-print.pdf`, data: await pdfBytesForPrint([canvas], f, BLEED_MM) });
        }
      }
      await downloadFilesZip(files, exportFilename([template.id, "pack"], "zip"));
    } catch {
      setMessage("Could not create the pack. Try with fewer formats.");
    } finally {
      setBusy(false);
    }
  }

  function onSaveProject() {
    setMessage(null);
    try {
      downloadText(serializePackProject(currentProject(true)), exportFilename([template.id, "pack", "project"], "json"), "application/json");
      setMessage("Pack saved. Use “Open pack” to carry on editing later.");
    } catch {
      setMessage("Could not save the pack.");
    }
  }

  async function onOpenProject(file: File | undefined) {
    if (openInputRef.current) openInputRef.current.value = "";
    if (!file) return;
    setMessage(null);
    if (file.size > MAX_PROJECT_FILE_BYTES) {
      setMessage("That file is too big to be a saved pack.");
      return;
    }
    const result = parsePackProject(await file.text());
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    const ok = await applyProject(result.project);
    setMessage(ok ? `Opened ${file.name}.` : `Opened ${file.name}, but an image in it could not be loaded.`);
  }

  function onReset() {
    const before = { design, selected, headlineScales, viewsState };
    setDesign((d) => ({
      ...d,
      valuesByTemplate: { ...d.valuesByTemplate, [template.id]: defaultValues(template) },
      qrCodes: [],
      photo: null,
      partnerLogos: [],
    }));
    setHeadlineScales({});
    setMessage(RESET_MESSAGE);
    setUndoReset(() => () => {
      setDesign(before.design);
      setSelected(before.selected);
      setHeadlineScales(before.headlineScales);
      setViewsState(before.viewsState);
      setUndoReset(null);
      setMessage(null);
    });
  }

  // Problems in the design itself (its text or QR codes) are the same on every format, so they are listed once,
  // and each format's badge and count only cover what depends on that format.
  const { design: designIssues, own } = splitByScope(formats.map((f) => issuesById[f.id] ?? []));
  const ownIssues = Object.fromEntries(formats.map((f, i) => [f.id, own[i]]));
  const needAttention = formats.filter((f) => ownIssues[f.id].some((i) => i.level === "warn")).length;
  const activeIssues = active ? (ownIssues[active.id] ?? []) : [];
  const downloadButton = (
    <button type="button" className="btn primary large" onClick={onDownloadPack} disabled={!ready || formats.length === 0}>
      {busy ? "Preparing…" : `Download ${formats.length} ${formats.length === 1 ? "format" : "formats"} (.zip)`}
    </button>
  );
  const designWarnings = designIssues.filter((i) => i.level === "warn").length;
  const summary =
    formats.length === 0
      ? "Tick at least one format."
      : [
          designWarnings && `${designWarnings} ${designWarnings === 1 ? "problem affects" : "problems affect"} every format.`,
          needAttention
            ? `${needAttention} of ${formats.length} formats need a look of their own.`
            : designWarnings
              ? "Otherwise every format passed its checks."
              : "Every format passed the checks.",
        ]
          .filter(Boolean)
          .join(" ");
  const shown = message ?? assetError;

  return (
    <div className="collateral-studio">
      {/* Overview first: every format with its checks, then the one being adjusted, larger. */}
      <div className="collateral-preview is-pack">
        {logo && fontsReady && formats.length > 0 && (
          <div className="collateral-pack-grid" role="group" aria-label="Formats in the pack">
            {formats.map((f) => (
              <PackThumb
                key={f.id}
                format={f}
                options={optionsFor(f.id)}
                issues={ownIssues[f.id]}
                active={f.id === active?.id}
                onSelect={() => setActiveId(f.id)}
                onIssues={(found) => onIssues(f.id, found)}
              />
            ))}
          </div>
        )}
        {designIssues.length > 0 && <Checks issues={designIssues} title="Checks for every format" />}
        <div className="collateral-preview-actions">
          <p className="collateral-hint">{summary}</p>
          {downloadButton}
        </div>
        {active ? (
          <>
            <div className="collateral-preview-frame">
              <canvas
                ref={canvasRef}
                role="img"
                aria-label={`Preview of ${active.label}`}
                hidden={!logo || !fontsReady}
                className={design.photo ? "is-draggable" : undefined}
                {...photoGestures}
              />
              {(!logo || !fontsReady) && <p className="collateral-loading">Loading…</p>}
            </div>
            <p className="collateral-preview-meta">
              Adjusting {active.label} · {formatDimensionLabel(active)}
              {design.photo && " · Drag the photo to fit this format. Scroll or pinch to zoom."}
            </p>
          </>
        ) : (
          <p className="collateral-loading">Tick at least one format.</p>
        )}
      </div>

      <div className="collateral-controls">
        <DesignControls design={design} update={update} events={events} firstSection={1} onMessage={setMessage} />

        <section>
          <h2>7. Formats</h2>
          <p className="collateral-hint">Tick every format you need. One download gives you all of them, each laid out for its size.</p>
          {FORMAT_GROUPS.map((group) => (
            <fieldset key={group} className="collateral-format-group">
              <legend>{group}</legend>
              {FORMATS.filter((f) => f.group === group).map((f) => (
                <label key={f.id} className="collateral-toggle">
                  <input type="checkbox" checked={selected.includes(f.id)} onChange={() => toggleFormat(f.id)} />
                  {f.label} <span className="collateral-format-size">{formatDimensionLabel(f)}</span>
                </label>
              ))}
            </fieldset>
          ))}
        </section>

        {active && (
          <section>
            <h2>Adjust one format</h2>
            <label className="collateral-label" htmlFor="collateral-pack-active">
              Format<span> · Or pick one from the previews</span>
            </label>
            <select id="collateral-pack-active" value={active.id} onChange={(e) => setActiveId(e.target.value)}>
              {formats.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                  {ownIssues[f.id].some((i) => i.level === "warn") ? " (needs a look)" : ""}
                </option>
              ))}
            </select>
            <p className="collateral-hint">Changes here apply to this format only. Drag the photo in the preview to crop it for this format.</p>
            <Checks issues={activeIssues} title={`Checks for ${active.label}`} />
            <TitleSizeControl
              value={headlineScales[active.id] ?? 1}
              onChange={(v) => setHeadlineScales((prev) => ({ ...prev, [active.id]: v }))}
              flagged={activeIssues.some((i) => TITLE_ISSUES.includes(i.id))}
            />
          </section>
        )}

        <section className="collateral-actions">
          {designIssues.length > 0 && <Checks issues={designIssues} title="Checks for every format" />}
          <p className="collateral-hint collateral-actions-summary">{summary}</p>
          {downloadButton}
          <button type="button" className="btn ghost large" onClick={onReset}>
            Reset
          </button>
          {shown && (
            <p className="collateral-message" role="status">
              {shown}
              {message === RESET_MESSAGE && undoReset && (
                <button type="button" className="collateral-link" onClick={undoReset}>
                  Undo
                </button>
              )}
            </p>
          )}
        </section>

        <section>
          <h2>Save your work</h2>
          <p className="collateral-hint">
            Save the pack to edit later or send to another volunteer. It holds your text, style, QR codes, photo, partner logos and formats. It
            is not uploaded anywhere.
          </p>
          <div className="collateral-actions">
            <button type="button" className="btn ghost" onClick={onSaveProject} disabled={!restored}>
              Save pack
            </button>
            <button type="button" className="btn ghost" onClick={() => openInputRef.current?.click()}>
              Open pack
            </button>
            <input
              ref={openInputRef}
              type="file"
              accept=".json,application/json"
              hidden
              aria-label="Open a saved pack"
              onChange={(e) => onOpenProject(e.target.files?.[0])}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
