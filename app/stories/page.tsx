import type { Metadata } from "next";
import Nav from "@/components/Nav";
import StoryCard from "@/components/StoryCard";
import StoryShareForm from "@/components/StoryShareForm";
import { isLongStory, LONG_STORY_CHAR_THRESHOLD, stories } from "@/lib/data/stories";
import { site } from "@/lib/data/site";
import "../track-record/track-record.css";
import "./stories.css";

export const metadata: Metadata = {
  title: "PauseAI UK | Stories",
  description: "Why our volunteers and members got involved with PauseAI UK, in their own words.",
  openGraph: {
    title: "PauseAI UK | Stories",
    description: "Why our volunteers and members got involved with PauseAI UK, in their own words.",
    images: [{ url: "/images/open-graph/open-graph-1200-630.jpg", width: 1200, height: 630 }],
    url: "https://pauseai.uk/stories/",
  },
  twitter: {
    images: ["/images/open-graph/open-graph-1600-840.jpg"],
  },
  alternates: { canonical: "/stories" },
};

export default function StoriesPage() {
  return (
    <>
      <Nav />
      <main className="track-record stories-page">
        <section className="tr-hero">
          <div className="container tr-hero-inner">
            <h1 className="tr-hero-title">Stories</h1>
            <p className="tr-hero-lede">
              Each of us found PauseAI for our own reasons. Read stories from our volunteers and members across our chapters.
            </p>
          </div>
        </section>

        <section className="stories-page-grid">
          <div className="container">
            <div className="story-grid">
              {stories.map((story, i) => (
                <StoryCard
                  key={`${story.name}-${i}`}
                  story={story}
                  index={i}
                  truncate={isLongStory(story)}
                  maxChars={LONG_STORY_CHAR_THRESHOLD}
                  showLink
                />
              ))}
            </div>
            <div className="story-teaser-cta">
              <a className="btn primary large" href={`${site.whatsappUrl}`} target="_blank" rel="noreferrer">
                Join the community
              </a>
            </div>
          </div>
        </section>

        <section id="share-your-story" className="stories-page-share">
          <div className="container">
            <div className="section-header">
              <h2>Share your story</h2>
              <p className="section-lede">
                Why did you get involved, or what are your own concerns about AI? Tell us in your own words, we may feature it on this page.
              </p>
            </div>
            <StoryShareForm />
          </div>
        </section>
      </main>
    </>
  );
}
