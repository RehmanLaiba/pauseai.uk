import type { CSSProperties, ReactNode } from "react";
import type { Story } from "@/lib/data/stories";
import { storySlug } from "@/lib/data/stories";

function parseCssStyle(css: string): CSSProperties {
  const result: Record<string, string> = {};
  css.split(";").filter(Boolean).forEach((decl) => {
    const colonIdx = decl.indexOf(":");
    if (colonIdx === -1) return;
    const key = decl.slice(0, colonIdx).trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    result[key] = decl.slice(colonIdx + 1).trim();
  });
  return result as CSSProperties;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const EXCERPT_LENGTH = 300;

function truncateAtWord(text: string, maxChars: number): string {
  const cut = text.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : maxChars).trimEnd()}…`;
}

function excerptParagraphs(paragraphs: string[], maxChars: number): string[] {
  const plain = paragraphs.map((p) => p.replace(/<[^>]+>/g, ""));
  const result: string[] = [];
  let remaining = maxChars;
  for (const para of plain) {
    if (para.length <= remaining) {
      result.push(para);
      remaining -= para.length;
      if (remaining <= 0) break;
    } else {
      result.push(truncateAtWord(para, remaining));
      break;
    }
  }
  return result;
}

const BULLET_PREFIX = /^-\s+/;

function isBulletLine(text: string): boolean {
  return BULLET_PREFIX.test(text.trim());
}

function bulletText(text: string): string {
  return text.trim().replace(BULLET_PREFIX, "");
}

function renderBody(paragraphs: string[], asHtml: boolean): ReactNode[] {
  const blocks: ReactNode[] = [];
  let i = 0;
  while (i < paragraphs.length) {
    if (isBulletLine(paragraphs[i])) {
      const items: string[] = [];
      const start = i;
      while (i < paragraphs.length && isBulletLine(paragraphs[i])) {
        items.push(bulletText(paragraphs[i]));
        i++;
      }
      blocks.push(
        <ul key={`ul-${start}`}>
          {items.map((item, j) =>
            asHtml ? <li key={j} dangerouslySetInnerHTML={{ __html: item }} /> : <li key={j}>{item}</li>
          )}
        </ul>
      );
    } else {
      const para = paragraphs[i];
      blocks.push(asHtml ? <p key={i} dangerouslySetInnerHTML={{ __html: para }} /> : <p key={i}>{para}</p>);
      i++;
    }
  }
  return blocks;
}

export default function StoryCard({
  story,
  index = 0,
  truncate = false,
}: {
  story: Story;
  index?: number;
  truncate?: boolean;
}) {
  const slug = storySlug(story, index);

  return (
    <article className="story-card" id={truncate ? undefined : slug}>
      <header className="story-card-header">
        {story.imageSrc ? (
          <div
            className="story-avatar"
            style={{ backgroundImage: `url("${story.imageSrc}")`, ...parseCssStyle(story.imageStyle ?? "") }}
          ></div>
        ) : (
          <div className="story-avatar story-avatar-initials" aria-hidden="true">
            {initials(story.name)}
          </div>
        )}
        <div>
          <h3 className="story-name">
            {story.name || <em>Anonymous submission</em>}
          </h3>
        </div>
      </header>
      <div className="story-body">
        {truncate
          ? renderBody(excerptParagraphs(story.paragraphs, EXCERPT_LENGTH), false)
          : renderBody(story.paragraphs, true)}
      </div>
      {truncate && (
        <a className="story-read-more" href={`/stories/#${slug}`}>
          Read more →
        </a>
      )}
    </article>
  );
}
