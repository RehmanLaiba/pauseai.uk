import type { LumaEntry, LumaEvent } from "@/lib/data/events";

/** An upcoming event from our Luma calendar, trimmed to what the collateral tools need. Plain data for the client. */
export interface CalendarEvent {
  /** Luma's short id, used as the React key and in the link. */
  id: string;
  name: string;
  startAt: string;
  endAt?: string;
  timezone?: string;
  /** "Venue, City", or "Online" when Luma has no address. */
  venue: string;
  city?: string;
}

export function toCalendarEvents(entries: LumaEntry[]): CalendarEvent[] {
  return entries.map(({ event }) => {
    // end_at is in Luma's response but not in the shared type.
    const e = event as LumaEvent & { end_at?: string };
    const geo = e.geo_address_info;
    const venue = [geo?.address, geo?.city].filter(Boolean).filter((v, i, all) => all.indexOf(v) === i).join(", ");
    return {
      id: e.url,
      name: e.name,
      startAt: e.start_at,
      endAt: e.end_at,
      timezone: e.timezone,
      venue: venue || "Online",
      city: geo?.city || undefined,
    };
  });
}

/** Luma sometimes sends a zone Intl does not know, so fall back to London rather than throw. */
const validTimeZone = (tz?: string) => {
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: tz || "Europe/London" });
    return tz || "Europe/London";
  } catch {
    return "Europe/London";
  }
};

/** "Wednesday 28 October", with the year added when it is not this year. */
export function formatDay(date: Date, timeZone: string, now = new Date()): string {
  const parts = (d: Date) =>
    Object.fromEntries(
      new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone })
        .formatToParts(d)
        .map((p) => [p.type, p.value]),
    );
  const p = parts(date);
  const thisYear = parts(now).year;
  return `${p.weekday} ${p.day} ${p.month}${p.year !== thisYear ? ` ${p.year}` : ""}`;
}

/** "7pm" or "6:30pm". */
export function formatClock(hours: number, minutes: number): string {
  const suffix = hours >= 12 ? "pm" : "am";
  const h = hours % 12 || 12;
  return minutes ? `${h}:${String(minutes).padStart(2, "0")}${suffix}` : `${h}${suffix}`;
}

function clockIn(date: Date, timeZone: string): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "numeric", hourCycle: "h23", timeZone })
      .formatToParts(date)
      .map((x) => [x.type, x.value]),
  );
  return formatClock(Number(p.hour), Number(p.minute));
}

/** "6:30pm – 8:30pm", or just the start when there is no end. */
export function formatTimeRange(start: string, end: string | undefined, timeZone: string): string {
  const from = clockIn(new Date(start), timeZone);
  return end ? `${from} – ${clockIn(new Date(end), timeZone)}` : from;
}

/** Field values for the Event layout, filled from a calendar event. */
export function eventFieldValues(ev: CalendarEvent, now = new Date()): Record<string, string> {
  const tz = validTimeZone(ev.timezone);
  return {
    headline: ev.name.slice(0, 80),
    date: formatDay(new Date(ev.startAt), tz, now).slice(0, 32),
    time: formatTimeRange(ev.startAt, ev.endAt, tz).slice(0, 24),
    venue: ev.venue.slice(0, 60),
    url: `lu.ma/${ev.id}`,
    group: (ev.city ?? "").slice(0, 24),
  };
}

/** "Wednesday 28 October" from a date input's "YYYY-MM-DD". Empty when it cannot be read. */
export function formatPickedDate(ymd: string, now = new Date()): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return "";
  // Noon UTC keeps the calendar day the same wherever the formatter's zone is.
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12));
  return formatDay(date, "UTC", now);
}

/** "6:30pm" from a time input's "HH:MM". Empty when it cannot be read. */
export function formatPickedTime(hm: string): string {
  const m = /^(\d{2}):(\d{2})$/.exec(hm);
  return m ? formatClock(Number(m[1]), Number(m[2])) : "";
}
