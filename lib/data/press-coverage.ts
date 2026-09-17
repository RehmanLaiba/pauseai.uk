import { news } from "./news";

export type CoverageItem = {
  outlet: string;
  medium: "Video" | "Photos" | "Article";
  description?: string;
  url: string;
  /** Publish date, YYYY-MM-DD. Drives sort order on the /press coverage
      table; undated items sort to the bottom. */
  date?: string;
};

export const broadcastCoverage: CoverageItem[] = [
  {
    outlet: "Channel 4",
    medium: "Video",
    description: "Facebook reel (different footage from the news broadcast segment)",
    url: "https://www.facebook.com/reel/1522309576272007/?mibextid=wwXIfr&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2Fr%2F1JywPj1GsN%2F%3Fmibextid%3DwwXIfr&rdid=xoT0pg0hRvcJe2hY",
  },
  {
    outlet: "Channel 4",
    medium: "Video",
    // was: "YouTube Short (same footage as the Facebook reel)"
    description: "PauseAI activists stage emergency protest outside Downing Street",
    url: "https://www.youtube.com/shorts/2JRtI-dDwgc",
  },
  {
    outlet: "Channel 4",
    medium: "Video",
    // was: "X post"
    description: "Protesters gathered at Downing Street, urging tougher action and a pause in the development of advanced AI systems. They warned that humanity could lose control of increasingly powerful technology if regulation does not happen soon.",
    url: "https://x.com/Channel4News/status/2100298598772605015",
  },
  {
    outlet: "ITV",
    medium: "Video",
    description: "Instagram",
    url: "https://www.instagram.com/p/DdWzB4Gxkv_/?l=1&ig_mid=20BE556A-84A8-4926-A5D3-B53F02F6F2AC&utm_source=igweb",
  },
  {
    outlet: "ITV",
    medium: "Video",
    // was: "YouTube Short (same footage as the Instagram post)"
    description: "Protesters demand pause on AI development",
    url: "https://www.youtube.com/shorts/TFxdevKHM8s",
  },
  {
    outlet: "ITV",
    medium: "Video",
    // was: "YouTube Short, minute 1:30–1:35 (different footage)"
    description: "Why is AI safety back in the spotlight",
    url: "https://www.youtube.com/shorts/rkgvZRnoytA",
  },
  {
    outlet: "Al Arabiya",
    medium: "Video",
    description: "Instagram",
    url: "https://www.instagram.com/p/DdWvDuejvh7/",
  },
  {
    outlet: "Imago Images",
    medium: "Photos",
    url: "https://www.imago-images.com/st/0867004406",
  },
  {
    outlet: "Reuters Connect (Anadolu Agency)",
    medium: "Photos",
    url: "https://www.reutersconnect.com/item/pauseai-activists-stage-emergency-protest-outside-downing-street-in-london/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX01UMUFOQURMMDAwTkZPN1hH",
  },
  {
    outlet: "Reuters Connect (Zuma Press)",
    medium: "Photos",
    url: "https://www.reutersconnect.com/item/pause-ai-protest-outside-downing-street/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX01UMVpVTUEwMDBGRzlOVEs",
  },
  {
    outlet: "Reuters Connect (Nurphoto)",
    medium: "Photos",
    url: "https://www.reutersconnect.com/item/pause-ai-emergency-protest-in-london/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX01UMU5VUlBITzAwMDhGQTJTVg",
  },
  {
    outlet: "Boston Globe",
    medium: "Photos",
    // was: "Used as the picture for their article"
    description: "AI rivals found rare agreement on safety. Putting it into practice is harder.",
    url: "https://www.bostonglobe.com/2026/09/16/business/ai-slowdown-safety/",
  },
  {
    outlet: "Vox",
    medium: "Photos",
    description: "Used as the picture for their article",
    url: "https://www.vox.com/podcasts/502875/ai-existential-risk-jacob-coxon-anthropic-dario-amodei",
  },
  {
    outlet: "Manchester Evening News",
    medium: "Photos",
    description: "Used as the picture for their article",
    url: "https://www.manchestereveningnews.co.uk/news/uk-news/king-charles-issue-deeply-concerning-34629383",
  },
  {
    outlet: "Daily Sabah",
    medium: "Photos",
    // was: "Used as the picture for their article"
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
