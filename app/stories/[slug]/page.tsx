import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CopyLinkButton from "@/components/CopyLinkButton";
import Nav from "@/components/Nav";
import StoryShareForm from "@/components/StoryShareForm";
import { stories, storySlug } from "@/lib/data/stories";
import { site } from "@/lib/data/site";
import { avatarFallback, parseCssStyle, renderBody } from "@/lib/storyRender";
import "../../track-record/track-record.css";
import "../stories.css";

function findStory(slug: string) {
  const index = stories.findIndex((story, i) => storySlug(story, i) === slug);
  if (index === -1) return null;
  return { story: stories[index], index };
}

export function generateStaticParams() {
  return stories.map((story, i) => ({ slug: storySlug(story, i) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const found = findStory(slug);
  if (!found) return {};

  const { story } = found;
  const title = `${story.name || "Anonymous submission"} | PauseAI UK Stories`;
  const plainFirstParagraph = story.paragraphs[0]?.replace(/<[^>]+>/g, "") ?? "";
  const description =
    plainFirstParagraph.length > 160 ? `${plainFirstParagraph.slice(0, 157).trimEnd()}…` : plainFirstParagraph;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: "/images/open-graph/open-graph-1200-630.jpg", width: 1200, height: 630 }],
      url: `https://pauseai.uk/stories/${slug}/`,
    },
    twitter: {
      images: ["/images/open-graph/open-graph-1600-840.jpg"],
    },
    alternates: { canonical: `/stories/${slug}` },
  };
}

export default async function StoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = findStory(slug);
  if (!found) notFound();

  const { story } = found;

  return (
    <>
      <Nav />
      <main className="track-record stories-page story-detail-page">
        <section className="tr-hero">
          <div className="container tr-hero-inner">
            <Link className="story-back-link" href="/stories">
              ← Back to all stories
            </Link>
            <div className="story-detail-heading">
              {story.imageSrc ? (
                <div
                  className="story-detail-avatar"
                  style={{ backgroundImage: `url("${story.imageSrc}")`, ...parseCssStyle(story.imageStyle ?? "") }}
                ></div>
              ) : (
                <div className="story-detail-avatar story-avatar-initials" aria-hidden="true">
                  {avatarFallback(story.name)}
                </div>
              )}
              <div className="story-detail-title-wrap">
                <h1 className="tr-hero-title">{story.name || "Anonymous submission"}</h1>
              </div>
              <CopyLinkButton slug={slug} className="story-detail-share-btn" size={20} />
            </div>
          </div>
        </section>

        <section className="stories-page-grid">
          <div className="container story-detail-grid">
            <div className="story-body">{renderBody(story.paragraphs, true)}</div>
          </div>
        </section>

        <section className="stories-page-share">
          <div className="container">
            <div className="section-header">
              <h2>Share your story</h2>
              <p className="section-lede">
                Why did you get involved, or what are your own concerns about AI?
              </p>
              <p className="section-lede">
                Tell us in your own words, we may feature it on this page. Connect with others who have similar stories in{" "}
                <a className="inline-link" href={site.whatsappUrl} target="_blank" rel="noreferrer">
                  our community
                </a>
                .
              </p>
            </div>
            <StoryShareForm />
          </div>
        </section>
      </main>
    </>
  );
}
