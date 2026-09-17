import { news } from "./news";

export type CoverageItem = {
  outlet: string;
  medium: "Video" | "Photos" | "Article";
  description?: string;
  /** Single-link items set this. Multi-platform items (the same clip/story
      cross-posted) set `links` instead and leave this undefined. */
  url?: string;
  /** For a story cross-posted across platforms: one row showing each
      platform as its own link, e.g. "Instagram, X, YouTube". */
  links?: { label: string; url: string }[];
  /** Publish date, YYYY-MM-DD. Drives sort order on the /press coverage
      table; undated items sort to the bottom. */
  date?: string;
};

export const broadcastCoverage: CoverageItem[] = [
  {
    outlet: "Channel 4",
    medium: "Video",
    description: "PauseAI activists stage emergency protest outside Downing Street",
    links: [
      { label: "Facebook", url: "https://www.facebook.com/reel/1522309576272007/" },
      { label: "X", url: "https://x.com/Channel4News/status/2100298598772605015" },
      { label: "YouTube", url: "https://www.youtube.com/shorts/2JRtI-dDwgc" },
    ],
    date: "2026-09-16",
  },
  {
    outlet: "ITV",
    medium: "Video",
    description: "Protesters demand pause on AI development",
    links: [
      { label: "Instagram", url: "https://www.instagram.com/p/DdWzB4Gxkv_/" },
      { label: "YouTube", url: "https://www.youtube.com/shorts/TFxdevKHM8s" },
    ],
    date: "2026-09-16",
  },
  {
    outlet: "ITV",
    medium: "Video",
    description: "Why is AI safety back in the spotlight",
    url: "https://www.youtube.com/shorts/rkgvZRnoytA",
    date: "2026-09-16",
  },
  {
    outlet: "Al Arabiya",
    medium: "Video",
    description: "Activists gather outside Downing Street in London, calling on governments to pause AI development",
    url: "https://www.instagram.com/p/DdWvDuejvh7/",
    date: "2026-09-16",
  },
  {
    outlet: "Imago Images",
    medium: "Photos",
    description: "Pause AI, urging the government to limit the development of artificial intelligence amid warnings that it could lead to human extinction",
    url: "https://www.imago-images.com/st/0867004406",
    date: "2026-09-16",
  },
  {
    outlet: "Reuters Connect (Anadolu Agency)",
    medium: "Photos",
    description: "PauseAI activists stage emergency protest outside Downing Street in London",
    url: "https://www.reutersconnect.com/item/pauseai-activists-stage-emergency-protest-outside-downing-street-in-london/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX01UMUFOQURMMDAwTkZPN1hH",
    date: "2026-09-16",
  },
  {
    outlet: "Reuters Connect (Zuma Press)",
    medium: "Photos",
    description: "Pause AI Protest Outside Downing Street",
    url: "https://www.reutersconnect.com/item/pause-ai-protest-outside-downing-street/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX01UMVpVTUEwMDBGRzlOVEs",
    date: "2026-09-16",
  },
  {
    outlet: "Reuters Connect (Nurphoto)",
    medium: "Photos",
    description: "Pause AI Emergency Protest In London",
    url: "https://www.reutersconnect.com/item/pause-ai-emergency-protest-in-london/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX01UMU5VUlBITzAwMDhGQTJTVg",
    date: "2026-09-16",
  },
  {
    outlet: "Boston Globe",
    medium: "Photos",
    description: "AI rivals found rare agreement on safety. Putting it into practice is harder.",
    url: "https://www.bostonglobe.com/2026/09/16/business/ai-slowdown-safety/",
    date: "2026-09-16",
  },
  {
    outlet: "Vox",
    medium: "Photos",
    description: "Should we be skeptical about the AI panic?",
    url: "https://www.vox.com/podcasts/502875/ai-existential-risk-jacob-coxon-anthropic-dario-amodei",
    date: "2026-09-16",
  },
  {
    outlet: "Manchester Evening News",
    medium: "Photos",
    description: "King Charles to issue 'deeply concerning' message to AI leaders after doomsday warnings",
    url: "https://www.manchestereveningnews.co.uk/news/uk-news/king-charles-issue-deeply-concerning-34629383",
    date: "2026-09-17",
  },
  {
    outlet: "Daily Sabah",
    medium: "Photos",
    description: "From hallucinations to wiping out humanity: How AI's path advanced",
    url: "https://www.dailysabah.com/business/tech/from-hallucinations-to-wiping-out-humanity-how-ai-path-advanced",
    date: "2026-09-17",
  },
  {
    outlet: "International Business Times",
    medium: "Article",
    description: "'10% Chance of Extinction': AI Protesters Take Scientists' Warning to Downing Street",
    url: "https://www.ibtimes.co.uk/london-protesters-demand-tougher-advanced-ai-controls-1820296",
    date: "2026-09-17",
  },
];

// Merges the homepage's text-press marquee data with the broadcast/photo/
// wire list above into one dated table for the /press page. Undated items
// (most links are blocked to automated date lookups — Facebook/Instagram/
// YouTube/X SPA shells, paywalls, wire-agency sites) sort after every
// dated item, in their original list order.
export const allCoverage: CoverageItem[] = [
  ...news.map((item): CoverageItem => ({
    outlet: item.logoAlt,
    medium: "Article",
    description: item.title,
    url: item.url,
    date: item.date,
  })),
  ...broadcastCoverage,
].sort((a, b) => {
  if (a.date && b.date) return b.date.localeCompare(a.date);
  if (a.date) return -1;
  if (b.date) return 1;
  return 0;
});
