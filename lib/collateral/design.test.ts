import { describe, expect, it } from "vitest";
import { clampHeadlineScale, snapTint, tintVisible } from "./design";
import { LintCollector } from "./lint";

describe("photo tint steps", () => {
  it("round-trips each step", () => {
    for (const tint of ["strong", "medium", "none"] as const) expect(snapTint(tintVisible(tint))).toBe(tint);
  });

  it("snaps older slider values to the nearest step", () => {
    expect(snapTint(0.3)).toBe("strong");
    expect(snapTint(0.45)).toBe("medium");
    expect(snapTint(0.7)).toBe("medium");
    expect(snapTint(0.9)).toBe("none");
  });
});

describe("clampHeadlineScale", () => {
  it("keeps the nudge on tidy steps within range", () => {
    expect(clampHeadlineScale(1.1000000001)).toBe(1.1);
    expect(clampHeadlineScale(5)).toBe(1.3);
    expect(clampHeadlineScale(0)).toBe(0.7);
    expect(clampHeadlineScale("big")).toBe(1);
  });
});

describe("LintCollector", () => {
  it("lists each problem once, warnings first", () => {
    const lint = new LintCollector();
    lint.add({ id: "a", level: "info", message: "A" });
    lint.add({ id: "b", level: "warn", message: "B" });
    lint.add({ id: "a", level: "info", message: "A again" });
    expect(lint.finish().map((i) => i.id)).toEqual(["b", "a"]);
  });

  it("flags text that prints too small", () => {
    const lint = new LintCollector();
    lint.noteText(20); // 20 px at 300 dpi is 4.8 pt
    expect(lint.finish(300).map((i) => i.id)).toEqual(["print-small-text"]);
  });

  it("ignores text size for digital formats", () => {
    const lint = new LintCollector();
    lint.noteText(4);
    expect(lint.finish()).toEqual([]);
  });
});
