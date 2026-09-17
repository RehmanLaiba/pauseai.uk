export type CoverageItem = {
  outlet: string;
  title: string;
  medium: "Article" | "Video" | "Photos";
  /** Single-link items set this. Multi-platform items (the same clip/story
      cross-posted) set `links` instead and leave this undefined. */
  url?: string;
  /** For a story cross-posted across platforms: one row showing each
      platform as its own link, e.g. "Instagram, X, YouTube". */
  links?: { label: string; url: string }[];
  /** Publish date, YYYY-MM-DD. Drives sort order on the /press coverage
      table; undated items sort to the bottom. */
  date?: string;
  logoSrc?: string;
  logoHtml?: string;
  /** Desktop render height in px. Chosen per logo so every mark carries
      roughly equal visual area (height ∝ 1/√aspect-ratio): wide wordmarks
      get shorter, square marks get taller. Defaults to 44 in CSS. */
  logoHeight?: number;
  /** Intrinsic pixel dimensions of logoSrc (its viewBox/natural size, not
      the rendered size) — required by next/image for aspect ratio; actual
      display size is still driven by the logoHeight CSS var. */
  logoIntrinsicWidth?: number;
  logoIntrinsicHeight?: number;
  /** Show this item's logo in the homepage marquee carousel. Only set for
      outlets with a strong, recognizable, official logo asset — an item
      with no logoSrc/logoHtml can never appear there regardless of this
      flag. Each outlet should carry at most one `true` so the carousel
      doesn't repeat the same mark. */
  inCarousel?: boolean;
};

