import storiesData from "./stories.json";

export type Story = {
  name: string;
  imageSrc?: string;
  imageStyle?: string;
  paragraphs: string[];
  featured?: boolean;
};

export const stories: Story[] = storiesData;

export function storySlug(story: Story, index: number): string {
  const base = story.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || `story-${index}`;
}

function storyLength(story: Story): number {
  return story.paragraphs.join("").length;
}

// Cap the /stories masonry grid at the length of the 3rd-longest story:
// anything longer gets truncated with a "Read more" link to its own page,
// so one or two outliers don't leave a column much taller than the rest.
// Derived from the data (rather than a fixed number) so it stays sensible
// as stories are added or removed.
export const LONG_STORY_CHAR_THRESHOLD = [...stories]
  .map(storyLength)
  .sort((a, b) => b - a)[2] ?? Infinity;

export function isLongStory(story: Story): boolean {
  return storyLength(story) > LONG_STORY_CHAR_THRESHOLD;
}
