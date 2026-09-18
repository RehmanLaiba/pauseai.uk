import EventList from "@/components/EventList";
import { chapters } from "@/lib/data/chapters";
import { filterEventsForChapter, getEvents } from "@/lib/data/events";
import { site } from "@/lib/data/site";

/**
 * The chapter's slice of the UK Luma calendar, rendered with the same cards
 * as the homepage.
 *
 * Chapter pages used to say "we meet regularly" with the calendar reachable
 * only from the footer, so someone who arrived from pauseai.info/communities
 * had no way to see when anything was actually happening.
 *
 * An async server component rather than a change to each page's own
 * signature: the pages stay synchronous and each one only adds this tag.
 */
export default async function ChapterEvents({ chapterName }: { chapterName: string }) {
  const chapter = chapters.find((c) => c.name === chapterName);
  if (!chapter) {
    throw new Error(
      `ChapterEvents: no chapter named "${chapterName}" in lib/data/chapters.ts`
    );
  }

  const events = filterEventsForChapter(await getEvents(), chapter.eventMatchers);

  return (
    <section id="events" className="next-event">
      <div className="container">
        <div className="section-heading-row">
          <h2 className="section-heading">Upcoming events in {chapter.name}</h2>
          <a
            className="btn primary section-heading-cta"
            href={site.social.luma}
            target="_blank"
            rel="noreferrer"
          >
            View the full UK calendar →
          </a>
        </div>
        <EventList
          events={events}
          lumaUrl={site.social.luma}
          emptyPrefix={`Nothing is listed in ${chapter.name} just now. See the UK-wide`}
          emptySuffix="for everything else we have coming up."
        />
      </div>
    </section>
  );
}
