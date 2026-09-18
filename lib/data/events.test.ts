import { describe, expect, it } from "vitest";
import { chapters } from "./chapters";
import { eventMatchesChapter, filterEventsForChapter, type LumaEntry } from "./events";

function entry(
  name: string,
  geo?: { city?: string; address?: string; region?: string }
): LumaEntry {
  return {
    event: {
      url: name.toLowerCase().replace(/\W+/g, "-"),
      name,
      start_at: "2026-10-01T18:00:00.000Z",
      ...(geo ? { geo_address_info: geo } : {}),
    },
  };
}

const matchersFor = (name: string) => chapters.find((c) => c.name === name)!.eventMatchers;

describe("eventMatchesChapter", () => {
  it("matches on the city Luma fills in for a pinned address", () => {
    const e = entry("PauseAI London Meet (Central)", { city: "London", region: "England" });
    expect(eventMatchesChapter(e, matchersFor("London"))).toBe(true);
    expect(eventMatchesChapter(e, matchersFor("Oxford"))).toBe(false);
  });

  it("matches on the free-text address when no city is set", () => {
    // Real entries: "All Across London", "London, Venue TBD".
    const e = entry("March Against the Machines", { address: "London, Venue TBD" });
    expect(eventMatchesChapter(e, matchersFor("London"))).toBe(true);
  });

  it("matches on the event name when there is no location at all", () => {
    // Online chapter meetings carry no geo_address_info.
    expect(eventMatchesChapter(entry("PauseAI Scotland Meeting"), matchersFor("Glasgow"))).toBe(true);
    expect(
      eventMatchesChapter(entry("Help plan/run PauseAI Oxfordshire's Autumn activities"), matchersFor("Oxford"))
    ).toBe(true);
  });

  it("does not match a region that appears on every English event", () => {
    const e = entry("Some national event", { region: "England", city: "Leeds" });
    for (const chapter of chapters) {
      expect(eventMatchesChapter(e, chapter.eventMatchers), chapter.name).toBe(false);
    }
  });

  it("is word-bounded, so a place name inside a longer word does not match", () => {
    expect(eventMatchesChapter(entry("Meetup", { city: "Bathurst" }), matchersFor("West of England"))).toBe(false);
    expect(eventMatchesChapter(entry("Meetup", { city: "New Oxforden" }), matchersFor("Oxford"))).toBe(false);
    expect(eventMatchesChapter(entry("Meetup", { city: "Bath" }), matchersFor("West of England"))).toBe(true);
  });

  it("ignores case", () => {
    expect(eventMatchesChapter(entry("bristol social!"), matchersFor("West of England"))).toBe(true);
  });
});

describe("filterEventsForChapter", () => {
  const calendar = [
    entry("PauseAI Holborn & St Pancras Canvasing", { city: "London", region: "England" }),
    entry("PauseAI Scotland Meeting"),
    entry("TuesdayPauseday - Weekly Online Call"),
    entry("Bristol Social!", { city: "Bristol", region: "England" }),
    entry("Panel Discussion: Who's Responsible?", { city: "Edinburgh", region: "Scotland" }),
    entry("Tabling and Flyering for the PauseAI Protest", { address: "All Across London" }),
  ];

  it("keeps only the chapter's events, in calendar order", () => {
    expect(filterEventsForChapter(calendar, matchersFor("London")).map((e) => e.event.name)).toEqual([
      "PauseAI Holborn & St Pancras Canvasing",
      "Tabling and Flyering for the PauseAI Protest",
    ]);
  });

  it("covers the chapter's wider region, not just its host city", () => {
    expect(filterEventsForChapter(calendar, matchersFor("Glasgow")).map((e) => e.event.name)).toEqual([
      "PauseAI Scotland Meeting",
      "Panel Discussion: Who's Responsible?",
    ]);
  });

  it("returns nothing rather than throwing for a chapter with no events", () => {
    expect(filterEventsForChapter(calendar, matchersFor("Leicester"))).toEqual([]);
  });

  it("leaves UK-wide online events off chapter pages", () => {
    const online = calendar.filter((e) => e.event.name.startsWith("TuesdayPauseday"));
    for (const chapter of chapters) {
      expect(filterEventsForChapter(online, chapter.eventMatchers), chapter.name).toEqual([]);
    }
  });
});

describe("chapter event matchers", () => {
  it("every chapter declares at least one matcher", () => {
    expect(chapters.length).toBeGreaterThan(0);
    for (const chapter of chapters) {
      expect(chapter.eventMatchers.length, chapter.name).toBeGreaterThan(0);
    }
  });
});