const ALL_COVERAGE: CoverageItem[] = [
  {
    logoSrc: "/images/media-coverage/Financial_Times_corporate_logo.svg",
    outlet: "Financial Times",
    logoHeight: 56,
    logoIntrinsicWidth: 228,
    logoIntrinsicHeight: 311,
    title: "Peter Kyle agreed to include 'more positive language' in AI speech after Mandelson's advice",
    url: "https://www.ft.com/content/1b3e3117-b979-4187-b983-c785d230c09b",
    medium: "Article",
    inCarousel: true,
  },
  {
    logoSrc: "/images/media-coverage/Wired_logo.svg",
    outlet: "Wired Italia",
    logoHeight: 35,
    logoIntrinsicWidth: 125,
    logoIntrinsicHeight: 25,
    title: "Movements against AI are growing — inside the groups trying to stop it",
    url: "https://www.wired.it/article/movimenti-contro-intelligenza-artificiale-mappa-nomi-pauseai-stopai-controlai/",
    date: "2026-05-30",
    medium: "Article",
    inCarousel: true,
  },
  {
    logoSrc: "/images/media-coverage/Cosmopolitan_logo.svg",
    outlet: "Cosmopolitan Italia",
    logoHeight: 33,
    logoIntrinsicWidth: 600,
    logoIntrinsicHeight: 106,
    title: "Gen Z is losing faith in AI — and protest movements are growing",
    url: "https://www.cosmopolitan.com/it/lifecoach/news-attualita/a71455730/gen-z-paura-intelligenza-artificiale-ansia/",
    date: "2026-06-02",
    medium: "Article",
    inCarousel: true,
  },
  {
    logoSrc: "/images/media-coverage/Gizmodo_logo.svg",
    outlet: "Gizmodo",
    logoHeight: 33,
    logoIntrinsicWidth: 186,
    logoIntrinsicHeight: 36,
    title: "The OpenAI–Anthropic Cold War Comes to Illinois",
    url: "https://gizmodo.com/the-openai-anthropic-cold-war-comes-to-illinois-2000746324",
    date: "2026-04-14",
    medium: "Article",
    inCarousel: true,
  },
  {
    logoSrc: "/images/media-coverage/wall-street-journal-logo.png",
    outlet: "Wall Street Journal",
    logoHeight: 26,
    logoIntrinsicWidth: 777,
    logoIntrinsicHeight: 67,
    title: "AI Giants Go on Charm Offensive to Avert Public Backlash",
    url: "https://www.wsj.com/tech/ai/ai-companies-public-relations-ae312d79",
    date: "2026-04-07",
    medium: "Article",
    inCarousel: true,
  },
  {
    logoSrc: "/images/media-coverage/Business_Insider_Logo.svg",
    outlet: "Business Insider",
    logoHeight: 43,
    logoIntrinsicWidth: 103,
    logoIntrinsicHeight: 32,
    title: "Protesters accuse Google DeepMind of breaking AI safety promises",
    url: "https://www.businessinsider.com/protesters-accuse-google-deepmind-breaking-promises-ai-safety-2025-6",
    date: "2025-06-30",
    medium: "Article",
    inCarousel: true,
  },
  {
    logoSrc: "/images/media-coverage/Time_Magazine_logo.svg",
    outlet: "TIME",
    logoHeight: 42,
    logoIntrinsicWidth: 298,
    logoIntrinsicHeight: 92,
    title: "60 U.K. lawmakers accuse Google of breaking AI safety pledge",
    url: "https://time.com/7313320/google-deepmind-gemini-ai-safety-pledge/",
    date: "2025-08-29",
    medium: "Article",
    inCarousel: true,
  },
  {
    logoSrc: "/images/media-coverage/Fortune_magazine_logo.svg",
    outlet: "Fortune",
    logoHeight: 37,
    logoIntrinsicWidth: 90,
    logoIntrinsicHeight: 21,
    title: "Lawmakers press Google DeepMind over delayed safety report",
    url: "https://fortune.com/2025/08/29/british-lawmakers-accuse-google-deepmind-of-breach-of-trust-over-delayed-gemini-2-5-pro-safety-report/",
    date: "2025-08-29",
    medium: "Article",
    inCarousel: true,
  },
  {
    logoSrc: "/images/media-coverage/MIT_Technology_Review_modern_logo.svg",
    outlet: "MIT Technology Review",
    logoHeight: 54,
    logoIntrinsicWidth: 184,
    logoIntrinsicHeight: 92,
    title: "I checked out one of the biggest anti-AI protests yet",
    url: "https://www.technologyreview.com/2026/03/02/1133814/i-checked-out-londons-biggest-ever-anti-ai-protest/",
    date: "2026-03-02",
    medium: "Article",
    inCarousel: true,
  },
  {
    logoSrc: "/images/media-coverage/The_Guardian_Logo.svg",
    outlet: "The Guardian",
    logoHeight: 44,
    logoIntrinsicWidth: 295,
    logoIntrinsicHeight: 97,
    title: "UK arts must not be sacrificed for speculative AI gains, peers say",
    url: "https://www.theguardian.com/technology/2026/mar/06/uk-arts-must-not-be-sacrificed-for-speculative-ai-gains-peers-say",
    date: "2026-03-06",
    medium: "Article",
    inCarousel: true,
  },
  {
    logoSrc: "/images/media-coverage/the-observer-logo.svg",
    outlet: "The Observer",
    logoHeight: 30,
    logoIntrinsicWidth: 980,
    logoIntrinsicHeight: 157,
    title: "Endgame: Can we live with Artificial General Intelligence? - The People vs AI",
    url: "https://lnk.to/5cnSAU",
    date: "2026-06-10",
    medium: "Article",
    inCarousel: true,
  },
  {
    logoSrc: "/images/media-coverage/BBC_Logo_2021.svg",
    outlet: "BBC",
    logoHeight: 40,
    logoIntrinsicWidth: 560,
    logoIntrinsicHeight: 160,
    title: "Hundreds of people march for tighter controls on AI",
    url: "https://youtu.be/-0CRojvk1FE?t=146",
    date: "2026-02-28",
    medium: "Video",
    inCarousel: true,
  },
  {
    logoSrc: "/images/media-coverage/The_Independent_Logo.png",
    outlet: "The Independent",
    logoHeight: 26,
    logoIntrinsicWidth: 540,
    logoIntrinsicHeight: 38,
    title: "Pro-human AI declaration gains diverse support amid calls for stronger safety measures",
    url: "https://www.independent.co.uk/tech/ai-safety-declaration-steve-bannon-b2932570.html",
    date: "2026-03-05",
    medium: "Article",
    inCarousel: true,
  },
  {
    logoSrc: "/images/media-coverage/Futurism_Logo.svg",
    outlet: "Futurism",
    logoHeight: 33,
    logoIntrinsicWidth: 489,
    logoIntrinsicHeight: 93,
    title: "The rage at OpenAI has grown so immense that there are entire protests against it",
    url: "https://futurism.com/artificial-intelligence/rage-openai-protests",
    date: "2026-03-05",
    medium: "Article",
    inCarousel: true,
  },
  {
    logoSrc: "/images/media-coverage/Real_Media_Logo.png",
    outlet: "Real Media",
    logoHeight: 52,
    logoIntrinsicWidth: 94,
    logoIntrinsicHeight: 83,
    title: "Pull the plug — Pause AI: a timely call for urgent regulation",
    url: "https://realmedia.press/pull-the-plug",
    date: "2026-03-06",
    medium: "Article",
  },
  {
    logoHtml: '<span class="news-logo-text news-logo-text--swlondoner"><span class="sw">SW</span>Londoner</span>',
    outlet: "SW Londoner",
    title: "Pressing pause on AI: London activists to march in largest AI safety protest yet",
    url: "https://www.swlondoner.co.uk/news/27022026-pressing-pause-on-ai-london-activists-to-march-in-largest-ai-safety-protest-yet",
    date: "2026-02-27",
    medium: "Article",
  },
  {
    logoSrc: "/images/media-coverage/Politis_Logo.png",
    outlet: "Politis",
    logoHeight: 43,
    logoIntrinsicWidth: 180,
    logoIntrinsicHeight: 58,
    title: "L'image : à Londres, une marche contre l'IA",
    url: "https://www.politis.fr/articles/2026/03/limage-a-londres-une-marche-contre-lia/",
    date: "2026-03-03",
    medium: "Article",
  },
  {
    logoSrc: "/images/media-coverage/Daily_Mail_masthead.svg",
    outlet: "Daily Mail",
    logoHeight: 31,
    logoIntrinsicWidth: 1000,
    logoIntrinsicHeight: 158,
    title: "When given a choice, AI opts for self-preservation over human life — and that should terrify us all",
    url: "https://www.dailymail.com/debate/article-16032063/AI-opts-self-preservation-human-life.html",
    date: "2026-08-05",
    medium: "Article",
    inCarousel: true,
  },
  {
    logoSrc: "/images/media-coverage/New_Statesman_magazine_logo.svg",
    outlet: "New Statesman",
    logoHeight: 30,
    logoIntrinsicWidth: 524,
    logoIntrinsicHeight: 80,
    title: "The anti-AI revolt is here",
    url: "https://www.newstatesman.com/politics/society/2026/08/the-anti-ai-revolt-is-here",
    date: "2026-08-19",
    medium: "Article",
    inCarousel: true,
  },
  {
    logoSrc: "/images/media-coverage/Channel_4_logo.svg",
    outlet: "Channel 4",
    logoHeight: 56,
    logoIntrinsicWidth: 178,
    logoIntrinsicHeight: 240,
    title: "Hundreds of protesters rally against AI outside Downing Street",
    url: "https://www.channel4.com/news/hundreds-of-protesters-rally-against-ai-outside-downing-street",
    date: "2026-09-16",
    medium: "Article",
    inCarousel: true,
  },
  {
    logoSrc: "/images/media-coverage/ITV_logo.svg",
    outlet: "ITV",
    logoHeight: 46,
    logoIntrinsicWidth: 1000,
    logoIntrinsicHeight: 368,
    title: "Science Correspondent breaks down the 'terrifying' risks of superintelligent AI",
    url: "https://www.youtube.com/watch?v=cvMRaa6h8tM&t=486s",
    date: "2026-09-16",
    medium: "Video",
    inCarousel: true,
  },
  {
    logoSrc: "/images/media-coverage/Channel_4_logo.svg",
    outlet: "Channel 4",
    logoHeight: 56,
    logoIntrinsicWidth: 178,
    logoIntrinsicHeight: 240,
    title: "The danger of AI and the global race to control it - explained",
    url: "https://www.youtube.com/watch?v=rDb5qlSAmvQ&t=249s",
    date: "2026-09-17",
    medium: "Video",
    // Channel 4 already has a marquee slot above (its direct protest
    // coverage) — skip a second logo for the same outlet.
  },
  {
    outlet: "Channel 4",
    medium: "Video",
    title: "PauseAI activists stage emergency protest outside Downing Street",
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
    title: "Protesters demand pause on AI development",
    links: [
      { label: "Instagram", url: "https://www.instagram.com/p/DdWzB4Gxkv_/" },
      { label: "YouTube", url: "https://www.youtube.com/shorts/TFxdevKHM8s" },
    ],
    date: "2026-09-16",
  },
  {
    outlet: "ITV",
    medium: "Video",
    title: "Why is AI safety back in the spotlight",
    url: "https://www.youtube.com/shorts/rkgvZRnoytA",
    date: "2026-09-16",
  },
  {
    outlet: "Al Arabiya",
    medium: "Video",
    title: "Activists gather outside Downing Street in London, calling on governments to pause AI development",
    url: "https://www.instagram.com/p/DdWvDuejvh7/",
    date: "2026-09-16",
  },
  {
    outlet: "Imago Images",
    medium: "Photos",
    title: "Pause AI, urging the government to limit the development of artificial intelligence amid warnings that it could lead to human extinction",
    url: "https://www.imago-images.com/st/0867004406",
    date: "2026-09-16",
  },
  {
    outlet: "Reuters Connect (Anadolu Agency)",
    medium: "Photos",
    title: "PauseAI activists stage emergency protest outside Downing Street in London",
    url: "https://www.reutersconnect.com/item/pauseai-activists-stage-emergency-protest-outside-downing-street-in-london/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX01UMUFOQURMMDAwTkZPN1hH",
    date: "2026-09-16",
  },
  {
    outlet: "Reuters Connect (Zuma Press)",
    medium: "Photos",
    title: "Pause AI Protest Outside Downing Street",
    url: "https://www.reutersconnect.com/item/pause-ai-protest-outside-downing-street/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX01UMVpVTUEwMDBGRzlOVEs",
    date: "2026-09-16",
  },
  {
    outlet: "Reuters Connect (Nurphoto)",
    medium: "Photos",
    title: "Pause AI Emergency Protest In London",
    url: "https://www.reutersconnect.com/item/pause-ai-emergency-protest-in-london/dGFnOnJldXRlcnMuY29tLDIwMjY6bmV3c21sX01UMU5VUlBITzAwMDhGQTJTVg",
    date: "2026-09-16",
  },
  {
    outlet: "Boston Globe",
    medium: "Photos",
    title: "AI rivals found rare agreement on safety. Putting it into practice is harder.",
    url: "https://www.bostonglobe.com/2026/09/16/business/ai-slowdown-safety/",
    date: "2026-09-16",
  },
  {
    outlet: "Vox",
    medium: "Photos",
    title: "Should we be skeptical about the AI panic?",
    url: "https://www.vox.com/podcasts/502875/ai-existential-risk-jacob-coxon-anthropic-dario-amodei",
    date: "2026-09-16",
  },
  {
    outlet: "Manchester Evening News",
    medium: "Photos",
    title: "King Charles to issue 'deeply concerning' message to AI leaders after doomsday warnings",
    url: "https://www.manchestereveningnews.co.uk/news/uk-news/king-charles-issue-deeply-concerning-34629383",
    date: "2026-09-17",
  },
  {
    outlet: "Daily Sabah",
    medium: "Photos",
    title: "From hallucinations to wiping out humanity: How AI's path advanced",
    url: "https://www.dailysabah.com/business/tech/from-hallucinations-to-wiping-out-humanity-how-ai-path-advanced",
    date: "2026-09-17",
  },
  {
    outlet: "International Business Times",
    medium: "Article",
    title: "'10% Chance of Extinction': AI Protesters Take Scientists' Warning to Downing Street",
    url: "https://www.ibtimes.co.uk/london-protesters-demand-tougher-advanced-ai-controls-1820296",
    date: "2026-09-17",
  },
];

