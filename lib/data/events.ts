export type LumaGeoAddressInfo = {
  city?: string;
  address?: string;
  region?: string;
  country?: string;
};

export type LumaEvent = {
  url: string;
  name: string;
  start_at: string;
  timezone?: string;
  cover_url?: string;
  location_type?: string;
  geo_address_info?: LumaGeoAddressInfo;
};

export type LumaEntry = {
  event: LumaEvent;
};

export async function getEvents(): Promise<LumaEntry[]> {
  try {
    const res = await fetch(
      "https://api2.luma.com/calendar/get-items?calendar_api_id=cal-Z327EhtiFdHuVie&pagination_limit=50&period=future",
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const entries: LumaEntry[] = data.entries ?? [];
    // Guard against malformed Luma records: rendering assumes event.url and
    // event.start_at exist (EventList key, links, date formatting).
    return entries.filter((entry) => entry?.event?.url && entry.event?.start_at);
  } catch {
    return [];
  }
}

/**
 * Whether a Luma entry belongs to a chapter, matched against the chapter's
 * `eventMatchers` (see lib/data/chapters.ts).
 *
 * Luma only fills `geo_address_info.city` for events pinned to a mapped
 * address; plenty of real entries leave it empty and carry the place in the
 * free-text address ("All Across London", "London, Venue TBD") or in the
 * event name ("PauseAI Scotland Meeting"). Matching all three is what stops a
 * chapter page looking empty while its events sit on the calendar.
 *
 * `region` is deliberately not searched: it is "England" for most of the
 * calendar and would match every matcher for every chapter.
 */
export function eventMatchesChapter(entry: LumaEntry, matchers: readonly string[]): boolean {
  const geo = entry.event.geo_address_info;
  const haystack = [entry.event.name, geo?.city, geo?.address].filter(Boolean).join(" ").toLowerCase();
  // Word-bounded so "bath" does not match "Bathurst" and "oxford" does not
  // match a street name inside another city's address.
  return matchers.some((m) => new RegExp(`\\b${escapeRegExp(m.toLowerCase())}\\b`).test(haystack));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function filterEventsForChapter(
  entries: LumaEntry[],
  matchers: readonly string[]
): LumaEntry[] {
  return entries.filter((entry) => eventMatchesChapter(entry, matchers));
}

// An invalid/unrecognised IANA timezone throws RangeError from
// toLocaleDateString/toLocaleTimeString — seen in practice from bad Luma
// records — so fall back to Europe/London rather than 500ing the page.
function safeLocaleString(
  method: "toLocaleDateString" | "toLocaleTimeString",
  startAt: string,
  timezone: string | undefined,
  options: Intl.DateTimeFormatOptions
): string {
  const date = new Date(startAt);
  try {
    return date[method]("en-GB", { ...options, timeZone: timezone || "Europe/London" });
  } catch {
    return date[method]("en-GB", { ...options, timeZone: "Europe/London" });
  }
}

export function formatEventDate(startAt: string, timezone?: string): string {
  return safeLocaleString("toLocaleDateString", startAt, timezone, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatEventTime(startAt: string, timezone?: string): string {
  return safeLocaleString("toLocaleTimeString", startAt, timezone, {
    hour: "2-digit",
    minute: "2-digit",
  });
}
