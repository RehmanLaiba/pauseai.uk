/** One problem the checks list shows beside Download. */
export interface LintIssue {
  /** Stable key, so the same problem is listed once. */
  id: string;
  /** "warn" needs attention before printing or posting; "info" is worth a look. */
  level: "warn" | "info";
  message: string;
}

/** Smallest comfortable printed text, in points. */
export const MIN_PRINT_PT = 7;

/**
 * Collects problems while a layout draws, plus the smallest text size drawn, so print sizes
 * can be checked afterwards. Only the preview passes one: downloads skip the bookkeeping.
 */
export class LintCollector {
  readonly issues: LintIssue[] = [];
  /** Smallest font drawn, in export pixels. */
  minTextPx = Infinity;

  add(issue: LintIssue) {
    if (!this.issues.some((i) => i.id === issue.id)) this.issues.push(issue);
  }

  noteText(exportPx: number) {
    if (exportPx > 0 && exportPx < this.minTextPx) this.minTextPx = exportPx;
  }

  /** Adds checks that need the whole drawing, then returns the issues, warnings first. */
  finish(dpi?: number): LintIssue[] {
    if (dpi && Number.isFinite(this.minTextPx)) {
      const pt = (this.minTextPx / dpi) * 72;
      if (pt < MIN_PRINT_PT) {
        this.add({
          id: "print-small-text",
          level: "warn",
          message: `Some text prints at ${pt.toFixed(1)} pt, which is hard to read. Use less text or a bigger format.`,
        });
      }
    }
    return [...this.issues].sort((a, b) => (a.level === b.level ? 0 : a.level === "warn" ? -1 : 1));
  }
}

export function sameIssues(a: LintIssue[], b: LintIssue[]): boolean {
  return a.length === b.length && a.every((issue, i) => issue.id === b[i].id && issue.message === b[i].message);
}