// Full, dated table for the /press page — newest first, undated items
// (most social/wire links are blocked to automated date lookups) sorted
// to the bottom in their original list order.
export const allCoverage: CoverageItem[] = [...ALL_COVERAGE].sort((a, b) => {
  if (a.date && b.date) return b.date.localeCompare(a.date);
  if (a.date) return -1;
  if (b.date) return 1;
  return 0;
});

// The homepage marquee's curated subset — only outlets with a strong,
// recognizable logo (`inCarousel: true`), one slot per outlet. Desktop:
// 2 rows. Mobile (handled in page.tsx): 3 rows so each row is shorter and
// easier to scan on a narrow viewport.
const CAROUSEL_ITEMS = ALL_COVERAGE.filter((item) => item.inCarousel);
const desktopSplit = Math.ceil(CAROUSEL_ITEMS.length / 2);
const mobileSplit = Math.ceil(CAROUSEL_ITEMS.length / 3);

export const newsRow1 = CAROUSEL_ITEMS.slice(0, desktopSplit);
export const newsRow2 = CAROUSEL_ITEMS.slice(desktopSplit);

export const newsMobileRow1 = CAROUSEL_ITEMS.slice(0, mobileSplit);
export const newsMobileRow2 = CAROUSEL_ITEMS.slice(mobileSplit, mobileSplit * 2);
export const newsMobileRow3 = CAROUSEL_ITEMS.slice(mobileSplit * 2);
