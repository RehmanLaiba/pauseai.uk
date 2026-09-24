import type { Metadata } from "next";
import Nav from "@/components/Nav";
import NoAnalytics from "@/components/NoAnalytics";
import { getSourceCounts, lastPlace, leaders, ranks } from "@/lib/data/luma-sources";
import "../trackers.css";

// Volunteer tracker: unlisted, kept out of search results and the sitemap (see HIDDEN_ROUTES in app/sitemap.ts).
export const metadata: Metadata = {
  title: "Flyering tracker, 26 September",
  robots: { index: false, follow: false },
};

// Each stall's QR code links to the event with ?utm_source=<tag>; Luma records it on every registration.
// The stalls recruit for the 5 December march, so that is the event we count.
const EVENT_API_ID = "evt-1HKCXSHaJqGO3Bg";
const EVENT_URL = "https://luma.com/pauseai-dec26";
// The stalls run 12:00–16:00 BST. Registrations outside that window (QR code test scans before, stragglers after) don't count.
const STALLS_OPEN = new Date("2026-09-26T12:00:00+01:00");
const STALLS_CLOSE = new Date("2026-09-26T16:00:00+01:00");
// Pages and Luma responses are cached for up to a minute, so wait a few minutes after close before naming a winner,
// or a late registration could still flip the result after it was announced.
const RESULT_AT = new Date(STALLS_CLOSE.getTime() + 5 * 60 * 1000);
const STALLS = [
  { tag: "stratford", name: "Stratford" },
  { tag: "angel", name: "Angel" },
  { tag: "bakerstreet", name: "Baker Street" },
  { tag: "brixton", name: "Brixton" },
  { tag: "waterloo", name: "Waterloo" },
  { tag: "londonbridge", name: "London Bridge" },
] as const;

const MEDALS = [
  { emoji: "🥇", label: "gold medal" },
  { emoji: "🥈", label: "silver medal" },
  { emoji: "🥉", label: "bronze medal" },
];

export default async function FlyeringTrackerPage() {
  const result = await getSourceCounts(
    EVENT_API_ID,
    STALLS.map((stall) => stall.tag),
    STALLS_OPEN,
    STALLS_CLOSE
  );
  const stallTotal = result ? STALLS.reduce((sum, stall) => sum + result.counts[stall.tag], 0) : 0;
  const ranked = result ? [...STALLS].sort((a, b) => result.counts[b.tag] - result.counts[a.tag]) : STALLS;
  const rankOf = result ? ranks(result.counts) : {};
  const medal = (tag: string) => {
    const rank = rankOf[tag];
    return rank ? MEDALS[rank - 1] : undefined;
  };
  const now = new Date();
  const notStarted = now < STALLS_OPEN;
  const closed = now >= STALLS_CLOSE;
  const winners = result && now >= RESULT_AT ? STALLS.filter((stall) => leaders(result.counts).includes(stall.tag)) : [];
  // The wooden spoon goes to last place, but only in the final result: it would flicker between stalls all afternoon.
  const spoons = result && now >= RESULT_AT ? lastPlace(result.counts) : [];

  return (
    <>
      <Nav />
      <NoAnalytics />
      <main className="tracker-page">
        <div className="container">
          <h1 className="tracker-title">Flyering signups, 26 September</h1>
          <p className="tracker-lede">
            Registrations to <a href={EVENT_URL}>the event</a> that came through each stall&rsquo;s QR code. Updates about once a minute.
          </p>

          {result ? (
            <>
              {notStarted && (
                <p className="tracker-banner">Get ready to flyer! The race starts at 12:00 on Saturday 26 September (BST).</p>
              )}
              {winners.length > 0 && (
                <p className="tracker-banner">
                  🏆 {winners.length > 1 ? "It's a tie between" : "Winner:"} {winners.map((stall) => stall.name).join(" and ")}
                  {" "}with {result.counts[winners[0].tag]}!
                </p>
              )}
              {closed && winners.length === 0 && (
                <p className="tracker-note">
                  {now < RESULT_AT ? "Stalls have closed. Counting the last registrations…" : "Stalls have closed. No one signed up through a stall QR code."}
                </p>
              )}
              <p className="tracker-total">
                <strong>{stallTotal}</strong> from stalls
              </p>
              <ol className="tracker-list">
                {ranked.map((stall) => (
                  <li key={stall.tag} className="tracker-row">
                    <span className="tracker-name">
                      {stall.name}
                      {medal(stall.tag) && (
                        <span role="img" aria-label={medal(stall.tag)!.label}>
                          {" "}
                          {medal(stall.tag)!.emoji}
                        </span>
                      )}
                      {spoons.includes(stall.tag) && (
                        <span role="img" aria-label="wooden spoon">
                          {" "}
                          🥄
                        </span>
                      )}
                    </span>
                    <span
                      className="tracker-bar"
                      aria-hidden="true"
                      style={{ width: `${stallTotal ? (result.counts[stall.tag] / Math.max(...Object.values(result.counts))) * 100 : 0}%` }}
                    />
                    <span className="tracker-count">{result.counts[stall.tag]}</span>
                  </li>
                ))}
              </ol>
              <p className="tracker-note">
                Counting registrations between 12:00 and 16:00 on Saturday. Of {result.total} in that time, {result.other} came from elsewhere, or from links without a stall tag.
              </p>
            </>
          ) : (
            <p className="tracker-error" role="alert">
              Couldn&rsquo;t load registrations from Luma. Try again in a minute. If it keeps failing, check the Luma access settings:
              the API key may have been disabled or removed.
            </p>
          )}
        </div>
      </main>
    </>
  );
}
